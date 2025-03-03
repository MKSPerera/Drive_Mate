import 'package:flutter/material.dart';
import 'api_service.dart';

class VehicleInfoPage extends StatefulWidget {
  const VehicleInfoPage({super.key});

  @override
  _VehicleInfoPageState createState() => _VehicleInfoPageState();
}

class _VehicleInfoPageState extends State<VehicleInfoPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _vehicleTypeController = TextEditingController();
  final TextEditingController _vehicleCapacityController =
      TextEditingController();
  final TextEditingController _vehicleLicenseController =
      TextEditingController();
  final ApiService _apiService = ApiService();
  String? _errorMessage;

  Future<void> _signup(Map<String, dynamic> userInfo) async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _errorMessage = null;
      });

      try {
        final completeInfo = {
          ...userInfo,
          'vehicleType': _vehicleTypeController.text,
          'vehicleCapacity': int.parse(_vehicleCapacityController.text),
          'vehicleLicense': _vehicleLicenseController.text,
        };

        await _apiService.registerDriver(completeInfo);
        if (mounted) {
          Navigator.pushNamedAndRemoveUntil(
            context,
            '/home',
            (route) => false,
          );
        }
      } catch (e) {
        setState(() {
          _errorMessage = e.toString();
        });
      }
    }
  }
