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