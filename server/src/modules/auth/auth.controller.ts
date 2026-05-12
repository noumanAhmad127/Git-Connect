import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { env } from '../../config/env.js';
import * as authService from './auth.service.js';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  username: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface ResetPasswordBody {
  token: string;
  password: string;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterBody;
  const result = await authService.register(body);
  sendCreated(res, result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginBody;
  const result = await authService.login(body);

  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });

  sendSuccess(res, {
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
});

export const logout = asyncHandler((_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  sendSuccess(res, { message: 'Logged out successfully' });
  return Promise.resolve();
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    sendSuccess(res, { message: 'No token provided' });
    return;
  }
  await authService.verifyEmail(token);
  sendSuccess(res, { message: 'Email verified successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const email = (req.body as { email: string }).email;
  await authService.forgotPassword(email);
  sendSuccess(res, { message: 'If the email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ResetPasswordBody;
  await authService.resetPassword(body.token, body.password);
  sendSuccess(res, { message: 'Password reset successfully' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new UnauthorizedError();
  }
  const user = await authService.getMe(req.userId);
  sendSuccess(res, user);
});
