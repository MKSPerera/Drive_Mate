import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black87),
          onPressed: () => Navigator.maybePop(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: BackgroundPatternPainter(),
            ),
          ),
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 24, 16, 16),
                  child: Text(
                    'Recent Updates',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2D3142),
                    ),
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildNotificationCard(
                        message: 'Job #1234 has been canceled by the placeholder',
                        time: '10:30',
                        isCancel: true,
                      ),
                      const SizedBox(height: 12),
                      _buildNotificationCard(
                        message: 'Job #1235 has been accepted! Your placeholder is on the way',
                        time: '09:45',
                        isCancel: false,
                      ),
                      const SizedBox(height: 12),
                      _buildNotificationCard(
                        message: 'Job #1236 has been accepted! Your placeholder is on the way',
                        time: '08:15',
                        isCancel: false,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard({
    required String message,
    required String time,
    required bool isCancel,
  }) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isCancel
              ? [const Color(0xFFFFE5E5), const Color(0xFFFFECEC)]
              : [const Color(0xFFE0D6FF), const Color(0xFFF3EFFF)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: (isCancel ? Colors.red : Colors.green).withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isCancel ? Icons.cancel : Icons.check_circle,
            color: isCancel ? Colors.red : Colors.green,
            size: 28,
          ),
        ),
        title: Text(
          message,
          style: const TextStyle(
            fontSize: 15,
            color: Color(0xFF2D3142),
            height: 1.4,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Text(
            time,
            style: TextStyle(
              fontSize: 13,
              color: const Color(0xFF2D3142).withOpacity(0.6),
            ),
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.5),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.chevron_right,
            color: Color(0xFF2D3142),
            size: 20,
          ),
        ),
        onTap: () {},
      ),
    );
  }
}
