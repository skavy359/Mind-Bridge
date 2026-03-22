import 'package:appwrite/appwrite.dart';

class AppwriteService {
  static final AppwriteService _instance = AppwriteService._internal();
  factory AppwriteService() => _instance;

  late final Client client;
  late final Account account;
  late final Databases databases;
  late final Storage storage;

  static const String endpoint = 'https://sgp.cloud.appwrite.io/v1'; 
  static const String projectId = '69bea2b00028ecb66757';
  
  static const String databaseId = 'mindbridge_db';
  static const String usersCollectionId = 'users';
  static const String notesCollectionId = 'notes';
  static const String opportunitiesCollectionId = 'opportunities';
  
  static const String storageBucketId = 'notes_bucket';

  AppwriteService._internal() {
    client = Client()
      ..setEndpoint(endpoint)
      ..setProject(projectId)
      ..setSelfSigned(status: true);

    account = Account(client);
    databases = Databases(client);
    storage = Storage(client);
  }
}