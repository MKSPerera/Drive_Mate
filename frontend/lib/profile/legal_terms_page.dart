import 'package:flutter/material.dart';

class LegalTermsPage extends StatelessWidget {
  const LegalTermsPage({super.key});

   @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEDE1FF),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Legal & Terms',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              'Terms of Service',
              'Last updated: September 30, 2023',
              _termsOfServiceText,
            ),
            const SizedBox(height: 24),
            _buildSection(
              'Privacy Policy',
              'Last updated: September 30, 2023',
              _privacyPolicyText,
            ),
            const SizedBox(height: 24),
            _buildSection(
              'Driver Agreement',
              'Last updated: September 30, 2023',
              _driverAgreementText,
            ),
            const SizedBox(height: 32),
            Center(
              child: ElevatedButton(
                onPressed: () {
                  // Show acceptance dialog
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Terms accepted. Thank you!'),
                      backgroundColor: Color(0xFF65469C),
                    ),
                  );
                },

        
