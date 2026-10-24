import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { SERVICE_SEED } from '@/lib/catalog-seed';
import { Logo } from './Logo';

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white/80 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          <Logo tone="light" />
          <p className="max-w-sm">Friendly, vetted and insured cleaners for your home. Book online in two minutes and pay after the clean.</p>
          <div className="space-y-2">
            <a href={BRAND.phoneHref} className="flex items-center gap-2 font-semibold text-white hover:underline">
              <Phone className="size-5" aria-hidden /> {BRAND.phone}
            </a>
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-white">
              <Mail className="size-5" aria-hidden /> {BRAND.email}
            </a>
          </div>
        </div>

        <FooterCol title="Services">
          {SERVICE_SEED.map((s) => (
            <FooterLink key={s.id} href={`/book?service=${s.id}`}>
              {s.title}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Help">
          <FooterLink href="/#how-it-works">How it works</FooterLink>
          <FooterLink href="/#prices">Prices</FooterLink>
          <FooterLink href="/#faq">Questions</FooterLink>
          <FooterLink href="/login">Customer log in</FooterLink>
        </FooterCol>

        <FooterCol title="Our team">
          <FooterLink href="/cleaner/login">Cleaner log in</FooterLink>
          <FooterLink href="/admin/login">Staff admin</FooterLink>
          <FooterLink href="/#contact">Work with us</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-[0.9rem] text-white/60 flex flex-col sm:flex-row gap-2 justify-between">
          <p>© {BRAND.name}. All rights reserved.</p>
          <p>Prices include VAT where applicable.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white font-semibold mb-4">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-white hover:underline underline-offset-4">
        {children}
      </Link>
    </li>
  );
}
