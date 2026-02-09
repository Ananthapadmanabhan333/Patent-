import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import 'auth_service.dart';

class UserService {
  final String _baseUrl = AppConstants.apiBaseUrl;
  final AuthService _authService = AuthService();

  // Get current user profile
  Future<Map<String, dynamic>> getUserProfile() async {
    final token = await _authService.getToken();
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/users/me'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load profile');
      }
    } catch (e) {
      print("Error fetching profile: $e");
      rethrow;
    }
  }

  // Update user profile
  Future<Map<String, dynamic>> updateUserProfile(Map<String, dynamic> data) async {
    final token = await _authService.getToken();
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/users/me'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
        body: jsonEncode(data),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to update profile: ${response.body}');
      }
    } catch (e) {
      print("Error updating profile: $e");
      rethrow;
    }
  }

  // Log progress (e.g., weight)
  Future<void> logProgress(String metricType, double value, {String? notes}) async {
    final token = await _authService.getToken();
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/users/me/progress'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
        body: jsonEncode({
          "metric_type": metricType,
          "value": value,
          "notes": notes,
          "date": DateTime.now().toIso8601String().substring(0, 10) // YYYY-MM-DD
        }),
      );

      if (response.statusCode != 200) {
         throw Exception('Failed to log progress: ${response.body}');
      }
    } catch (e) {
      print("Error logging progress: $e");
      rethrow;
    }
  }
  
  // Get progress history
  Future<List<dynamic>> getProgressHistory() async {
    final token = await _authService.getToken();
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/users/me/progress?limit=10'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
         return [];
      }
    } catch (e) {
      print("Error fetching progress: $e");
      return [];
    }
  }
}
