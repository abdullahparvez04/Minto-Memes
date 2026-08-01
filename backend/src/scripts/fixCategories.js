import { db } from '../db.js';

const toRemove = ['cafeteria', 'classof2026', 'clubs'];

const deleteStmt = db.prepare('DELETE FROM categories WHERE slug = ?');
for (const slug of toRemove) {
  const result = deleteStmt.run(slug);
  console.log(`Removed slug "${slug}": ${result.changes} row(s)`);
}

const existing = db.prepare('SELECT * FROM categories WHERE slug = ?').get('assembly');
if (!existing) {
  db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run('Assembly', 'assembly');
  console.log('Added: Assembly');
} else {
  console.log('Assembly already exists');
}

console.log('Done. Current categories:');
console.log(db.prepare('SELECT name, slug FROM categories ORDER BY name').all());
process.exit(0);
