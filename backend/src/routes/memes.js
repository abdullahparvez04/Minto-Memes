import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';

const router = Router();

function attachCategories(meme) {
  const cats = db
    .prepare(
      `SELECT c.name, c.slug FROM categories c
       JOIN meme_categories mc ON mc.category_id = c.id
       WHERE mc.meme_id = ?`
    )
    .all(meme.id);
  return { ...meme, categories: cats };
}

router.get('/categories', (req, res) => {
  const cats = db.prepare('SELECT id, name, slug FROM categories ORDER BY name').all();
  res.json(cats);
});

router.get('/memes', (req, res) => {
  const { category, search, sort = 'new' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const offset = (page - 1) * limit;

  let where = [];
  let params = {};

  if (category) {
    where.push(`m.id IN (
      SELECT mc.meme_id FROM meme_categories mc
      JOIN categories c ON c.id = mc.category_id
      WHERE c.slug = @category
    )`);
    params.category = category;
  }
  if (search) {
    where.push('(m.title LIKE @search OR m.caption LIKE @search)');
    params.search = `%${search}%`;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy =
    sort === 'top'
      ? 'ORDER BY m.is_pinned DESC, (m.upvotes - m.downvotes) DESC, m.created_at DESC'
      : 'ORDER BY m.is_pinned DESC, m.created_at DESC';

  const total = db
    .prepare(`SELECT COUNT(*) AS c FROM memes m ${whereClause}`)
    .get(params).c;

  const rows = db
    .prepare(
      `SELECT m.* FROM memes m ${whereClause} ${orderBy} LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset });

  res.json({
    data: rows.map(attachCategories),
    page,
    limit,
    total,
    hasMore: offset + rows.length < total,
  });
});

router.get('/memes/random', (req, res) => {
  const meme = db.prepare('SELECT * FROM memes ORDER BY RANDOM() LIMIT 1').get();
  if (!meme) return res.status(404).json({ error: 'No memes yet' });
  res.json(attachCategories(meme));
});

router.get('/memes/:slug', (req, res) => {
  const meme = db.prepare('SELECT * FROM memes WHERE slug = ?').get(req.params.slug);
  if (!meme) return res.status(404).json({ error: 'Meme not found' });
  res.json(attachCategories(meme));
});

function getFingerprint(req) {
  const raw = `${req.ip}-${req.headers['user-agent'] || ''}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function columnFor(type) {
  if (type === 'up') return 'upvotes';
  if (type === 'down') return 'downvotes';
  return 'crazy_votes';
}

router.post('/memes/:slug/vote', (req, res) => {
  const { type } = req.body;
  if (!['up', 'down', 'crazy'].includes(type)) {
    return res.status(400).json({ error: 'type must be "up", "down", or "crazy"' });
  }

  const meme = db.prepare('SELECT * FROM memes WHERE slug = ?').get(req.params.slug);
  if (!meme) return res.status(404).json({ error: 'Meme not found' });

  const fingerprint = getFingerprint(req);
  const existing = db
    .prepare('SELECT * FROM votes WHERE meme_id = ? AND fingerprint = ?')
    .get(meme.id, fingerprint);

  const tx = db.transaction(() => {
    if (!existing) {
      db.prepare(
        'INSERT INTO votes (meme_id, fingerprint, vote_type) VALUES (?, ?, ?)'
      ).run(meme.id, fingerprint, type);
      const col = columnFor(type);
      db.prepare(`UPDATE memes SET ${col} = ${col} + 1 WHERE id = ?`).run(meme.id);
    } else if (existing.vote_type !== type) {
      const oldCol = columnFor(existing.vote_type);
      const newCol = columnFor(type);
      db.prepare(`UPDATE memes SET ${oldCol} = MAX(${oldCol} - 1, 0) WHERE id = ?`).run(meme.id);
      db.prepare(`UPDATE memes SET ${newCol} = ${newCol} + 1 WHERE id = ?`).run(meme.id);
      db.prepare('UPDATE votes SET vote_type = ? WHERE id = ?').run(type, existing.id);
    }
  });
  tx();

  const updated = db.prepare('SELECT * FROM memes WHERE id = ?').get(meme.id);
  res.json({
    upvotes: updated.upvotes,
    downvotes: updated.downvotes,
    crazyVotes: updated.crazy_votes,
    yourVote: type,
  });
});

export default router;
