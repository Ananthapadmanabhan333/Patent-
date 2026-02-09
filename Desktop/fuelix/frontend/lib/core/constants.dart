import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Hybrid Athlete AI';
  
  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000/api/v1';
    } else {
      return 'http://10.0.2.2:8000/api/v1'; // Android Emulator
    }
  }
}
