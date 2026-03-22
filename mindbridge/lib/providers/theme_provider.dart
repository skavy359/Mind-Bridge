import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeProvider(bool? isDarkMode) {
    if (isDarkMode == null) {
      _themeMode = ThemeMode.system;
    } else {
      _themeMode = isDarkMode ? ThemeMode.dark : ThemeMode.light;
    }
  }

  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    final prefs = await SharedPreferences.getInstance();
    
    if (mode == ThemeMode.system) {
      await prefs.remove('isDarkMode');
    } else {
      await prefs.setBool('isDarkMode', mode == ThemeMode.dark);
    }
    
    notifyListeners();
  }

  Future<void> toggleTheme() async {
    if (_themeMode == ThemeMode.light) {
      await setThemeMode(ThemeMode.dark);
    } else {
      await setThemeMode(ThemeMode.light);
    }
  }
}