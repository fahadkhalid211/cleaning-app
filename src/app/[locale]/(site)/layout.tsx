import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { LanguageProvider, type Locale } from '@/lib/i18n';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'cn' }];
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = locale === 'cn' ? 'cn' : 'en';

  return (
    <LanguageProvider initialLocale={validLocale}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </LanguageProvider>
  );
}
