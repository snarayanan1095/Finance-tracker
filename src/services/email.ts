import { db } from '../config/firebase';
import { User } from '../types';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface EmailIntegrationConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface EmailIntegration {
  enabled: boolean;
  lastSync: Date | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export class EmailService {
  private config: EmailIntegrationConfig;
  private oauth2Client: OAuth2Client;

  constructor(config: EmailIntegrationConfig) {
    this.config = config;
    this.oauth2Client = new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
  }

  async authenticate(user: User): Promise<string> {
    // Generate OAuth2 authorization URL
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      state: user.id
    });
    
    // Save the pending authentication state
    const emailIntegration = {
      enabled: false,
      lastSync: null,
      accessToken: null,
      refreshToken: null
    };
    await db.collection('users').doc(user.id).update({
      emailIntegration
    });

    return authUrl;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      // Save tokens to user's document
      await db.collection('users').doc(userId).update({
        emailIntegration: {
          enabled: true,
          lastSync: new Date(),
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        }
      });
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  async syncEmails(userId: string): Promise<void> {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData?.emailIntegration?.enabled || !userData.emailIntegration.accessToken) {
        throw new Error('Email integration not enabled or not authenticated');
      }

      // Set credentials
      this.oauth2Client.setCredentials({
        access_token: userData.emailIntegration.accessToken,
        refresh_token: userData.emailIntegration.refreshToken
      });

      // Initialize Gmail API client
      const gmail = google.gmail('v1');
      
      // Set credentials
      await this.oauth2Client.setCredentials({
        access_token: userData.emailIntegration.accessToken,
        refresh_token: userData.emailIntegration.refreshToken
      });

      // Get unread emails using Gmail API
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 50
      });

      // Process emails
      const messages = response.data.messages || [];
      for (const message of messages) {
        // TODO: Implement email parsing logic here
        // This would involve:
        // 1. Extracting relevant financial information from emails
        // 2. Creating corresponding expense entries
        // 3. Marking emails as read
      }

      // Update last sync time
      await db.collection('users').doc(userId).update({
        'emailIntegration.lastSync': new Date()
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      throw error;
    }
  }

  async scheduleSync(userId: string, interval: number = 3600000): Promise<void> {
    // Schedule periodic sync using Firebase Cloud Functions or a background worker
    // This would typically be implemented as a separate Cloud Function
    // For now, we'll just return a success message
    console.log(`Scheduled email sync for user ${userId} with interval ${interval}ms`);
  }
}

// Export a singleton instance
export const emailService = new EmailService({
  clientId: process.env.EMAIL_CLIENT_ID || '',
  clientSecret: process.env.EMAIL_CLIENT_SECRET || '',
  redirectUri: process.env.EMAIL_REDIRECT_URI || ''
});
