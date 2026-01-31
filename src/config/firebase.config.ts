import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  
  messaging: {
    timeToLive: 86400, // 24 hours
    priority: 'high',
    collapseKey: 'homeservices_notification',
  },
  
  // Notification templates
  templates: {
    booking: {
      android: {
        notification: {
          sound: 'default',
          channelId: 'booking_updates',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            category: 'BOOKING_UPDATE',
          },
        },
      },
    },
  },
}));