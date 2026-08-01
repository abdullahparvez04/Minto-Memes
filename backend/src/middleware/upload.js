import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

const uploadsDir = process.env.UPLOADS_DIR || './uploads';
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid(10)}${ext}`);
  },
});

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

function fileFilter(req, file, cb) {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, GIF, WEBP images or MP4/WEBM/MOV videos are allowed'));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB, enough for short video clips
});
