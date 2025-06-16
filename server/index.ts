import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { ServerGmailService } from './gmailService.ts';

dotenv.config();

admin.initializeApp();

const app = express();
app.use(cors());
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
