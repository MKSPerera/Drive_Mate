import 'package:flutter/material.dart';

class AcceptedCompletedJobsPage extends StatefulWidget {
  const AcceptedCompletedJobsPage({super.key});

  @override
  _AcceptedCompletedJobsPageState createState() => _AcceptedCompletedJobsPageState();
}

class _AcceptedCompletedJobsPageState extends State<AcceptedCompletedJobsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // Sample job data - in a real app, you would fetch this from your backend
  final List<Map<String, dynamic>> acceptedJobs = [
    {
      'title': 'Airport Pickup',
      'date': '2023-10-15',
      'time': '14:30',
      'location': 'JFK Airport',
      'payment': '45',
      'status': 'accepted',
    },
    {
      'title': 'Corporate Event Transport',
      'date': '2023-10-20',
      'time': '09:00',
      'location': 'Downtown Convention Center',
      'payment': '60',
      'status': 'accepted',
    },
  ];

  final List<Map<String, dynamic>> completedJobs = [
    {
      'title': 'Wedding Transport',
      'date': '2023-09-25',
      'time': '16:00',
      'location': 'Grand Plaza Hotel',
      'payment': '75',
      'status': 'completed',
      'completedDate': '2023-09-25',
    },
    {
      'title': 'City Tour',
      'date': '2023-09-18',
      'time': '10:00',
      'location': 'Central Park',
      'payment': '55',
      'status': 'completed',
      'completedDate': '2023-09-18',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }