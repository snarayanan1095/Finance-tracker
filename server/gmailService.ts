import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

export class ServerGmailService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage' // server-side, no browser redirect
    );
  }

  /**
   * Provide access/refresh tokens obtained via OAuth to this instance.
   */
  public setCredentials(tokens: {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    expiry_date?: number;
    token_type?: string;
  }) {
    this.oauth2Client.setCredentials(tokens);
  }

  private gmail() {
    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async getUnreadEmails(userId: string = 'me', maxResults = 50) {
    const res = await this.gmail().users.messages.list({
      userId,
      q: 'is:unread',
      maxResults
    });
    return res.data.messages ?? [];
  }

  async markAsRead(userId: string, messageId: string) {
    await this.gmail().users.messages.modify({
      userId,
      id: messageId,
      resource: { removeLabelIds: ['UNREAD'] }
    });
  }
}
