'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { api } from '@/lib/api';
import { Logo } from '@/components/site/Logo';

export function PortalShell({ area, name, children, dark }: { area: string; name: string; children: React.ReactNode; dark?: boolean }) {
  const router = useRouter();
  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace(dark ? '/admin/login' : '/cleaner/login');
    router.refresh();
  }
  return (
    <div className="min-h-screen bg-soft">
      <header className={dark ? 'bg-ink text-white' : 'bg-white border-b border-line'}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo tone={dark ? 'light' : 'dark'} href={dark ? '/admin' : '/cleaner'} />
            <span className={dark ? 'hidden sm:inline rounded-full bg-white/15 px-3 py-1 text-sm font-semibold' : 'hidden sm:inline rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep'}>
              {area}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={dark ? 'hidden sm:inline text-white/80' : 'hidden sm:inline text-muted'}>{name}</span>
            <button
              onClick={logout}
              className={
                dark
                  ? 'inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-4 py-2 font-semibold hover:bg-white/10'
                  : 'inline-flex items-center gap-2 rounded-full border-2 border-line px-4 py-2 font-semibold hover:border-ink/40'
              }
            >
              <LogOut className="size-4" aria-hidden /> Log out
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
