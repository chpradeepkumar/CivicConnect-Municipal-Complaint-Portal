import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { randomFileName } from '../utils/generate.js';

const uploadDir = path.join(env.uploadPath, 'complaints');
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, randomFileName(file.originalname)),
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, WEBP or GIF images are allowed'));
  }
  return cb(null, true);
}

export const uploadComplaintImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadBytes, files: 5 },
}).array('images', 5);

export const uploadDirPath = uploadDir;

export default uploadComplaintImages;
