import 'package:flutter/material.dart';
import 'job_details.dart'; // Import JobDetailsPage
import '../services/job_service.dart';
import '../services/secure_storage_service.dart';

class JobBoard extends StatefulWidget {
  final Function(int) onTabChanged;
  final int selectedTabIndex;

  const JobBoard({
    super.key,
    required this.onTabChanged,
    required this.selectedTabIndex,
  });

  @override
  _JobBoardState createState() => _JobBoardState();
}

class _JobBoardState extends State<JobBoard> {
  final JobService _jobService = JobService();
  List<bool> _expandedPosts = [];
  List<Map<String, dynamic>> availableJobs = [];
  List<Map<String, dynamic>> acceptedJobs = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    try {
      setState(() => isLoading = true);

      // Try to get jobs, but handle potential failures individually
      List<Map<String, dynamic>> allJobs = [];
      List<Map<String, dynamic>> myJobs = [];

      try {
        allJobs = await _jobService.getJobs();
        print('Successfully loaded ${allJobs.length} available jobs');
      } catch (e) {
        print('Error loading available jobs: $e');
        // Continue with empty list rather than failing completely
      }

      try {
        myJobs = await _jobService.getMyJobs();
        print('Successfully loaded ${myJobs.length} accepted jobs');
      } catch (e) {
        print('Error loading my jobs: $e');
        // Continue with empty list rather than failing completely
      }

      if (!mounted) return;

      setState(() {
        // Safely filter jobs, handling potential missing fields
        availableJobs =
            allJobs.where((job) => job['currentState'] == 'PENDING').toList();

        acceptedJobs =
            myJobs.where((job) => job['currentState'] == 'ACCEPTED').toList();

        _expandedPosts = List.generate(
          availableJobs.length + acceptedJobs.length,
          (index) => false,
        );
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      print('Error in _loadJobs: $e'); // Detailed error logging
      setState(() => isLoading = false);

      if (e.toString().contains('Please login again')) {
        // Handle authentication error
        await SecureStorageService.deleteToken();
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/');
        }
      } else {
        // Show error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load jobs: ${e.toString()}'),
            duration: const Duration(seconds: 3),
            action: SnackBarAction(
              label: 'Retry',
              onPressed: () => _loadJobs(),
            ),
          ),
        );
      }
    }
  }

  Future<void> acceptJob(Map<String, dynamic> job) async {
    try {
      // Remove driverId parameter as it will be extracted from token
      await _jobService.acceptJob(job['jobId']);

      // Reload jobs after accepting
      await _loadJobs();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Job accepted successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to accept job: ${e.toString()}')),
      );
    }
  }

  void _onTabChanged(int index) {
    widget.onTabChanged(index); // Call parent callback with new tab index
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          TabBar(
            onTap: _onTabChanged, // Use local method to handle tab changes
            tabs: [
              Tab(text: 'Available'),
              Tab(text: 'Accepted'),
            ],
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                children: [
                  Expanded(
                    child: isLoading
                        ? Center(child: CircularProgressIndicator())
                        : widget.selectedTabIndex == 0
                            ? _buildAvailableJobsList()
                            : _buildAcceptedJobsList(),
                  ),
                  // Add a refresh button at the bottom
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ElevatedButton(
                      onPressed: _loadJobs,
                      child: Text('Refresh Jobs'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailableJobsList() {
    return ListView.builder(
      itemCount: availableJobs.length,
      itemBuilder: (context, index) => _jobPostCard(index, true),
    );
  }

  Widget _buildAcceptedJobsList() {
    return ListView.builder(
      itemCount: acceptedJobs.length,
      itemBuilder: (context, index) => _jobPostCard(index, false),
    );
  }

  Widget _jobPostCard(int index, bool isAvailable) {
    final job = isAvailable ? availableJobs[index] : acceptedJobs[index];
    final cardIndex = isAvailable ? index : index + availableJobs.length;

    // Convert ISO date strings to DateTime objects for display
    final startDate = DateTime.parse(job['startDate']);
    final endDate = DateTime.parse(job['endDate']);

    return Container(
      margin: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Color(0xFFD0A9F5),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Client: ${job['clientName']}',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
          ),
          if (_expandedPosts[cardIndex]) ...[
            Text('Nationality: ${job['nationality']}'),
            Text('Passengers: ${job['numberOfPassengers']}'),
            Text('Distance: ${job['distance']} km'),
            Text('Payment: \$${job['paymentAmount']}'),
            Text('Start Date: ${_formatDate(startDate)}'),
            Text('End Date: ${_formatDate(endDate)}'),
            Text(
                'Details: ${job['additionalDetails'] ?? 'No additional details'}'),
            SizedBox(height: 16),
            if (isAvailable)
              ElevatedButton(
                onPressed: () => acceptJob(job),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: Text('Accept'),
              )
            else
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: Text('Cancel Job'),
                            content: Text(
                                'Are you sure you want to cancel this job?'),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: Text('No'),
                              ),
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    acceptedJobs.remove(job);
                                    job['currentState'] = 'PENDING';
                                    availableJobs.add(job);
                                  });
                                  Navigator.of(context).pop();
                                },
                                child: Text('Yes'),
                              ),
                            ],
                          );
                        },
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                    ),
                    child: Text('Cancel'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => JobDetailsPage(
                            job: {
                              'title': 'Job Title',
                              'description': 'Job description goes here...',
                              'date':
                                  DateTime.now().add(const Duration(days: 2)),
                              'time': '10:00 AM - 2:00 PM',
                              'location': '123 Main St, City, State',
                              'distance': '5.2 miles',
                              'payment': '\$45.00',
                              'clientName': 'John Doe',
                              'clientPhone': '(555) 123-4567',
                              'clientRating': 4.8,
                              'status': 'Pending',
                            },
                          ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                    child: Text('View Job'),
                  ),
                ],
              ),
          ],
          Align(
            alignment: Alignment.bottomRight,
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Colors.black),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: () {
                setState(() {
                  _expandedPosts[cardIndex] = !_expandedPosts[cardIndex];
                });
              },
              child: Text(
                _expandedPosts[cardIndex] ? 'Less details' : 'More details...',
                style: TextStyle(color: Colors.black),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}
