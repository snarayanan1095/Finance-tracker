import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { ServerGmailService } from './gmailService';

dotenv.config();

admin.initializeApp();

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

// GET /api/gmail/unread?userId=uid
app.get('/api/gmail/unread', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'userId query param required' });
  try {
    const unread = await gmailService.getUnreadEmails(userId);
    res.json(unread);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
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
    await admin.firestore().collection('gmailTokens').doc(state).set(tokens);

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
