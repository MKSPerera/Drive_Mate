import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../nav_bar/nav_bar.dart';
import '../services/job_service.dart';

class CalendarPage extends StatefulWidget {
  const CalendarPage({super.key});

  @override
  _CalendarPageState createState() => _CalendarPageState();
}

class _CalendarPageState extends State<CalendarPage> {
  final CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  List<DateTimeRange> busyDays = [];
  final JobService _jobService = JobService();
  List<Map<String, dynamic>> availabilityRecords = [];
  List<Map<String, dynamic>> acceptedJobs = [];
  bool isLoading = true;
  DateTimeRange? highlightedRange;
  final int _selectedTabIndex = 1; // Set to 1 for Calendar tab
  List<DateTimeRange> acceptedJobRanges = [];

  @override
  void initState() {
    super.initState();
    _loadAvailability();
  }

  Future<void> _loadAvailability() async {
    try {
      final availability = await _jobService.getDriverAvailability();

      setState(() {
        availabilityRecords = availability;

        // Extract busy days from availability records with status BUSY
        busyDays = availability
            .where((record) => record['status'] == 'BUSY')
            .map((record) => DateTimeRange(
                  start: DateTime.parse(record['startDate']),
                  end: DateTime.parse(record['endDate']),
                ))
            .toList();

        // Extract accepted jobs with status JOB
        acceptedJobs =
            availability.where((record) => record['status'] == 'JOB').toList();

        // Create DateTimeRanges for all accepted jobs
        acceptedJobRanges = acceptedJobs
            .map((job) => DateTimeRange(
                  start: DateTime.parse(job['startDate']),
                  end: DateTime.parse(job['endDate']),
                ))
            .toList();

        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load availability: ${e.toString()}')),
      );
    }
  }

  void _pickDateRange() async {
    DateTimeRange? initialRange = busyDays.isNotEmpty ? busyDays.last : null;

    DateTimeRange? pickedRange = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2024),
      lastDate: DateTime(2026),
      initialDateRange: initialRange,
    );

