import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async createDriverSignupNotification(driverId: number) {
    try {
      // Get the driver details
      const driver = await this.prisma.driver.findUnique({
        where: { id: driverId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          contactNumber: true,
        },
      });

      if (!driver) {
        throw new Error('Driver not found');
      }

      // Get all admins with FCM tokens
      const admins = await this.prisma.admin.findMany({
        where: {
          fcmToken: {
            not: null,
          },
        },
        select: {
          id: true,
          fcmToken: true,
        },
      });

      // Create notification records for each admin
      const notificationPromises = admins.map(admin => 
        this.prisma.notification.create({
          data: {
            title: 'New Driver Registration',
            message: `New driver ${driver.firstName} ${driver.lastName} has registered with contact ${driver.contactNumber}`,
            type: 'ADMIN_ONLY',
            adminId: admin.id,
            driverId: driverId,
            status: 'UNREAD',
          },
        })
      );

      // Create notifications in database
      await Promise.all(notificationPromises);

      // Send FCM notifications to all admins
      const fcmPromises = admins.map(admin => {
        if (admin.fcmToken) {
          return this.firebaseService.sendPushNotification(
            admin.fcmToken,
            'New Driver Registration',
            `New driver ${driver.firstName} ${driver.lastName} has registered with contact ${driver.contactNumber}`
          );
        }
      });

      await Promise.all(fcmPromises);

    } catch (error) {
      console.error('Error creating driver signup notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'READ' },
    });
  }

  async getAdminNotifications(adminId: number) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { adminId: adminId },
          { type: 'BOTH' },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDriverNotifications(driverId: number) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { driverId: driverId },
          { type: 'BOTH' },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 