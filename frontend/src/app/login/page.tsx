'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { getToken } from '@/lib/auth-storage';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Inline Google "G" mark (lucide has no brand icons). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}

/** Decorative floating avatars behind the card (purely cosmetic). */
const DECOR_AVATARS = [
  { seed: 'Aria', className: 'left-[8%] top-[16%] h-14 w-14' },
  { seed: 'Leo', className: 'left-[18%] top-[62%] h-16 w-16' },
  { seed: 'Mia', className: 'left-[12%] bottom-[10%] h-10 w-10' },
  { seed: 'Noah', className: 'right-[10%] top-[14%] h-16 w-16' },
  { seed: 'Zoe', className: 'right-[16%] top-[58%] h-12 w-12' },
  { seed: 'Kai', className: 'right-[8%] bottom-[12%] h-14 w-14' },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAsGuest, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');

  // If a session already exists, skip the login screen.
  useEffect(() => {
    if (getToken()) router.replace('/tasks');
  }, [router]);

  const handleGuest = async () => {
    try {
      await loginAsGuest();
      router.replace('/tasks');
    } catch {
      toast.error('Could not start a guest session. Please try again.');
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 px-4">
      {/* Decorative avatar bubbles — hidden on small screens, non-interactive. */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        {DECOR_AVATARS.map((a) => (
          <Image
            key={a.seed}
            src={`https://api.dicebear.com/7.x/thumbs/png?seed=${a.seed}`}
            alt=""
            width={64}
            height={64}
            className={`absolute rounded-full opacity-30 blur-[0.5px] ring-1 ring-border ${a.className}`}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo className="mb-2 h-10 w-10" />
          <h1 className="text-xl font-semibold tracking-tight">
            Let&apos;s get back on track
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGuest();
              }}
            />
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleGuest}
            disabled={isLoggingIn}
          >
            {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue as Guest
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              toast.info(
                'Google login is a stub in this demo — use “Continue as Guest”.',
              )
            }
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Login with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
