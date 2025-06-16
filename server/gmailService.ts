import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

export class ServerGmailService {
  private oauth2Client;

  /**
   * Build the Google OAuth consent URL for the given user.
   */
  public generateAuthUrl(state: string) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state
    });
  }

  constructor() {
    // Hardcoded credentials (dev only - replace before committing)
    this.oauth2Client = new google.auth.OAuth2(
      '328428322366-2ehl1b97fihr23v810ga36rdeli6r1vo.apps.googleusercontent.com',
      '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',
      'postmessage'
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

  /**
   * Exchange OAuth code for tokens and store them.
   */
  public async exchangeCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.setCredentials(tokens);
    return tokens;
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
      requestBody: { removeLabelIds: ['UNREAD'] }
    });
  }
}
