import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;
import '../services/secure_storage_service.dart';

class JobService {
  static String get baseUrl {
    // If running on web, use localhost
    if (kIsWeb) {
      return 'http://localhost:3000';
    }
    // If running on Android emulator, use 10.0.2.2
    // If running on physical device, use your computer's IP address
    return 'http://10.0.2.2:3000';
  }

  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await SecureStorageService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<List<Map<String, dynamic>>> getJobs() async {
    try {
      final headers = await _getAuthHeaders();
      print('Fetching jobs from: $baseUrl/jobs'); // Debug print
      print('Headers: ${headers.toString()}'); // Debug auth headers
      
      final response = await http.get(
        Uri.parse('$baseUrl/jobs'),
        headers: headers,
      );

      print('Response status: ${response.statusCode}'); // Debug print
      
      // Only print body if not empty to avoid errors
      if (response.body.isNotEmpty) {
        print('Response body: ${response.body}'); // Debug print
      } else {
        print('Response body is empty');
      }

      if (response.statusCode == 200) {
        if (response.body.isEmpty) {
          // Handle empty response
          return [];
        }
        
        List<dynamic> jobsJson = json.decode(response.body);
        return jobsJson.cast<Map<String, dynamic>>();
      } else if (response.statusCode == 401) {
        // Handle unauthorized - redirect to login
        throw Exception('Please login again');
      } else if (response.statusCode == 500) {
        // Handle server error
        print('Server error 500 received');
        throw Exception('Server error: Please try again later');
      } else {
        // Try to decode error body if possible
        try {
          final errorBody = json.decode(response.body);
          throw Exception(errorBody['message'] ?? 'Failed to load jobs');
        } catch (decodeError) {
          throw Exception('Failed to load jobs: Status ${response.statusCode}');
        }
      }
    } catch (e) {
      print('Error in getJobs: $e'); // Detailed error logging
      if (e is FormatException) {
        throw Exception('Invalid response format from server');
      } else if (e is http.ClientException) {
        throw Exception('Connection error: Please check your internet connection');
      }
      throw Exception('Network error: ${e.toString()}');
    }
  }

  Future<List<Map<String, dynamic>>> getMyJobs() async {
    try {
      final headers = await _getAuthHeaders();
      print('Fetching my jobs from: $baseUrl/jobs/my-jobs'); // Debug print
      print('Headers: ${headers.toString()}'); // Debug auth headers

      final response = await http.get(
        Uri.parse('$baseUrl/jobs/my-jobs'),
        headers: headers,
      );

      print('Response status: ${response.statusCode}'); // Debug print
      
      // Only print body if not empty to avoid errors
      if (response.body.isNotEmpty) {
        print('Response body: ${response.body}'); // Debug print
      } else {
        print('Response body is empty');
      }

      if (response.statusCode == 200) {
        if (response.body.isEmpty) {
          // Handle empty response
          return [];
        }
        
        List<dynamic> jobsJson = json.decode(response.body);
        return jobsJson.cast<Map<String, dynamic>>();
      } else if (response.statusCode == 401) {
        throw Exception('Please login again');
      } else if (response.statusCode == 500) {
        // Handle server error
        print('Server error 500 received');
        throw Exception('Server error: Please try again later');
      } else {
        // Try to decode error body if possible
        try {
          final errorBody = json.decode(response.body);
          throw Exception(errorBody['message'] ?? 'Failed to load jobs');
        } catch (decodeError) {
          throw Exception('Failed to load jobs: Status ${response.statusCode}');
        }
      }
    } catch (e) {
      print('Error in getMyJobs: $e'); // Detailed error logging
      if (e is FormatException) {
        throw Exception('Invalid response format from server');
      } else if (e is http.ClientException) {
        throw Exception('Connection error: Please check your internet connection');
      }
      throw Exception('Network error: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> acceptJob(int jobId) async {
    try {
      final headers = await _getAuthHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/jobs/accept'),
        headers: headers,
        body: json.encode({
          'jobId': jobId,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else {
        throw Exception(
            'Failed to accept job: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      print('Error accepting job: $e'); // Debug print
      throw Exception('Failed to connect to the server: $e');
    }
  }
}
