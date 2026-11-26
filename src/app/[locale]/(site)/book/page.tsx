import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { Spinner } from '@/components/ui';
import { getDictionary, type Locale } from '@/lib/i18n';
import { BRAND } from '@/lib/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.booking.metaTitle,
    description: dict.booking.metaDesc,
    alternates: {
      canonical: `${BRAND.url}/${locale}/book`,
      languages: {
        en: `${BRAND.url}/en/book`,
        zh: `${BRAND.url}/cn/book`,
        'zh-CN': `${BRAND.url}/cn/book`,
      },
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = locale === 'cn' ? 'cn' : 'en';
  const dict = getDictionary(validLocale);

  return (
    <div className="bg-soft/60 min-h-full">
      <Suspense fallback={<Spinner label={dict.common.bookAClean + '...'} />}>
        <BookingWizard />
      </Suspense>
    </div>
  );
}
