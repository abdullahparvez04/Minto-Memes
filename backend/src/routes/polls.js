import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';

const router = Router();

function getFingerprint(req) {
  const raw = `${req.ip}-${req.headers['user-agent'] || ''}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function attachOptions(poll) {
  const options = db
    .prepare('SELECT id, option_text, votes FROM poll_options WHERE poll_id = ?')
    .all(poll.id);
  return { ...poll, options };
}

router.get('/polls', (req, res) => {
  const polls = db.prepare('SELECT * FROM polls ORDER BY created_at DESC').all();
  res.json(polls.map(attachOptions));
});

router.post('/polls/:id/vote', (req, res) => {
  const { optionId } = req.body;
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  const option = db
    .prepare('SELECT * FROM poll_options WHERE id = ? AND poll_id = ?')
    .get(optionId, poll.id);
  if (!option) return res.status(400).json({ error: 'Invalid option' });

  const fingerprint = getFingerprint(req);
  const existing = db
    .prepare('SELECT * FROM poll_votes WHERE poll_id = ? AND fingerprint = ?')
    .get(poll.id, fingerprint);
  if (existing) {
    return res.status(409).json({ error: 'You already voted in this poll' });
  }

  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO poll_votes (poll_id, fingerprint, option_id) VALUES (?, ?, ?)'
    ).run(poll.id, fingerprint, optionId);
    db.prepare('UPDATE poll_options SET votes = votes + 1 WHERE id = ?').run(optionId);
  });
  tx();

  const options = db
    .prepare('SELECT id, option_text, votes FROM poll_options WHERE poll_id = ?')
    .all(poll.id);
  res.json({ options, yourOptionId: optionId });
});

export default router;
