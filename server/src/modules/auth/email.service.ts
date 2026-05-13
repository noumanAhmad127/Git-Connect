import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${env.API_URL}/api/v1/auth/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: 'GitConnect <noreply@gitconnect.dev>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin: 0 0 16px; color: #0f172a;">Verify your email</h1>
            <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">Click the button below to verify your email address and activate your GitConnect account.</p>
            <a href="${verificationUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Verify Email</a>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    logger.info({ email }, 'Verification email sent');
  } catch (error) {
    logger.error({ err: error, email }, 'Failed to send verification email');
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'GitConnect <noreply@gitconnect.dev>',
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="font-size: 24px; margin: 0 0 16px; color: #0f172a;">Reset your password</h1>
            <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">Click the button below to set a new password for your GitConnect account.</p>
            <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Reset Password</a>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    logger.info({ email }, 'Password reset email sent');
  } catch (error) {
    logger.error({ err: error, email }, 'Failed to send password reset email');
    throw new Error('Failed to send password reset email');
  }
}
