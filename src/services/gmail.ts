import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Gmail API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

export class GmailService {
  private readonly oauth2Client: OAuth2Client;

  constructor() {
    // Initialize OAuth2 client with your credentials from Google Cloud Console
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${window.location.origin}/api/auth/callback`
    );
  }

  // Generate authentication URL
  async getAuthUrl(): Promise<string> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    return authUrl;
  }

  // Handle OAuth2 callback
  async handleCallback(code: string): Promise<string> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    if (!tokens.refresh_token) {
      throw new Error('Refresh token not received from Google OAuth');
    }
    return tokens.refresh_token;
  }

  // Get Gmail API client
  private getGmailClient(): any {
    return google.gmail({
      version: 'v1'
    });
  }

  // Get unread emails
  async getUnreadEmails(userId: string): Promise<any[]> {
    const gmail = this.getGmailClient();
    const response = await gmail.users.messages.list({
      userId,
      q: 'is:unread',
      maxResults: 50
    });
    return response.data?.messages || [];
  }

  // Mark email as read
  async markAsRead(messageId: string, userId: string): Promise<void> {
    const gmail = this.getGmailClient();
    await gmail.users.messages.modify({
      userId,
      id: messageId,
      resource: {
        removeLabelIds: ['UNREAD']
      }
    });
  }

  // Get email content
  async getEmailContent(userId: string, messageId: string): Promise<string> {
    const gmail = this.getGmailClient();
    const response = await gmail.users.messages.get({
      userId,
      id: messageId,
      format: 'raw'
    });
    const rawEmail = response.data.raw;
    const decodedEmail = Buffer.from(rawEmail, 'base64').toString('utf-8');
    return decodedEmail;
  }
}
