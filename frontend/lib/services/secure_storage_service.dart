import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'jwt_token';
  static const _driverIdKey = 'driver_id';

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

  // Store driver ID
  static Future<void> storeDriverId(String driverId) async {
    await _storage.write(key: _driverIdKey, value: driverId);
  }

  // Retrieve driver ID
  static Future<String?> getDriverId() async {
    return await _storage.read(key: _driverIdKey);
  }

  // Delete driver ID
  static Future<void> deleteDriverId() async {
    await _storage.delete(key: _driverIdKey);
  }

  // Helper function to handle invalid token
  static Future<void> handleInvalidToken() async {
    await deleteToken();
    await deleteDriverId();
  }
}
