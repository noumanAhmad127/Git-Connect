import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { User } from './user.model.js';
import { env } from '../../config/env.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';
import { AppError } from '../../shared/errors/AppError.js';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateTokenPair(userId: string, role: string): TokenPair {
  const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): { userId: string; role: string } {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
  } catch {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}

function sanitizeUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    headline: user.headline,
    bio: user.bio,
    skills: user.skills,
    location: user.location,
    role: user.role,
    emailVerified: user.emailVerified,
    followerCount: user.followers.length,
    followingCount: user.following.length,
    createdAt: user.createdAt,
  };
}

export async function register(params: {
  email: string;
  password: string;
  name: string;
  username: string;
}): Promise<{ user: ReturnType<typeof sanitizeUser>; tokens: TokenPair }> {
  const existingEmail = await User.findOne({ email: params.email.toLowerCase() });
  if (existingEmail) {
    throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');
  }

  const existingUsername = await User.findOne({ username: params.username.toLowerCase() });
  if (existingUsername) {
    throw new AppError('Username already taken', 409, 'USERNAME_TAKEN');
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const verificationToken = generateVerificationToken();

  const user = await User.create({
    email: params.email.toLowerCase(),
    passwordHash,
    name: params.name.trim(),
    username: params.username.toLowerCase(),
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    lastLogin: new Date(),
  });

  await sendVerificationEmail(user.email, verificationToken);

  const tokens = generateTokenPair(user._id.toString(), user.role);

  return { user: sanitizeUser(user), tokens };
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<{ user: ReturnType<typeof sanitizeUser>; tokens: TokenPair }> {
  const user = await User.findOne({ email: params.email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (user.banned) {
    throw new AppError('Account has been suspended', 403, 'ACCOUNT_BANNED');
  }

  const isValid = await bcrypt.compare(params.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  user.lastLogin = new Date();
  await user.save();

  const tokens = generateTokenPair(user._id.toString(), user.role);

  return { user: sanitizeUser(user), tokens };
}

export async function verifyEmail(token: string): Promise<void> {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return;
  }

  const resetToken = generateVerificationToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user.email, resetToken);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;
  await user.save();
}

export async function getMe(userId: string): Promise<ReturnType<typeof sanitizeUser>> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
}
