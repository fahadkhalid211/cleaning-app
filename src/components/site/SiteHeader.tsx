'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, Clock, Menu, Phone, User, X } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { SERVICE_SEED } from '@/lib/catalog-seed';
import type { MeResponse } from '@/lib/types';
import { api } from '@/lib/api';
import { ButtonLink } from '@/components/ui';
import { Logo } from './Logo';

const HOME_FOR_ROLE = { customer: '/account', cleaner: '/cleaner', admin: '/admin' } as const;

export function SiteHeader() {
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api<MeResponse>('/api/auth/me').then((r) => setMe(r.user), () => setMe(null));
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const accountHref = me ? HOME_FOR_ROLE[me.role] : '/login';
  const accountLabel = me ? 'My account' : 'Log in';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      {/* Utility bar */}
      <div className="hidden md:block bg-ink text-white text-[0.9rem]">
        <div className="mx-auto max-w-7xl px-6 h-10 flex items-center justify-between">
          <nav aria-label="Audience" className="flex items-center gap-1.5">
            <span className="rounded-full bg-white/15 px-3 py-0.5 font-semibold text-xs">For homes</span>
            <Link href="/#business" className="rounded-full px-3 py-0.5 text-white/80 hover:text-white text-xs">
              For businesses
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/cleaner/signup" className="rounded-full px-3 py-0.5 text-brand-soft hover:text-white font-medium text-xs">
              Become a cleaner
            </Link>
          </nav>
          <div className="flex items-center gap-6 text-white/85 text-xs sm:text-[0.85rem]">
            <Link href="/cleaner/login" className="text-white/75 hover:text-white transition">
              Cleaner portal
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> Mon–Sat, 8am–6pm
            </span>
            <a href={BRAND.phoneHref} className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline">
              <Phone className="size-3.5" aria-hidden /> {BRAND.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden lg:flex items-center gap-1 font-medium">
          <div className="relative group">
            <button className="inline-flex items-center gap-1 rounded-full px-4 py-2 hover:bg-soft" aria-haspopup="true">
              Services <ChevronDown className="size-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition absolute left-0 top-full pt-2">
              <ul className="w-72 rounded-card bg-white border border-line shadow-pop p-2">
                {SERVICE_SEED.map((s) => (
                  <li key={s.id}>
                    <Link href={`/book?service=${s.id}`} className="block rounded-lg px-4 py-3 hover:bg-soft">
                      <span className="block font-semibold">{s.title}</span>
                      <span className="block text-[0.9rem] text-muted">{s.short}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link href="/#how-it-works" className="rounded-full px-4 py-2 hover:bg-soft">
            How it works
          </Link>
          <Link href="/#prices" className="rounded-full px-4 py-2 hover:bg-soft">
            Prices
          </Link>
          <Link href="/#faq" className="rounded-full px-4 py-2 hover:bg-soft">
            Help
          </Link>
          <Link href="/cleaner/signup" className="rounded-full px-4 py-2 hover:bg-soft text-brand-deep font-semibold">
            Clean with us
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={accountHref} className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-semibold hover:bg-soft">
            <User className="size-5" aria-hidden /> {accountLabel}
          </Link>
          <div className="hidden sm:block">
            <ButtonLink href="/book">Book a clean</ButtonLink>
          </div>
          <a href={BRAND.phoneHref} className="sm:hidden flex size-11 items-center justify-center rounded-full border-2 border-line" aria-label={`Call us on ${BRAND.phone}`}>
            <Phone className="size-5" aria-hidden />
          </a>
          <button
            className="lg:hidden flex size-11 items-center justify-center rounded-full border-2 border-line"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-up" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="px-4 h-18 flex items-center justify-between border-b border-line">
            <Logo />
            <button className="flex size-11 items-center justify-center rounded-full border-2 border-line" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <nav className="px-4 py-6 space-y-8" onClick={(e) => (e.target as HTMLElement).closest('a') && setMenuOpen(false)}>
            <div className="grid gap-3">
              <ButtonLink href="/book" size="lg">
                Book a clean
              </ButtonLink>
              <ButtonLink href={accountHref} size="lg" variant="secondary">
                <User className="size-5" aria-hidden /> {accountLabel}
              </ButtonLink>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted mb-2">Services</p>
              <ul className="divide-y divide-line">
                {SERVICE_SEED.map((s) => (
                  <li key={s.id}>
                    <Link href={`/book?service=${s.id}`} className="block py-4 text-lg font-medium">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="divide-y divide-line border-t border-line">
              <li><Link href="/#how-it-works" className="block py-4 text-lg font-medium">How it works</Link></li>
              <li><Link href="/#prices" className="block py-4 text-lg font-medium">Prices</Link></li>
              <li><Link href="/#faq" className="block py-4 text-lg font-medium">Help & questions</Link></li>
              <li><Link href="/#business" className="block py-4 text-lg font-medium">For businesses</Link></li>
              <li>
                <Link href="/cleaner/signup" className="block py-4 text-lg font-semibold text-brand-strong">
                  Become a cleaner (Sign up)
                </Link>
              </li>
              <li>
                <Link href="/cleaner/login" className="block py-4 text-base font-medium text-muted">
                  Cleaner portal log in
                </Link>
              </li>
            </ul>
            <a href={BRAND.phoneHref} className="flex items-center gap-3 rounded-card bg-soft p-4">
              <Phone className="size-6 text-brand-strong" aria-hidden />
              <span>
                <span className="block text-muted">Prefer to talk? Call us</span>
                <span className="block text-xl font-semibold">{BRAND.phone}</span>
              </span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
