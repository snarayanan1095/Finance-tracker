import { User } from '../types';

/*
 * Lightweight browser-side email integration service.
 * This file MUST NOT import any Node-only libraries (e.g. googleapis, nodemailer)
 * because it is bundled into the React app and executed in the browser.
 *
 * The real Gmail / OAuth work should be handled by the Express server.
 * Here we simply proxy requests to that server.
 */

// === Types ===
export interface EmailIntegration {
  enabled: boolean;
  lastSync: string | null;
}

// === API helpers ===
// In dev, Vite runs on 517x, Express on 5000.  Include protocol so fetch goes cross-origin.
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

class EmailService {
  /*
   * Initiates Gmail OAuth flow on the server and returns the Google consent URL to redirect the user to.
   */
  async authenticate(user: User): Promise<string> {
    const res = await fetch(`${API_BASE}/api/email/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Failed to start email authentication');
    }
    const { authUrl } = await res.json();
    return authUrl;
  }

  /**
   * Complete OAuth flow after Google redirects back with ?code.
   */
  async handleCallback(code: string, state: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/email/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state })
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Failed to complete email authentication');
    }
  }

  // Optionally trigger a manual sync (server handles heavy lifting)
  async syncEmails(): Promise<void> {
    const res = await fetch(`${API_BASE}/api/email/sync`, { method: 'POST' });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Failed to sync emails');
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
