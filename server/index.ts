import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import admin from 'firebase-admin';
import { ServerGmailService } from './gmailService';

dotenv.config();

// Initialize Firebase Admin SDK
// Prefer explicit service-account credentials if GOOGLE_APPLICATION_CREDENTIALS is provided.
if (!admin.apps.length) {
  const svcAcct = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (svcAcct) {
    // Resolve relative to project root in case a relative path is supplied
    const absolute = path.isAbsolute(svcAcct) ? svcAcct : path.resolve(process.cwd(), svcAcct);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(absolute);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Will work on Cloud Functions / GCP environments where application default creds are available
    admin.initializeApp();
  }
}

const app = express();
// CORS configuration – allow local dev & Amplify production site
const allowedOrigins = [
  'http://localhost:5173',                  // Vite dev
  'https://main.d18bgimlu02ddq.amplifyapp.com' // Amplify prod
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  })
);

app.use(express.json());

const gmailService = new ServerGmailService();

// Helper – fetch stored Gmail tokens and prime gmailService
async function ensureGmailCredentials(uid: string) {
  const snap = await admin
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('integrations')
    .doc('gmail')
    .get();
  if (!snap.exists) throw new Error('Gmail not connected for this user');
  const tokens = snap.data();
  gmailService.setCredentials(tokens as any);
}

// GET /api/gmail/unread?userId=uid
app.get('/api/gmail/unread', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'userId query param required' });
  try {
    await ensureGmailCredentials(userId);
    const unread = await gmailService.getUnreadEmails(userId);
    res.json(unread);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? (err.message || err) : String(err) });
  }
});

const PORT = process.env.PORT || // POST /api/email/auth  { user: { uid, email, … } }
app.post('/api/email/auth', async (req, res) => {
  const state = req.body.user.uid;              // keep it simple for now
  const authUrl = gmailService.generateAuthUrl(state);
  res.json({ authUrl });
});

// POST /api/email/callback  { code, state }
app.post('/api/email/callback', async (req, res) => {
  const { code, state } = req.body;
  try {
    const tokens = await gmailService.exchangeCode(code);

    // OPTIONAL: Persist tokens under the user’s UID in Firestore
    await admin
      .firestore()
      .collection('users')
      .doc(state)
      .collection('integrations')
      .doc('gmail')
      .set(tokens, { merge: true });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
