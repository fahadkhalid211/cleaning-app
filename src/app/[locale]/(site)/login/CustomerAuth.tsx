'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoginForm, RegisterForm } from '@/components/auth/AuthForms';
import { Card, cx } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

export function CustomerAuth() {
  const { t } = useI18n();
  const a = t.auth;
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <h1 className="text-3xl font-semibold">{tab === 'login' ? a.loginTitle : a.registerTitle}</h1>
      <p className="mt-2 text-muted text-lg">{tab === 'login' ? a.loginSub : a.registerSub}</p>

      <div className="mt-6 grid grid-cols-2 rounded-full bg-soft p-1" role="tablist" aria-label="Log in or create account">
        {(['login', 'register'] as const).map((tTab) => (
          <button
            key={tTab}
            role="tab"
            aria-selected={tab === tTab}
            onClick={() => setTab(tTab)}
            className={cx('min-h-11 rounded-full font-semibold transition', tab === tTab ? 'bg-white shadow-card' : 'text-muted hover:text-ink')}
          >
            {tTab === 'login' ? a.tabLogin : a.tabRegister}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === 'login' ? <LoginForm portal="customer" /> : <RegisterForm />}</div>

      <div className="mt-8 pt-6 border-t border-line text-center text-sm text-muted">
        {a.cleanerWorkPrompt}{' '}
        <Link href="/cleaner/signup" className="font-semibold text-brand-strong hover:underline">
          {a.joinCleaningTeam}
        </Link>
      </div>
    </Card>
  );
}
