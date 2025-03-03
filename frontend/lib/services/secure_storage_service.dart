import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'jwt_token';

  // Store JWT token
  static Future<void> storeToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // Retrieve JWT token
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Delete JWT token
  static Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }
} 