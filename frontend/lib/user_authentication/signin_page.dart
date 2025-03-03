// signin_page.dart
import 'package:flutter/material.dart';
import 'api_service.dart';
import 'package:http/http.dart' as http;
import '../services/secure_storage_service.dart';

class SignInPage extends StatefulWidget {
  const SignInPage({super.key});

  @override
  _SignInPageState createState() => _SignInPageState();
}

class _SignInPageState extends State<SignInPage> {
  final TextEditingController _contactNumberController =
      TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _testConnection();
  }

  Future<void> _testConnection() async {
    try {
      final response = await http.get(Uri.parse('${ApiService.baseUrl}/test'));
      print('Test connection response: ${response.body}');
    } catch (e) {
      print('Test connection failed: $e');
    }
  }

  Future<void> _signIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (_contactNumberController.text.isEmpty ||
          _passwordController.text.isEmpty) {
        throw Exception('Please enter both contact number and password');
      }

      final response = await _apiService.login(
        _contactNumberController.text.trim(),
        _passwordController.text.trim(),
      );

      if (mounted) {
        if (response['token'] != null) {
          // Store the token
          await SecureStorageService.storeToken(response['token']);
          Navigator.pushReplacementNamed(context, '/home');
        } else {
          setState(() {
            _errorMessage = 'Invalid login response';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
        print('Sign in error: $e'); // Debug log
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

