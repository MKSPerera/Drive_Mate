import { Injectable } from '@nestjs/common';
import { NotificationType, PostType } from '@prisma/client';
import { FirebaseService } from '../notifications/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendJobAcceptedNotification(jobId: number, driverId: number) {
    try {
      // Get job details
      const job = await this.prisma.job.findUnique({
        where: { jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Get driver details separately
      const driver = await this.prisma.driver.findUnique({
        where: { id: driverId },
        select: {
          firstName: true,
          lastName: true,
          contactNumber: true,
          vehicleType: true,
          vehicleLicense: true,
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

      const notificationTitle = 'New Job Acceptance';
      const notificationMessage = `Driver ${driver.firstName} ${driver.lastName} (${driver.vehicleType} - ${driver.vehicleLicense}) has accepted the job for ${job.clientName}. Pickup at ${job.pickupLocation}`;

      // Create notification records for each admin
      const notificationPromises = admins.map(admin =>
        this.prisma.notification.create({
          data: {
            title: notificationTitle,
            message: notificationMessage,
            type: NotificationType.ADMIN_ONLY,
            adminId: admin.id,
            driverId: driverId,
            jobId: jobId,
            status: 'UNREAD',
          },
        })
      );

      // Send FCM notifications to all admins
      const fcmTokens = admins
        .map(admin => admin.fcmToken)
        .filter((token): token is string => token !== null);

      if (fcmTokens.length > 0) {
        await this.firebaseService.sendMulticastNotification(
          fcmTokens,
          notificationTitle,
          notificationMessage
        );
      }

      // Create notifications in database
      await Promise.all(notificationPromises);

    } catch (error) {
      console.error('Error sending job accepted notification:', error);
      throw error;
    }
  }

  async sendJobCreatedNotification(jobId: number, driverIds?: number[]) {
    try {
      // Get job details
      const job = await this.prisma.job.findUnique({
        where: { jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      const notificationTitle = 'New Job Available';
      const notificationMessage = `New job available for ${job.clientName}. Pickup at ${job.pickupLocation} on ${new Date(job.startDate).toLocaleDateString()}.`;

      // Determine which drivers to notify based on job type
      let driversToNotify;

      if (job.postType === PostType.PUBLIC) {
        // For public jobs, notify all drivers
        driversToNotify = await this.prisma.driver.findMany({
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
      } else {
        // For private jobs, only notify specified drivers
        if (!driverIds || driverIds.length === 0) {
          throw new Error('Driver IDs must be provided for private job notifications');
        }

        driversToNotify = await this.prisma.driver.findMany({
          where: {
            id: { in: driverIds },
            fcmToken: {
              not: null,
            },
          },
          select: {
            id: true,
            fcmToken: true,
          },
        });
      }

      // Send FCM notifications to all applicable drivers
      const fcmTokens = driversToNotify
        .map(driver => driver.fcmToken)
        .filter((token): token is string => token !== null);

      if (fcmTokens.length > 0) {
        await this.firebaseService.sendMulticastNotification(
          fcmTokens,
          notificationTitle,
          notificationMessage
        );
      }

      // For public jobs, create a single notification with BOTH type
      if (job.postType === PostType.PUBLIC) {
        await this.prisma.notification.create({
          data: {
            title: notificationTitle,
            message: notificationMessage,
            type: NotificationType.BOTH,
            jobId: jobId,
            status: 'UNREAD',
          },
        });
      } else {
        // For private jobs, create individual driver notifications
        const notificationPromises = driversToNotify.map(driver =>
          this.prisma.notification.create({
            data: {
              title: notificationTitle,
              message: notificationMessage,
              type: NotificationType.DRIVER_ONLY,
              driverId: driver.id,
              jobId: jobId,
              status: 'UNREAD',
            },
          })
        );
        await Promise.all(notificationPromises);
      }

    } catch (error) {
      console.error('Error sending job created notification:', error);
      throw error;
    }
  }
//send job status updated notification
  async sendJobStatusUpdatedNotification(jobId: number) {
    try {
      // Get job details with assigned driver
      const job = await this.prisma.job.findUnique({
        where: { jobId },
        include: {
          assignedDriver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              fcmToken: true,
            },
          },
        },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Only send if there's an assigned driver
      if (!job.assignedDriver) {
        return;
      }

      const statusText = job.currentState.charAt(0) + job.currentState.slice(1).toLowerCase();
      const notificationTitle = `Job Status Updated: ${statusText}`;
      const notificationMessage = `Your job for ${job.clientName} has been updated to ${statusText}`;

      // Create notification record for the assigned driver
      await this.prisma.notification.create({
        data: {
          title: notificationTitle,
          message: notificationMessage,
          type: NotificationType.DRIVER_ONLY,
          driverId: job.assignedDriver.id,
          jobId: jobId,
          status: 'UNREAD',
        },
      });

      // Send FCM notification if driver has a token
      if (job.assignedDriver.fcmToken) {
        await this.firebaseService.sendPushNotification(
          job.assignedDriver.fcmToken,
          notificationTitle,
          notificationMessage
        );
      }

    } catch (error) {
      console.error('Error sending job status updated notification:', error);
      throw error;
    }
  }

//send job cancelled notification
  async sendJobCancelledNotification(jobId: number, driverId: number, rejectionReason?: string) {
    try {
      // Get job details
      const job = await this.prisma.job.findUnique({
        where: { jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Get driver details separately
      const driver = await this.prisma.driver.findUnique({
        where: { id: driverId },
        select: {
          firstName: true,
          lastName: true,
          contactNumber: true,
          vehicleType: true,
          vehicleLicense: true,
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

      const notificationTitle = 'Job Cancelled by Driver';
      let notificationMessage = `Driver ${driver.firstName} ${driver.lastName} (${driver.vehicleType} - ${driver.vehicleLicense}) has cancelled job #${jobId} for ${job.clientName}.`;
      
      // Add rejection reason if provided
      if (rejectionReason) {
        notificationMessage += ` Reason: "${rejectionReason}"`;
      }

      // Create notification records for each admin
      const notificationPromises = admins.map(admin =>
        this.prisma.notification.create({
          data: {
            title: notificationTitle,
            message: notificationMessage,
            type: NotificationType.ADMIN_ONLY,
            adminId: admin.id,
            driverId: driverId,
            jobId: jobId,
            status: 'UNREAD',
          },
        })
      );

      // Send FCM notifications to all admins
      const fcmTokens = admins
        .map(admin => admin.fcmToken)
        .filter((token): token is string => token !== null);

      if (fcmTokens.length > 0) {
        await this.firebaseService.sendMulticastNotification(
          fcmTokens,
          notificationTitle,
          notificationMessage
        );
      }

      // Create notifications in database
      await Promise.all(notificationPromises);

    } catch (error) {
      console.error('Error sending job cancellation notification:', error);
      throw error;
    }
  }
} 