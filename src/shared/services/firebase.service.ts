import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface PushNotificationOptions {
  token: string | string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface MulticastNotificationOptions {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly configService: ConfigService) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      const serviceAccount = this.configService.get('firebase.serviceAccount');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: this.configService.get('firebase.projectId'),
      });

      this.logger.log('Firebase Admin SDK initialized');
    }
  }

  /**
   * Send push notification to single device
   */
  async sendPushNotification(options: PushNotificationOptions): Promise<string> {
    try {
      const { token, title, body, data, imageUrl } = options;

      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl }),
        },
        data: data || {},
        token: Array.isArray(token) ? token[0] : token,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to send push notification', error);
      throw new Error(`Push notification failed: ${error.message}`);
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendMulticastNotification(options: MulticastNotificationOptions): Promise<admin.messaging.BatchResponse> {
    try {
      const { tokens, title, body, data } = options;

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);
      this.logger.log(`Multicast notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to send multicast notification', error);
      throw new Error(`Multicast notification failed: ${error.message}`);
    }
  }

  /**
   * Send notification to topic
   */
  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        topic,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent to topic ${topic}: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send notification to topic ${topic}`, error);
      throw new Error(`Topic notification failed: ${error.message}`);
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}`, error);
      throw new Error(`Topic subscription failed: ${error.message}`);
    }
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(`Unsubscribed ${tokens.length} tokens from topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}`, error);
      throw new Error(`Topic unsubscription failed: ${error.message}`);
    }
  }
}