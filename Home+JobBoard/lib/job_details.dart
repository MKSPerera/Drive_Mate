// job_details.dart
import 'package:flutter/material.dart';

class JobDetailsPage extends StatelessWidget {
  const JobDetailsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.purple[100],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Job Details',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.purple[300],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    color: Colors.grey[300], // Placeholder for image
                  ),
                  SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Agency Name',
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.black)),
                      Text('14 days', style: TextStyle(color: Colors.black54)),
                      Text('Family of 4',
                          style: TextStyle(color: Colors.black54)),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(height: 16),
            Expanded(
              child: Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListView(
                  children: [
                    Text('About the Job',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16)),
                    SizedBox(height: 8),
                    Text(
                        'Need a chauffeur for a 14 day tour for a German family of 4.'),
                    SizedBox(height: 8),
                    Text(
                      'Country: German\nDistance: 500km\nPrice: 1000\$\n'
                      'Start Date: 10.01.2025\nEnd Date: 24.01.2025\nVehicle grade: B or above',
                      style: TextStyle(color: Colors.black87),
                    ),
                    SizedBox(height: 16),
                    Text('Tour Location Briefing:',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text(
                        'Time of Arrival:\nDestinations:\nHotels:\nTime of Departure:'),
                    SizedBox(height: 16),
                    Text('Tour Plan:',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    for (int i = 1; i <= 14; i++) Text('Day $i :'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
