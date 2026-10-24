import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { LoginForm } from './AuthForms';

/** Login screen for the cleaner and admin areas: no marketing, just the form. */
export function StaffLogin({ portal, title, sub }: { portal: 'cleaner' | 'admin'; title: string; sub: string }) {
  const dark = portal === 'admin';
  return (
    <div className={dark ? 'min-h-screen bg-ink' : 'min-h-screen bg-cream/60'}>
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className="flex items-center justify-between mb-10">
          <Logo tone={dark ? 'light' : 'dark'} />
          <Link href="/" className={dark ? 'inline-flex items-center gap-1 text-white/80 hover:text-white' : 'inline-flex items-center gap-1 text-muted hover:text-ink'}>
            <ArrowLeft className="size-4" aria-hidden /> Main site
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-pop">
          <p className={dark ? 'inline-block rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white' : 'inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep'}>
            {portal === 'admin' ? 'Admin area' : 'Cleaner area'}
          </p>
          <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-muted text-lg mb-6">{sub}</p>
          <Suspense>
            <LoginForm portal={portal} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
