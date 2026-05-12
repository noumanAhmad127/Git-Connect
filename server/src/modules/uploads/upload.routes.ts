import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { upload, uploadAvatar } from './upload.controller.js';

const router = Router();

router.post('/uploads/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
