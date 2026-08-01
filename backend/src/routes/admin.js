import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(requireAdmin);

function slugify(title) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${nanoid(6)}`;
}

function setCategories(memeId, categoryIds = []) {
  db.prepare('DELETE FROM meme_categories WHERE meme_id = ?').run(memeId);
  const insert = db.prepare('INSERT INTO meme_categories (meme_id, category_id) VALUES (?, ?)');
  for (const catId of categoryIds) insert.run(memeId, catId);
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg'];

function detectMediaType(file, url) {
  if (file) return file.mimetype.startsWith('video') ? 'video' : 'image';
  if (url) {
    const lower = url.toLowerCase();
    if (VIDEO_EXTENSIONS.some((ext) => lower.includes(ext))) return 'video';
  }
  return 'image';
}

router.post('/memes', upload.single('image'), (req, res) => {
  const { title, caption, imageUrl, categoryIds } = req.body;
  if (!title || (!req.file && !imageUrl)) {
    return res.status(400).json({ error: 'Title and either a file or a URL are required' });
  }

  const finalImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl;
  const mediaType = detectMediaType(req.file, imageUrl);
  const slug = slugify(title);

  const result = db
    .prepare('INSERT INTO memes (slug, title, caption, image_url, media_type) VALUES (?, ?, ?, ?, ?)')
    .run(slug, title, caption || null, finalImageUrl, mediaType);

  const ids = categoryIds ? JSON.parse(categoryIds) : [];
  if (ids.length) setCategories(result.lastInsertRowid, ids);

  const meme = db.prepare('SELECT * FROM memes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(meme);
});

router.put('/memes/:id', upload.single('image'), (req, res) => {
  const { title, caption, imageUrl, categoryIds } = req.body;
  const meme = db.prepare('SELECT * FROM memes WHERE id = ?').get(req.params.id);
  if (!meme) return res.status(404).json({ error: 'Meme not found' });

  const finalImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl || meme.image_url;
  const mediaType = req.file || imageUrl ? detectMediaType(req.file, imageUrl) : meme.media_type;

  db.prepare(
    `UPDATE memes SET title = ?, caption = ?, image_url = ?, media_type = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(title ?? meme.title, caption ?? meme.caption, finalImageUrl, mediaType, meme.id);

  if (categoryIds) setCategories(meme.id, JSON.parse(categoryIds));

  const updated = db.prepare('SELECT * FROM memes WHERE id = ?').get(meme.id);
  res.json(updated);
});

router.delete('/memes/:id', (req, res) => {
  const result = db.prepare('DELETE FROM memes WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Meme not found' });
  res.json({ success: true });
});

router.patch('/memes/:id/pin', (req, res) => {
  const { pinned } = req.body;
  const result = db
    .prepare('UPDATE memes SET is_pinned = ? WHERE id = ?')
    .run(pinned ? 1 : 0, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Meme not found' });
  res.json({ success: true });
});

router.get('/analytics', (req, res) => {
  const totalMemes = db.prepare('SELECT COUNT(*) AS c FROM memes').get().c;
  const totalUpvotes = db.prepare('SELECT COALESCE(SUM(upvotes),0) AS c FROM memes').get().c;
  const totalDownvotes = db.prepare('SELECT COALESCE(SUM(downvotes),0) AS c FROM memes').get().c;
  const topMemes = db
    .prepare(
      `SELECT id, title, slug, upvotes, downvotes, (upvotes - downvotes) AS score
       FROM memes ORDER BY score DESC LIMIT 5`
    )
    .all();

  res.json({
    totalMemes,
    totalUpvotes,
    totalDownvotes,
    totalInteractions: totalUpvotes + totalDownvotes,
    topMemes,
  });
});

router.post('/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    const result = db
      .prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
      .run(name, slug);
    res.status(201).json({ id: result.lastInsertRowid, name, slug });
  } catch (e) {
    res.status(409).json({ error: 'Category already exists' });
  }
});

router.post('/teachers', (req, res) => {
  const { name, photoUrl, badge } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const result = db
    .prepare('INSERT INTO teachers (name, photo_url, badge) VALUES (?, ?, ?)')
    .run(name, photoUrl || null, badge || null);
  const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(teacher);
});

router.put('/teachers/:id', (req, res) => {
  const { name, photoUrl, badge } = req.body;
  const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  db.prepare('UPDATE teachers SET name = ?, photo_url = ?, badge = ? WHERE id = ?').run(
    name ?? teacher.name,
    photoUrl ?? teacher.photo_url,
    badge ?? teacher.badge,
    teacher.id
  );
  const updated = db.prepare('SELECT * FROM teachers WHERE id = ?').get(teacher.id);
  res.json(updated);
});

router.delete('/teachers/:id', (req, res) => {
  const result = db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ success: true });
});

router.post('/polls', (req, res) => {
  const { question, options } = req.body;
  if (!question || !Array.isArray(options) || options.filter((o) => o.trim()).length < 2) {
    return res.status(400).json({ error: 'A question and at least 2 options are required' });
  }
  const result = db.prepare('INSERT INTO polls (question) VALUES (?)').run(question);
  const insertOpt = db.prepare('INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)');
  for (const opt of options) {
    if (opt.trim()) insertOpt.run(result.lastInsertRowid, opt.trim());
  }
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(result.lastInsertRowid);
  const opts = db.prepare('SELECT id, option_text, votes FROM poll_options WHERE poll_id = ?').all(poll.id);
  res.status(201).json({ ...poll, options: opts });
});

router.delete('/polls/:id', (req, res) => {
  const result = db.prepare('DELETE FROM polls WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Poll not found' });
  res.json({ success: true });
});

export default router;
