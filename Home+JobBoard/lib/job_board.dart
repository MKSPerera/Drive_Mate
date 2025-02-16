import 'package:flutter/material.dart';
import 'job_details.dart'; // Import JobDetailsPage

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
  final List<bool> _expandedPosts = List.generate(4, (index) => false);
  List<Map<String, String>> availableJobs = [
    {
      'title': 'Agency name: 14 day Tour for a Family of 4',
      'country': 'USA',
      'noOfPassengers': '4',
      'distance': '500 miles',
      'price': '\$3000',
      'startDate': '10.01.2025',
      'endDate': '24.01.2025',
    },
    {
      'title': 'Luxury Europe Trip for Two',
      'country': 'France',
      'noOfPassengers': '2',
      'distance': '1000 miles',
      'price': '\$5000',
      'startDate': '15.02.2025',
      'endDate': '01.03.2025',
    }
  ];
  List<Map<String, String>> acceptedJobs = [];

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
        ),
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.all(8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Job Board',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black)),
                  ToggleButtons(
                    borderRadius: BorderRadius.circular(10),
                    selectedColor: Colors.white,
                    fillColor: Color(0xFFD0A9F5),
                    isSelected: [
                      widget.selectedTabIndex == 0,
                      widget.selectedTabIndex == 1
                    ],
                    onPressed: widget.onTabChanged,
                    children: [
                      Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          child: Text('Available',
                              style: TextStyle(color: Colors.black))),
                      Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          child: Text('Accepted',
                              style: TextStyle(color: Colors.black))),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: widget.selectedTabIndex == 0
                  ? _availableJobsList()
                  : _acceptedJobsList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _availableJobsList() {
    return ListView.builder(
      itemCount: availableJobs.length,
      itemBuilder: (context, index) {
        return _jobPostCard(index, true);
      },
    );
  }

  Widget _acceptedJobsList() {
    return ListView.builder(
      itemCount: acceptedJobs.length,
      itemBuilder: (context, index) {
        return _jobPostCard(index, false);
      },
    );
  }

    Widget _jobPostCard(int index, bool isAvailable) {
    final job = isAvailable ? availableJobs[index] : acceptedJobs[index];

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
            job['title']!,
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
          ),
          if (_expandedPosts[index]) ...[
            Text('Country: ${job['country']}', style: TextStyle(color: Colors.black)),
            Text('No. of Passengers: ${job['noOfPassengers']}', style: TextStyle(color: Colors.black)),
            Text('Distance: ${job['distance']}', style: TextStyle(color: Colors.black)),
            Text('Price: ${job['price']}', style: TextStyle(color: Colors.black)),
            Text('Start Date: ${job['startDate']}', style: TextStyle(color: Colors.black)),
            Text('End Date: ${job['endDate']}', style: TextStyle(color: Colors.black)),
            SizedBox(height: 16),

            if (isAvailable)
              Align(
                alignment: Alignment.bottomLeft, // Moves to bottom left
                child: TextButton(
                  onPressed: () {
                    setState(() {
                      acceptedJobs.add(job);
                      availableJobs.removeAt(index);
                      _expandedPosts.removeAt(index);
                    });
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text('Accept'),
                ),
              ),

            if (!isAvailable) ...[
              SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: Text('Confirm Cancellation'),
                            content: Text('Are you sure that you want to cancel the job?'),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop(); // Close confirmation dialog
                                },
                                child: Text('No'),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop(); // Close confirmation dialog

                                  // Show follow-up message
                                  showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return AlertDialog(
                                        title: Text('Cancellation Requested'),
                                        content: Text(
                                          'Your request to cancel the accepted job has been noted. Please wait for a response.'),
                                        actions: [
                                          TextButton(
                                            onPressed: () {
                                              Navigator.of(context).pop(); // Close follow-up dialog
                                            },
                                            child: Text('OK'),
                                          ),
                                        ],
                                      );
                                    },
                                  );
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
                          builder: (context) => JobDetailsPage(),
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
                  _expandedPosts[index] = !_expandedPosts[index];
                });
              },
              child: Text(
                  _expandedPosts[index] ? 'Less details' : 'More details...',
                  style: TextStyle(color: Colors.black)),
            ),
          ),
        ],
      ),
    );
  }

}