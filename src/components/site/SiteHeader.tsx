'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Bed, ChevronDown, Clock, Menu, Phone, User, X } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { SERVICE_SEED } from '@/lib/catalog-seed';
import type { MeResponse } from '@/lib/types';
import { api } from '@/lib/api';
import { ButtonLink } from '@/components/ui';
import { Logo } from './Logo';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

const HOME_FOR_ROLE = { customer: '/account', cleaner: '/cleaner', admin: '/admin' } as const;
const noopSubscribe = () => () => {};

export function SiteHeader() {
  const { t, l } = useI18n();
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    api<MeResponse>('/api/auth/me').then(
      (r) => setMe(r.user),
      () => setMe(null),
    );
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, mounted]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const accountHref = me ? (me.role === 'customer' ? l('/account') : HOME_FOR_ROLE[me.role]) : l('/login');
  const accountLabel = me ? t.common.myAccount : t.common.logIn;

  // Localized service titles
  const localizedServices = SERVICE_SEED.map((s) => {
    const localized = t.servicesCatalog?.[s.id];
    if (localized) {
      return { ...s, title: localized.title, short: localized.short };
    }
    return s;
  });

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
        {/* Utility bar */}
        <div className="hidden md:block bg-ink text-white text-[0.9rem]">
          <div className="mx-auto max-w-7xl px-6 h-10 flex items-center justify-between">
            <nav aria-label="Audience" className="flex items-center gap-1.5">
              <span className="rounded-full bg-white/15 px-3 py-0.5 font-semibold text-xs">
                {t.common.forHomes}
              </span>
              <Link
                href={l('/#business')}
                className="rounded-full px-3 py-0.5 text-white/80 hover:text-white text-xs"
              >
                {t.common.forBusinesses}
              </Link>
              <Link
                href={l('/hostel')}
                className="rounded-full bg-brand/80 px-3 py-0.5 text-white hover:bg-brand text-xs font-semibold"
              >
                {t.common.hostelAndBunks}
              </Link>
            </nav>
            <div className="flex items-center gap-6 text-white/85 text-xs sm:text-[0.85rem]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden /> {t.common.hours}
              </span>
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline"
              >
                <Phone className="size-3.5" aria-hidden /> {BRAND.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-18 flex items-center justify-between gap-3 sm:gap-4">
          <Logo href={l('/')} />

          <nav aria-label="Main" className="hidden lg:flex items-center gap-1 font-medium">
            <div className="relative group">
              <button
                className="inline-flex items-center gap-1 rounded-full px-4 py-2 hover:bg-soft"
                aria-haspopup="true"
              >
                {t.common.services}{' '}
                <ChevronDown
                  className="size-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                  aria-hidden
                />
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition absolute left-0 top-full pt-2">
                <ul className="w-72 rounded-card bg-white border border-line shadow-pop p-2">
                  {localizedServices.map((s) => (
                    <li key={s.id}>
                      <Link href={l(`/book?service=${s.id}`)} className="block rounded-lg px-4 py-3 hover:bg-soft">
                        <span className="block font-semibold">{s.title}</span>
                        <span className="block text-[0.9rem] text-muted">{s.short}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href={l('/hostel')}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 hover:bg-soft text-brand-strong font-semibold"
            >
              <Bed className="size-4" aria-hidden />
              <span>{t.common.hostelAndBunks}</span>
              <span className="rounded-full bg-brand-light px-1.5 py-0.2 text-[10px] font-extrabold text-brand-strong uppercase">
                {t.common.newBadge}
              </span>
            </Link>
            <Link href={l('/#how-it-works')} className="rounded-full px-4 py-2 hover:bg-soft">
              {t.common.howItWorks}
            </Link>
            <Link href={l('/#prices')} className="rounded-full px-4 py-2 hover:bg-soft">
              {t.common.prices}
            </Link>
            <Link href={l('/#faq')} className="rounded-full px-4 py-2 hover:bg-soft">
              {t.common.help}
            </Link>
          </nav>

          {/* Top Right Action & Language Switcher Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Prominent Flag Switcher on Top Right */}
            <LanguageSwitcher className="mr-0.5 sm:mr-1" />

            <Link
              href={accountHref}
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 font-semibold text-sm hover:bg-soft"
            >
              <User className="size-4" aria-hidden /> {accountLabel}
            </Link>

            <div className="hidden sm:block">
              <ButtonLink href={l('/book')}>{t.common.bookAClean}</ButtonLink>
            </div>

            <a
              href={BRAND.phoneHref}
              className="sm:hidden flex size-10 items-center justify-center rounded-full border border-line"
              aria-label={`${t.common.callUs} ${BRAND.phone}`}
            >
              <Phone className="size-4" aria-hidden />
            </a>

            <button
              type="button"
              className="lg:hidden flex size-10 items-center justify-center rounded-full border border-line hover:bg-soft transition"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? t.common.closeMenu : t.common.menu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer rendered via portal */}
      {mounted &&
        menuOpen &&
        createPortal(
          <div
            className="lg:hidden fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col min-h-screen w-full"
            role="dialog"
            aria-modal="true"
            aria-label={t.common.menu}
          >
            <div className="px-4 h-18 shrink-0 flex items-center justify-between border-b border-line bg-white sticky top-0 z-10">
              <div onClick={() => setMenuOpen(false)}>
                <Logo href={l('/')} />
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button
                  type="button"
                  className="flex size-10 items-center justify-center rounded-full border border-line hover:bg-soft transition"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t.common.closeMenu}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            <nav
              className="flex-1 px-4 py-6 space-y-7"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('a, button')) {
                  setMenuOpen(false);
                }
              }}
            >
              {/* Language selection banner in mobile menu */}
              <div className="rounded-2xl bg-soft p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Language / 语言</span>
                <LanguageSwitcher variant="full" />
              </div>

              <div className="grid gap-3">
                <ButtonLink href={l('/book')} size="lg">
                  {t.common.bookAClean}
                </ButtonLink>
                <ButtonLink
                  href={l('/hostel/book')}
                  size="lg"
                  variant="secondary"
                  className="!text-brand-strong border-brand/30"
                >
                  <Bed className="size-5" aria-hidden /> {t.common.bookABunk}
                </ButtonLink>
                <ButtonLink href={accountHref} size="lg" variant="secondary">
                  <User className="size-5" aria-hidden /> {accountLabel}
                </ButtonLink>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted mb-2">
                  {t.common.services}
                </p>
                <ul className="divide-y divide-line">
                  {localizedServices.map((s) => (
                    <li key={s.id}>
                      <Link href={l(`/book?service=${s.id}`)} className="block py-3.5 text-base font-medium">
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="divide-y divide-line border-t border-line">
                <li>
                  <Link
                    href={l('/hostel')}
                    className="flex items-center justify-between py-3.5 text-base font-semibold text-brand-strong"
                  >
                    <span className="flex items-center gap-2">
                      <Bed className="size-5" /> {t.common.hostelAndBunks}
                    </span>
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-strong">
                      {t.common.newBadge}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href={l('/#how-it-works')} className="block py-3.5 text-base font-medium">
                    {t.common.howItWorks}
                  </Link>
                </li>
                <li>
                  <Link href={l('/#prices')} className="block py-3.5 text-base font-medium">
                    {t.common.prices}
                  </Link>
                </li>
                <li>
                  <Link href={l('/#faq')} className="block py-3.5 text-base font-medium">
                    {t.common.help}
                  </Link>
                </li>
                <li>
                  <Link href={l('/#business')} className="block py-3.5 text-base font-medium">
                    {t.common.forBusinesses}
                  </Link>
                </li>
              </ul>

              <a href={BRAND.phoneHref} className="flex items-center gap-3 rounded-card bg-soft p-4">
                <Phone className="size-6 text-brand-strong" aria-hidden />
                <span>
                  <span className="block text-muted text-sm">{t.common.preferToTalk}</span>
                  <span className="block text-lg font-semibold">{BRAND.phone}</span>
                </span>
              </a>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
