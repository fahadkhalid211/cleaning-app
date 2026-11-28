'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { SERVICE_SEED } from '@/lib/catalog-seed';
import { Logo } from './Logo';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function SiteFooter() {
  const { t, l } = useI18n();

  const localizedServices = SERVICE_SEED.map((s) => {
    const title = t.servicesCatalog?.[s.id]?.title || s.title;
    return { ...s, title };
  });

  return (
    <footer className="bg-ink text-white/80 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          <Logo href={l('/')} tone="light" />
          <p className="max-w-sm text-sm sm:text-base leading-relaxed text-white/70">
            {t.common.footerDesc}
          </p>
          <div className="space-y-2">
            <a href={BRAND.phoneHref} className="flex items-center gap-2 font-semibold text-white hover:underline">
              <Phone className="size-4" aria-hidden /> {BRAND.phone}
            </a>
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 text-sm hover:text-white">
              <Mail className="size-4" aria-hidden /> {BRAND.email}
            </a>
          </div>
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </div>

        <FooterCol title={t.common.services}>
          {localizedServices.map((s) => (
            <FooterLink key={s.id} href={l(`/book?service=${s.id}`)}>
              {s.title}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title={t.common.help}>
          <FooterLink href={l('/#how-it-works')}>{t.common.howItWorks}</FooterLink>
          <FooterLink href={l('/#prices')}>{t.common.prices}</FooterLink>
          <FooterLink href={l('/#faq')}>{t.common.questions}</FooterLink>
          <FooterLink href={l('/login')}>{t.common.customerLogIn}</FooterLink>
        </FooterCol>

        <FooterCol title={t.common.ourTeam}>
          <FooterLink href="/cleaner/login">{t.common.cleanerLogin}</FooterLink>
          <FooterLink href="/admin/login">{t.common.staffAdmin}</FooterLink>
          <FooterLink href={l('/#business')}>{t.common.forBusinesses}</FooterLink>
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-[0.85rem] text-white/60 flex flex-col sm:flex-row gap-2 justify-between">
          <p>© {BRAND.name}. {t.common.copyright}</p>
          <p>{t.common.vatNotice}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h2>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-white hover:underline underline-offset-4 transition">
        {children}
      </Link>
    </li>
  );
}
