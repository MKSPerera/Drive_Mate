import 'package:flutter/material.dart';
import '../nav_bar/nav_bar.dart';
import '../services/notification_service.dart';

/// Displays a list of notifications for the user.
/// Allows marking notifications as read and deleting them.
class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  _NotificationsPageState createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  bool isLoading = false; // Indicates if notifications are being loaded
  List<Map<String, dynamic>> notifications = []; // List of notifications
  String? errorMessage; // Error message if loading fails
  int _selectedNavIndex = 0; // Index for the selected navigation item

  @override
  void initState() {
    super.initState();
    _loadNotifications(); // Load notifications on initialization
    _setCurrentNavIndex(); // Set the current navigation index
  }

  /// Sets the current navigation index to 0 (Notifications)
  void _setCurrentNavIndex() {
    setState(() {
      _selectedNavIndex = 0;
    });
  }

  /// Handles navigation bar item taps
  void _onNavBarItemTapped(int index) {
    if (index == _selectedNavIndex) {
      return;
    }

    setState(() {
      _selectedNavIndex = index;
    });

    // Navigate to the selected page
    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 1:
        Navigator.pushReplacementNamed(context, '/calendar');
        break;
      case 2:
        Navigator.pushReplacementNamed(context, '/ongoing-jobs');
        break;
      case 3:
        Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }

  // Helper method to get icon and color based on notification type
  (IconData, Color) _getNotificationStyle(String type) {
    switch (type) {
      case 'new_job':
        return (Icons.work_outline, Colors.blue);
      case 'job_accepted':
        return (Icons.check_circle_outline, Colors.green);
      case 'job_canceled':
        return (Icons.cancel_outlined, Colors.red);
      case 'job_reassigned':
        return (Icons.swap_horiz, Colors.orange);
      case 'job_reminder':
        return (Icons.alarm, Colors.purple);
      case 'urgent_job':
        return (Icons.priority_high, Colors.red);
      case 'job_removed':
        return (Icons.delete_outline, Colors.grey);
      case 'location_update':
        return (Icons.location_on_outlined, Colors.green);
      case 'low_rating':
        return (Icons.star_border, Colors.orange);
      case 'milestone':
        return (Icons.emoji_events_outlined, Colors.amber);
      case 'agency_message':
        return (Icons.message_outlined, Colors.blue);
      case 'suspension_warning':
        return (Icons.warning_amber_outlined, Colors.red);
      case 'availability_reminder':
        return (Icons.access_time, Colors.teal);
      default:
        return (Icons.notifications_outlined, Colors.grey);
    }
  }

  /// Loads notifications from the backend
  Future<void> _loadNotifications() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final notificationsList = await NotificationService.getNotifications();

      setState(() {
        notifications = notificationsList;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }

  /// Marks a notification as read
  Future<void> _markAsRead(int notificationId) async {
    try {
      await NotificationService.markAsRead(notificationId);

      // Update the UI
      setState(() {
        final index =
            notifications.indexWhere((n) => n['id'] == notificationId);
        if (index != -1) {
          notifications[index]['status'] = 'READ';
        }
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to mark notification as read: $e')),
      );
    }
  }

  /// Deletes a notification
  Future<void> _deleteNotification(String notificationId) async {
    try {
      // TODO: Replace with actual API call
      // Example endpoint: DELETE /api/notifications/{id}
      await Future.delayed(const Duration(milliseconds: 500));

      setState(() {
        notifications.removeWhere((n) => n['id'] == notificationId);
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to delete notification: $e')),
      );
    }
  }

  void _handleNotificationTap(Map<String, dynamic> notification) async {
    await _markAsRead(notification['id']);

    if (!mounted) return;

    // Handle navigation based on notification type
    switch (notification['type']) {
      case 'new_job':
      case 'urgent_job':
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 'job_reminder':
      case 'job_accepted':
        Navigator.pushNamed(context, '/ongoing-jobs');
        break;
      case 'low_rating':
      case 'milestone':
        Navigator.pushNamed(context, '/status-performance');
        break;
      case 'availability_reminder':
        Navigator.pushNamed(context, '/calendar');
        break;
      default:
        // Show details in a dialog for other types
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(notification['title']),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(notification['message']),
                const SizedBox(height: 8),
                Text(
                  _formatDate(notification['createdAt']),
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close'),
              ),
            ],
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEDE1FF),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Notifications',
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
        actions: [
          if (notifications.any((n) => n['status'] == 'UNREAD'))
            IconButton(
              icon: const Icon(Icons.done_all, color: Colors.black),
              onPressed: _markAllAsRead,
              tooltip: 'Mark all as read',
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadNotifications,
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : errorMessage != null
                ? Center(child: Text(errorMessage!))
                : notifications.isEmpty
                    ? const Center(child: Text('No notifications'))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: notifications.length,
                        itemBuilder: (context, index) {
                          final notification = notifications[index];
                          final isRead = notification['status'] == 'READ';
                          final (icon, color) = _getNotificationStyle(
                              notification['type'] ?? 'default');

                          return Dismissible(
                            key: Key(notification['id'].toString()),
                            background: Container(
                              color: Colors.red,
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 20),
                              child:
                                  const Icon(Icons.delete, color: Colors.white),
                            ),
                            onDismissed: (direction) => _deleteNotification(
                                notification['id'].toString()),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: color.withOpacity(0.2),
                                child: Icon(icon, color: color),
                              ),
                              title: Text(
                                notification['title'] ?? 'Notification',
                                style: TextStyle(
                                  fontWeight: isRead
                                      ? FontWeight.normal
                                      : FontWeight.bold,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(notification['message'] ?? ''),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatDate(notification['createdAt']),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                              trailing: notification['priority'] == 'high'
                                  ? const Icon(Icons.priority_high,
                                      color: Colors.red)
                                  : null,
                              onTap: () => _handleNotificationTap(notification),
                            ),
                          );
                        },
                      ),
      ),
      bottomNavigationBar: CustomNavBar(
        selectedIndex: _selectedNavIndex,
        onItemTapped: _onNavBarItemTapped,
      ),
    );
  }

  Future<void> _markAllAsRead() async {
    // In a real app, you would call your backend to mark all notifications as read
    setState(() {
      for (var notification in notifications) {
        notification['status'] = 'READ';
      }
    });
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';

    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return '';
    }
  }
}
