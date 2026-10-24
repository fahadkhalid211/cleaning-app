'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError, safeNext } from '@/lib/api';
import { BRAND } from '@/lib/config';
import { Alert, Button, TextField } from '@/components/ui';

type Portal = 'customer' | 'cleaner' | 'admin';
const HOME: Record<Portal, string> = { customer: '/account', cleaner: '/cleaner', admin: '/admin' };

export function LoginForm({ portal }: { portal: Portal }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/auth/login', { body: { email: email.trim(), password, portal } });
      router.replace(safeNext(params.get('next'), HOME[portal]));
      router.refresh();
    } catch (err) {
      setError((err as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && <Alert tone="error">{error}</Alert>}
      <TextField label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoFocus />
      <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit" size="lg" loading={busy} className="w-full" variant={portal === 'admin' ? 'dark' : 'primary'}>
        Log in
      </Button>
      <p className="text-center text-muted">
        Forgotten your password? Call us on{' '}
        <a href={BRAND.phoneHref} className="font-semibold text-ink underline underline-offset-4">
          {BRAND.phone}
        </a>
        {portal !== 'customer' && ' or ask your manager'}.
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setErrors({});
    setBusy(true);
    try {
      await api('/api/auth/register', { body: f });
      router.replace(safeNext(params.get('next'), '/account'));
      router.refresh();
    } catch (err) {
      const ae = err as ApiError;
      if (ae.field) setErrors({ [ae.field]: ae.message });
      else setError(ae.message);
      setBusy(false);
    }
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && <Alert tone="error">{error}</Alert>}
      <TextField label="Full name" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} maxLength={80} />
      <TextField label="Email address" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} maxLength={254} />
      <TextField label="Phone number" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} error={errors.phone} maxLength={25} />
      <TextField label="Choose a password" hint="At least 8 characters." type="password" autoComplete="new-password" value={f.password} onChange={set('password')} error={errors.password} />
      <Button type="submit" size="lg" loading={busy} className="w-full">
        Create account
      </Button>
    </form>
  );
}
