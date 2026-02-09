import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';

import 'auth_service.dart';

class CoachService {
  final String _baseUrl = AppConstants.apiBaseUrl;
  final AuthService _authService = AuthService();

  Future<String> sendMessage(String message) async {
    final token = await _authService.getToken();
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/coach/chat?message=$message'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['recommendation'] ?? "I'm listening.";
      } else {
        print("Coach API Error: ${response.statusCode} - ${response.body}");
        return "I'm having trouble connecting to my brain. (Error: ${response.statusCode})";
      }
    } catch (e) {
      print("Coach Network Error: $e");
      return "Connection error: $e";
    }
  }

  // Fetch chat history
  Future<List<Map<String, dynamic>>> fetchChatHistory() async {
    final token = await _authService.getToken();
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/coach/history?limit=20'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> messages = data['messages'];
        
        List<Map<String, dynamic>> uiMessages = [];
        for (var msg in messages) {
           // Add User message
           uiMessages.add({
             'text': msg['user_message'],
             'isMe': true
           });
           // Add AI response
           uiMessages.add({
             'text': msg['ai_response'],
             'isMe': false
           });
        }
        return uiMessages.reversed.toList(); 
        
      } else {
        return [];
      }
    } catch (e) {
      print("Error fetching chat history: $e");
      return [];
    }
  }
}
