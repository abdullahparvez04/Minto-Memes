// Run with: npm run seed:admin
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env and creates (or updates) the admin account.
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from '../db.js';

dotenv.config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
const existing = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

if (existing) {
  db.prepare('UPDATE admins SET password_hash = ? WHERE email = ?').run(hash, email);
  console.log(`Updated password for existing admin: ${email}`);
} else {
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(email, hash);
  console.log(`Created admin: ${email}`);
}
process.exit(0);