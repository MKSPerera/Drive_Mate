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

@override
  Widget build(BuildContext context) {
    final userInfo =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;

    return Scaffold(
      backgroundColor: Color(0xFFD0A9F5),
      appBar: AppBar(
        backgroundColor: Color(0xFFD0A9F5),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Vehicle Details',
                  style: TextStyle(
                    color: Color(0xFF65469C),
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _vehicleTypeController,
                  decoration: InputDecoration(
                    labelText: 'Vehicle Type',
                    labelStyle: const TextStyle(color: Color.fromARGB(255, 76, 76, 76)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.3),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  style: const TextStyle(color: Color(0xFF65469C)),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your vehicle type';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _vehicleCapacityController,
                  decoration: InputDecoration(
                    labelText: 'Vehicle Capacity',
                    labelStyle: const TextStyle(color: Color.fromARGB(255, 76, 76, 76)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.3),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Color(0xFF65469C)),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter vehicle capacity';
                    }
                    if (int.tryParse(value) == null) {
                      return 'Please enter a valid number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _vehicleLicenseController,
                  decoration: InputDecoration(
                    labelText: 'License Plate Number',
                    labelStyle: const TextStyle(color: Color.fromARGB(255, 76, 76, 76)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.3),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  style: const TextStyle(color: Color(0xFF65469C)),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter license plate number';
                    }
                    return null;
                  },
                ),
                