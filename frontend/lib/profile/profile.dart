import 'package:flutter/material.dart';
import '../nav_bar/nav_bar.dart';
import '../services/secure_storage_service.dart';
import 'personal_information_page.dart';
import 'vehicle_information_profile.dart';
import 'accepted_completed_jobs_page.dart';
import 'status_performance_page.dart';
import 'legal_terms_page.dart';
import 'settings_page.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}
class _ProfileScreenState extends State<ProfileScreen> {
  final int _selectedTabIndex = 3; // Set to 3 for Profile tab

  void _onNavBarItemTapped(int index) {
    if (index == _selectedTabIndex) {
      return; // Don't navigate if already on the page
    }

    switch (index) {
      case 0: // Home
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 1: // Calendar
        Navigator.pushReplacementNamed(context, '/calendar');
        break;
      case 2: // Ongoing Jobs
        Navigator.pushReplacementNamed(context, '/ongoing-jobs');
        break;
      case 3: // Profile - already on profile page
        break;
    }
  }

  Widget _buildProfileOption({
    required String title,
    required IconData icon,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Color(0xFFD0A9F5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(icon, color: Colors.black),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            color: Colors.black,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.black),
        onTap: onTap,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFEDE1FF),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Profile',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: SingleChildScrollView(
          child: Column(
            children: [
              const SizedBox(height: 20),
              // Profile Image and Name
              Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.purple[700]!, width: 2),
                    ),
                    child: Center(
                      child: Icon(Icons.person_outline,
                          size: 50, color: Colors.black),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Driver Name',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'drivername@gmail.com',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
              // Profile Options in Container with margin and border
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.purple.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Column(
                  children: [
                    _buildProfileOption(
                      title: 'Personal Information',
                      icon: Icons.person_outline,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const PersonalInformationPage(),
                          ),
                        );
                      },
                    ),
                    _buildProfileOption(
                      title: 'Vehicle Information',
                      icon: Icons.directions_car_outlined,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const VehicleInformationProfile(),
                          ),
                        );
                      },
                    ),
                    _buildProfileOption(
                      title: 'Accepted and Completed Jobs',
                      icon: Icons.work_outline,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const AcceptedCompletedJobsPage(),
                          ),
                        );
                      },
                    ),
                    _buildProfileOption(
                      title: 'Status and Performance',
                      icon: Icons.analytics_outlined,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const StatusPerformancePage(),
                          ),
                        );
                      },
                    ),
                    _buildProfileOption(
                      title: 'Legal and Terms',
                      icon: Icons.description_outlined,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const LegalTermsPage(),
                          ),
                        );
                      },
                    ),
                    _buildProfileOption(
                      title: 'Settings',
                      icon: Icons.settings_outlined,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SettingsPage(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32), // Increased spacing
              // Add Logout Button
              ElevatedButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        title: Text('Logout'),
                        content: Text('Are you sure you want to logout?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text('Cancel'),
                          ),
                          TextButton(
                            onPressed: () async {
                              // Clear the stored token
                              await SecureStorageService.deleteToken();
                              // Navigate to welcome page and clear navigation stack
                              if (context.mounted) {
                                Navigator.pushNamedAndRemoveUntil(
                                  context,
                                  '/',
                                  (route) => false,
                                );
                              }
                            },
                            child: Text('Logout'),
                          ),
                        ],
                      );
                    },
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.red[400],
                  padding: EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 2, // Added slight elevation for better visibility
                ),
                child: Text(
                  'Logout',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 20), // Bottom padding
            ],
          ),
        ),
      ),
      bottomNavigationBar: CustomNavBar(
        selectedIndex: _selectedTabIndex,
        onItemTapped: _onNavBarItemTapped,
      ),
    );
  }
}