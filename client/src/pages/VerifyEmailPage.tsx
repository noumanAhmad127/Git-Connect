import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifyEmailMutation } from '@/features/auth/authApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verifyEmail, { isLoading, isSuccess, isError }] = useVerifyEmailMutation();
  const [called, setCalled] = useState(false);

  useEffect(() => {
    if (token && !called) {
      setCalled(true);
      verifyEmail({ token }).catch(() => {
        // Error handled by isError state
      });
    }
  }, [token, called, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        {isLoading && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Verifying email...</h1>
            <p className="text-muted-foreground text-sm">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {isSuccess && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Email verified!</h1>
            <p className="text-muted-foreground text-sm">
              Your email has been verified. You can now sign in.
            </p>
            <Link to="/login" className="text-primary block text-sm hover:underline">
              Sign in
            </Link>
          </>
        )}

        {isError && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Verification failed</h1>
            <p className="text-muted-foreground text-sm">
              The verification link is invalid or has expired. Try signing up again.
            </p>
            <Link to="/register" className="text-primary block text-sm hover:underline">
              Create new account
            </Link>
          </>
        )}

        {!token && !isSuccess && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground text-sm">
              We've sent a verification link to your email. Please click the link to activate your
              account.
            </p>
            <Link to="/login" className="text-primary block text-sm hover:underline">
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
