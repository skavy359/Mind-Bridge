import 'dart:async';
import 'package:appwrite/appwrite.dart';
import 'package:appwrite/enums.dart';
import 'package:appwrite/models.dart' as models;
import 'appwrite_service.dart';

class User {
  final String uid;
  final String email;
  final String displayName;
  final String? photoURL;
  User({required this.uid, required this.email, required this.displayName, this.photoURL});
}

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;

  final Account _account = AppwriteService().account;
  
  final StreamController<User?> _authStateController = StreamController<User?>.broadcast();
  User? _currentUser;

  AuthService._internal() {
    _checkAuthStatus();
  }

  User? get currentUser => _currentUser;

  Stream<User?> get authStateChanges async* {
    yield _currentUser;
    yield* _authStateController.stream;
  }

  Future<void> refreshUser() async {
    await _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
      final user = await _account.get();
      _updateUserState(user);
    } catch (e) {
      _updateUserState(null);
    }
  }

  void _updateUserState(models.User? appwriteUser) {
    if (appwriteUser == null) {
      _currentUser = null;
      print('AuthService: User is null (logged out)');
    } else {
      _currentUser = User(
        uid: appwriteUser.$id,
        email: appwriteUser.email,
        displayName: appwriteUser.name,
        photoURL: appwriteUser.prefs.data['photoUrl'],
      );
      print('AuthService: User logged in: ${_currentUser?.email}');
    }
    _authStateController.add(_currentUser);
    print('AuthService: Auth state emitted to stream');
  }

  Future<dynamic> signUpWithEmail(String email, String password, String name) async {
    try {
      final user = await _account.create(
        userId: ID.unique(),
        email: email,
        password: password,
        name: name,
      );
      
      await signInWithEmail(email, password);
      
      await _account.updatePrefs(prefs: {'photoUrl': null});
      
      return user;
    } on AppwriteException catch (e) {
      throw e.message ?? 'An error occurred during sign up';
    }
  }

  Future<dynamic> signInWithEmail(String email, String password) async {
    try {
      try {
        await _account.deleteSession(sessionId: 'current');
      } catch (_) {}

      await _account.createEmailPasswordSession(
        email: email,
        password: password,
      );
      await _checkAuthStatus();
      return true;
    } on AppwriteException catch (e) {
      throw e.message ?? 'An error occurred during sign in';
    }
  }

  Future<dynamic> signInWithGoogle() async {
    try {
      try {
        await _account.deleteSession(sessionId: 'current');
      } catch (_) {}

      await _account.createOAuth2Session(
        provider: OAuthProvider.google,
      );
      await _checkAuthStatus();
      return true;
    } on AppwriteException catch (e) {
      throw 'Google Sign-In failed: ${e.message}';
    }
  }

  Future<void> signOut() async {
    try {
      await _account.deleteSession(sessionId: 'current');
      _updateUserState(null);
    } catch (e) {
      print('Sign out error: $e');
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      await _account.createRecovery(
        email: email,
        url: 'https://mindbridge.app/reset-password',
      );
    } on AppwriteException catch (e) {
      throw e.message ?? 'Failed to send password reset email';
    }
  }
}