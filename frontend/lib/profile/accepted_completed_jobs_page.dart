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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEDE1FF),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'My Jobs',
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
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF65469C),
          labelColor: Colors.black,
          tabs: const [
            Tab(text: 'Accepted'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildJobList(acceptedJobs, 'accepted'),
          _buildJobList(completedJobs, 'completed'),
        ],
      ),
    );
  }

  Widget _buildJobList(List<Map<String, dynamic>> jobs, String type) {
    if (jobs.isEmpty) {
      return Center(
        child: Text(
          'No $type jobs found',
          style: const TextStyle(fontSize: 16, color: Colors.black54),
        ),
      );
    }
