import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.js';

import authRoutes from './routes/auth.js';
import memeRoutes from './routes/memes.js';
import adminRoutes from './routes/admin.js';
import pollRoutes from './routes/polls.js';
import teacherRoutes from './routes/teachers.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api', memeRoutes);
app.use('/api', teacherRoutes);       // public: /api/teachers
app.use('/api', pollRoutes);           // public: /api/polls
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Meme API running on http://localhost:${PORT}`));