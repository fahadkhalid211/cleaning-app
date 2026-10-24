'use client';

import { useState } from 'react';
import { LoginForm, RegisterForm } from '@/components/auth/AuthForms';
import { Card, cx } from '@/components/ui';

export function CustomerAuth() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <h1 className="text-3xl font-semibold">{tab === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="mt-2 text-muted text-lg">{tab === 'login' ? 'Log in to see, change or cancel your bookings.' : 'It takes less than a minute.'}</p>

      <div className="mt-6 grid grid-cols-2 rounded-full bg-soft p-1" role="tablist" aria-label="Log in or create account">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx('min-h-11 rounded-full font-semibold transition', tab === t ? 'bg-white shadow-card' : 'text-muted hover:text-ink')}
          >
            {t === 'login' ? 'Log in' : 'New customer'}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === 'login' ? <LoginForm portal="customer" /> : <RegisterForm />}</div>
    </Card>
  );
}
