'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles, UserCheck } from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { cx } from '@/components/ui';
import { CleanerRegisterForm, LoginForm } from './AuthForms';

interface CleanerAuthProps {
  initialTab?: 'login' | 'register';
}

function CleanerAuthInner({ initialTab = 'login' }: CleanerAuthProps) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [tab, setTab] = useState<'login' | 'register'>(
    requestedTab === 'register' || requestedTab === 'signup' ? 'register' : initialTab,
  );

  return (
    <div className="min-h-screen bg-cream/60">
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <Logo tone="dark" />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> Main site
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-pop border border-line">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-deep">
              <Sparkles className="size-3.5" aria-hidden />
              Cleaner Portal
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold">
            {tab === 'login' ? 'Cleaner log in' : 'Join our cleaning team'}
          </h1>
          <p className="mt-2 text-muted text-base mb-6">
            {tab === 'login'
              ? 'See your jobs for today, manage bookings and report job status.'
              : 'Sign up to start receiving local domestic and commercial cleaning jobs.'}
          </p>

          <div className="mb-6 grid grid-cols-2 rounded-full bg-soft p-1" role="tablist" aria-label="Cleaner login or registration">
            <button
              role="tab"
              type="button"
              aria-selected={tab === 'login'}
              onClick={() => setTab('login')}
              className={cx(
                'min-h-10 rounded-full text-sm font-semibold transition',
                tab === 'login' ? 'bg-white shadow-card text-ink' : 'text-muted hover:text-ink',
              )}
            >
              Log in
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={tab === 'register'}
              onClick={() => setTab('register')}
              className={cx(
                'min-h-10 rounded-full text-sm font-semibold transition',
                tab === 'register' ? 'bg-white shadow-card text-ink' : 'text-muted hover:text-ink',
              )}
            >
              Sign up / Apply
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm portal="cleaner" />
          ) : (
            <CleanerRegisterForm />
          )}

          <div className="mt-8 pt-6 border-t border-line text-center text-xs text-muted">
            {tab === 'login' ? (
              <p>
                New cleaner looking for regular work?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="font-semibold text-brand-strong hover:underline"
                >
                  Apply to clean here
                </button>
              </p>
            ) : (
              <p>
                Already registered with us?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="font-semibold text-brand-strong hover:underline"
                >
                  Log into your account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CleanerAuth(props: CleanerAuthProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream/60 flex items-center justify-center p-8 text-muted">Loading...</div>}>
      <CleanerAuthInner {...props} />
    </Suspense>
  );
}
