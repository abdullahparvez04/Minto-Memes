import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/teachers', (req, res) => {
  const teachers = db.prepare('SELECT * FROM teachers ORDER BY created_at DESC').all();
  res.json(teachers);
});

export default router;
