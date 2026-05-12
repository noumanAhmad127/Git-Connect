import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '@/features/auth/authApi';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    resetPassword({ token, password })
      .unwrap()
      .then(() =>
        setTimeout(() => {
          navigate('/login');
        }, 2000),
      )
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to reset password');
      });
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Password reset</h1>
          <p className="text-muted-foreground text-sm">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
              placeholder="At least 8 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
