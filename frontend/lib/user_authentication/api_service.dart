import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use your computer's IP address if running on a real device
  // Use 10.0.2.2 if running on Android emulator
  // Use localhost if running on web
  static const String baseUrl = 'http://10.0.2.2:3000'; // For Android emulator
  // static const String baseUrl = 'http://localhost:3000';  // For web
  // static const String baseUrl = 'http://YOUR_IP_ADDRESS:3000';  // For physical device

  Future<Map<String, dynamic>> register(
      String firstName,
      String lastName,
      String email,
      String password,
      String confirmPassword,
      String contactNumber) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/drivers'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'confirmPassword': confirmPassword,
          'contactNumber': contactNumber,
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception('Failed to connect to server: $e');
    }
  }

  Future<Map<String, dynamic>> login(
      String contactNumber, String password) async {
    try {
      print('Attempting login with: $contactNumber'); // Debug log

      final response = await http.post(
        Uri.parse('$baseUrl/drivers/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'contactNumber': contactNumber,
          'password': password,
        }),
      );

      print('Response status: ${response.statusCode}'); // Debug log
      print('Response body: ${response.body}'); // Debug log

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Store the token if it exists in the response
        if (responseData['token'] != null) {
          // You might want to store this token for future authenticated requests
          print('Received token: ${responseData['token']}');
        }
        return responseData;
      } else {
        throw Exception(responseData['message'] ?? 'Login failed');
      }
    } catch (e) {
      print('Login error: $e'); // Debug log
      throw Exception('Login failed: $e');
    }
  }

  Future<Map<String, dynamic>> registerDriver(
      Map<String, dynamic> driverData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/drivers'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(driverData),
      );

      if (response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        
        // Verify token exists in response
        if (responseData['token'] == null) {
          throw Exception('Registration successful but no token received');
        }
        
        return responseData;
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Driver registration failed');
      }
    } catch (e) {
      throw Exception('Failed to connect to server: $e');
    }
  }
}
