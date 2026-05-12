import type { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { env } from '../../config/env.js';
import { User } from '../auth/user.model.js';
import crypto from 'node:crypto';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new UnauthorizedError();
  }
  if (!req.file) {
    res
      .status(400)
      .json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
    return;
  }

  const processedFilename = `avatar-${crypto.randomUUID()}.webp`;
  const outputPath = path.join(env.UPLOAD_DIR, processedFilename);

  await sharp(req.file.path)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(outputPath);

  await fs.unlink(req.file.path);

  const user = await User.findById(req.userId);
  if (user) {
    if (user.avatar) {
      const oldPath = path.join(env.UPLOAD_DIR, path.basename(user.avatar));
      await fs.unlink(oldPath).catch(() => {});
    }
    user.avatar = `/uploads/${processedFilename}`;
    await user.save();
  }

  sendSuccess(res, { avatar: `/uploads/${processedFilename}` });
});
