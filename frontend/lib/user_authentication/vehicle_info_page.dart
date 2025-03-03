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