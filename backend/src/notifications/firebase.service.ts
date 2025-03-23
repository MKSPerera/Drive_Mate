import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

        if (!projectId || !clientEmail || !privateKey) {
          throw new Error('Missing Firebase configuration. Please check your environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
        }

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });

        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.logger.log('Firebase Admin SDK already initialized');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error.message);
      throw error;
    }
  }

  private validateFcmToken(token: string): boolean {
    // Basic FCM token validation
    // FCM tokens are typically around 140-200 characters and contain only alphanumeric characters and colons
    const fcmTokenPattern = /^[a-zA-Z0-9:_-]{120,200}$/;
    return fcmTokenPattern.test(token);
  }

  async sendPushNotification(fcmToken: string, title: string, body: string) {
    try {
      if (!fcmToken) {
        throw new BadRequestException('FCM token is required');
      }

      if (!this.validateFcmToken(fcmToken)) {
        throw new BadRequestException('Invalid FCM token format');
      }

      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        token: fcmToken,
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            priority: 'high' as const,
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      this.logger.log('Successfully sent notification:', response);
      return response;
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendMulticastNotification(fcmTokens: string[], title: string, body: string) {
    try {
      if (!fcmTokens || fcmTokens.length === 0) {
        this.logger.warn('No FCM tokens provided for multicast notification');
        return;
      }

      const validTokens = fcmTokens.filter(token => token && this.validateFcmToken(token));

      if (validTokens.length === 0) {
        throw new BadRequestException('No valid FCM tokens provided');
      }

      const baseMessage = {
        notification: {
          title,
          body,
        },
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            priority: 'high' as const,
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      // Send in batches of 500 (Firebase limit)
      const batchSize = 500;
      const responses = [];

      for (let i = 0; i < validTokens.length; i += batchSize) {
        const batch = validTokens.slice(i, i + batchSize);
        const batchMessage: admin.messaging.MulticastMessage = {
          ...baseMessage,
          tokens: batch,
        };
        
        try {
          const response = await admin.messaging().sendEachForMulticast(batchMessage);
          responses.push(response);
          this.logger.log(`Successfully sent batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(validTokens.length / batchSize)} notifications`);
        } catch (error) {
          this.logger.error(`Error sending batch ${Math.floor(i / batchSize) + 1}:`, error);
        }
      }

      return responses;
    } catch (error) {
      this.logger.error('Error sending multicast notification:', error);
      throw error;
    }
  }
}
