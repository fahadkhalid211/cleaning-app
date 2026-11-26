import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui';
import { CustomerAccount } from './CustomerAccount';
import { getDictionary } from '@/lib/i18n';
import { BRAND } from '@/lib/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.account.title,
    robots: { index: false },
    alternates: {
      canonical: `${BRAND.url}/${locale}/account`,
    },
  };
}

export default function AccountPage() {
  return (
    <div className="bg-soft/60 min-h-full">
      <Suspense fallback={<Spinner />}>
        <CustomerAccount />
      </Suspense>
    </div>
  );
}