    if (pickedRange != null) {
      try {
        // Add the busy date to the backend
        await _jobService.addBusyDate(
          pickedRange.start,
          pickedRange.end,
        );

        // Reload the availability data to reflect the changes
        await _loadAvailability();

        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Successfully updated calendar')),
        );
      } catch (e) {
        // Show error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update calendar: ${e.toString()}')),
        );
      }
    }
  }

  void _removeBusyDay(DateTimeRange range) async {
    try {
      // Find the availability record that matches this range
      final record = availabilityRecords.firstWhere(
        (record) =>
            DateTime.parse(record['startDate']).isAtSameMomentAs(range.start) &&
            DateTime.parse(record['endDate']).isAtSameMomentAs(range.end) &&
            record['status'] == 'BUSY',
        orElse: () => throw Exception('Busy date not found'),
      );

      // Ensure we have a valid ID
      final id = record['id'];
      if (id == null) {
        throw Exception('Invalid availability record');
      }

      // Delete the busy date from the backend
      await _jobService.deleteBusyDate(id);

      // Reload the availability data
      await _loadAvailability();

      // Show success message
      if (mounted) {
        // Check if widget is still mounted
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully removed busy day')),
        );
      }
    } catch (e) {
      // Show error message
      if (mounted) {
        // Check if widget is still mounted
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to remove busy day: ${e.toString()}')),
        );
      }
    }
  }

  void _highlightAcceptedJob(DateTimeRange range) {
    setState(() {
      highlightedRange = range;
      _focusedDay = range.start;
    });

    // Show a snackbar to indicate which job is highlighted
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Showing job from ${_formatDate(range.start)} to ${_formatDate(range.end)}'),
        duration: Duration(seconds: 2),
        action: SnackBarAction(
          label: 'Clear',
          onPressed: () {
            setState(() {
              highlightedRange = null;
            });
          },
        ),
      ),
    );
  }

  Widget _buildDateRangeText(DateTimeRange range) {
    return Text(
      "${range.start.toLocal().toString().split(' ')[0]} - ${range.end.toLocal().toString().split(' ')[0]}",
      style: TextStyle(fontWeight: FontWeight.bold),
    );
  }

  void _onNavBarItemTapped(int index) {
    if (index == _selectedTabIndex) {
      return; // Don't navigate if already on the page
    }

    switch (index) {
      case 0: // Home
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 1: // Calendar - already on calendar page
        break;
      case 2: // Ongoing Jobs
        Navigator.pushReplacementNamed(context, '/ongoing-jobs');
        break;
      case 3: // Profile
        Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }

  CalendarBuilders get calendarBuilders => CalendarBuilders(
        rangeHighlightBuilder: (context, day, isWithinRange) {
          // Check if the day is within any busy period (exclusive of the end date + 1)
          bool isWithinBusyPeriod = busyDays.any((range) =>
              (day.isAtSameMomentAs(range.start) || day.isAfter(range.start)) &&
              (day.isAtSameMomentAs(range.end) || day.isBefore(range.end)));

          // Check if the day is within any accepted job period (exclusive of the end date + 1)
          bool isWithinAcceptedJob = acceptedJobRanges.any((range) =>
              (day.isAtSameMomentAs(range.start) || day.isAfter(range.start)) &&
              (day.isAtSameMomentAs(range.end) || day.isBefore(range.end)));

          // Check if the day is within the highlighted range (exclusive of the end date + 1)
          bool isHighlighted = highlightedRange != null &&
              (day.isAtSameMomentAs(highlightedRange!.start) ||
                  day.isAfter(highlightedRange!.start)) &&
              (day.isAtSameMomentAs(highlightedRange!.end) ||
                  day.isBefore(highlightedRange!.end));

          // Create the section highlight
          return Stack(
            children: [
              // Background section highlight
              if (isWithinBusyPeriod || isWithinAcceptedJob || isHighlighted)
                Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  decoration: BoxDecoration(
                    color: isHighlighted
                        ? Colors.purple.withOpacity(0.3)
                        : isWithinBusyPeriod
                            ? Colors.red.withOpacity(0.15)
                            : Colors.purple.withOpacity(0.15),
                  ),
                ),
              // Circular day highlight
              Container(
                margin: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isHighlighted
                      ? Colors.purple.withOpacity(0.6)
                      : isWithinBusyPeriod
                          ? Colors.red.withOpacity(0.3)
                          : isWithinAcceptedJob
                              ? Colors.purple.withOpacity(0.3)
                              : Colors.transparent,
                  border: isHighlighted
                      ? Border.all(color: Colors.purple, width: 2)
                      : null,
                ),
              ),
            ],
          );
        },
        markerBuilder: (context, date, events) {
          // Check for start or end dates (without adding an extra day)
          bool isBusyStartOrEnd = busyDays.any((range) =>
              date.isAtSameMomentAs(range.start) ||
              date.isAtSameMomentAs(range.end));

          bool isJobStartOrEnd = acceptedJobRanges.any((range) =>
              date.isAtSameMomentAs(range.start) ||
              date.isAtSameMomentAs(range.end));

          bool isHighlightedStartOrEnd = highlightedRange != null &&
              (date.isAtSameMomentAs(highlightedRange!.start) ||
                  date.isAtSameMomentAs(highlightedRange!.end));

          if (isHighlightedStartOrEnd || isBusyStartOrEnd || isJobStartOrEnd) {
            return Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 35,
                  height: 35,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isHighlightedStartOrEnd
                        ? Colors.purple.withOpacity(0.8)
                        : isBusyStartOrEnd
                            ? Colors.red.withOpacity(0.5)
                            : Colors.purple.withOpacity(0.5),
                    border: isHighlightedStartOrEnd
                        ? Border.all(color: Colors.white, width: 2)
                        : null,
                  ),
                ),
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                ),
              ],
            );
          }
          return null;
        },
      );

  // Helper method to format dates consistently
  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFEDE1FF),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "Calendar",
          style: TextStyle(
            color: Colors.black87,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          children: [
            // Calendar Section
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
              ),
              padding: EdgeInsets.all(10),
              child: TableCalendar(
                headerStyle: HeaderStyle(
                  formatButtonVisible: false,
                ),
                focusedDay: _focusedDay,
                firstDay: DateTime(2024),
                lastDay: DateTime(2026),
                calendarFormat: _calendarFormat,
                rangeSelectionMode: RangeSelectionMode.toggledOn,
                calendarBuilders: calendarBuilders,
                selectedDayPredicate: (day) => false,
                onDaySelected: (selectedDay, focusedDay) {
                  setState(() {
                    _selectedDay = selectedDay;
                    _focusedDay = focusedDay;
                  });
                },
                calendarStyle: CalendarStyle(
                  outsideDaysVisible: true,
                  cellMargin: EdgeInsets.all(2),
                  cellPadding: EdgeInsets.zero,
                  rangeHighlightScale: 1.0,
                  markersMaxCount: 1,
                ),
              ),
            ),
            SizedBox(height: 16),

            // Update Calendar Button
            ElevatedButton(
              onPressed: _pickDateRange,
              child: Text("Update Calendar"),
            ),
            SizedBox(height: 16),

            // Busy Days Section
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      padding: EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Busy Days",
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold)),
                          SizedBox(height: 10),
                          ListView.builder(
                            shrinkWrap: true,
                            physics: NeverScrollableScrollPhysics(),
                            itemCount: busyDays.length,
                            itemBuilder: (context, index) {
                              final range = busyDays[index];
                              return Card(
                                color: Colors.red.shade300,
                                child: ListTile(
                                  title: _buildDateRangeText(range),
                                  trailing: IconButton(
                                    icon: Icon(Icons.delete),
                                    onPressed: () => _removeBusyDay(range),
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 16),

                    // Accepted Jobs Section
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      padding: EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Accepted Jobs",
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold)),
                          SizedBox(height: 10),
                          isLoading
                              ? CircularProgressIndicator()
                              : ListView.builder(
                                  shrinkWrap: true,
                                  physics: NeverScrollableScrollPhysics(),
                                  itemCount: acceptedJobs.length,
                                  itemBuilder: (context, index) {
                                    final job = acceptedJobs[index];
                                    final range = DateTimeRange(
                                      start: DateTime.parse(job['startDate']),
                                      end: DateTime.parse(job['endDate']),
                                    );
                                    return Card(
                                      color: Colors.purple.shade300,
                                      shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10)),
                                      child: Padding(
                                        padding: EdgeInsets.all(10),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text("Client: ${job['clientName']}",
                                                style: TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.white)),
                                            SizedBox(height: 5),
                                            _buildDateRangeText(range),
                                            SizedBox(height: 10),
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                ElevatedButton(
                                                  style:
                                                      ElevatedButton.styleFrom(
                                                          backgroundColor:
                                                              Colors.white),
                                                  onPressed: () =>
                                                      _highlightAcceptedJob(
                                                          range),
                                                  child: Text(
                                                      "Show in Calendar",
                                                      style: TextStyle(
                                                          color:
                                                              Colors.purple)),
                                                ),
                                                ElevatedButton(
                                                  style:
                                                      ElevatedButton.styleFrom(
                                                          backgroundColor:
                                                              Colors.white),
                                                  onPressed: () {
                                                    // TODO: Implement job details view
                                                  },
                                                  child: Text("More Details",
                                                      style: TextStyle(
                                                          color:
                                                              Colors.purple)),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: CustomNavBar(
        selectedIndex: _selectedTabIndex,
        onItemTapped: _onNavBarItemTapped,
      ),
    );
  }
}
