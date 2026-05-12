import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authLimiter } from '../../shared/middleware/rateLimiter.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@gitconnect/shared';
import * as authController from './auth.controller.js';

const router = Router();

router.use('/auth', authLimiter);

router.post('/auth/register', validate({ body: registerSchema }), authController.register);
router.post('/auth/login', validate({ body: loginSchema }), authController.login);
router.post('/auth/logout', authController.logout);

router.get('/auth/verify-email', authController.verifyEmail);
router.post(
  '/auth/forgot-password',
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);
router.post(
  '/auth/reset-password',
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

router.get('/auth/me', authenticate, authController.getMe);

export default router;
