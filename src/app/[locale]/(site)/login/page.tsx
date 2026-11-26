import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CustomerAuth } from './CustomerAuth';
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
    title: dict.auth.loginTitle,
    alternates: {
      canonical: `${BRAND.url}/${locale}/login`,
      languages: {
        en: `${BRAND.url}/en/login`,
        zh: `${BRAND.url}/cn/login`,
        'zh-CN': `${BRAND.url}/cn/login`,
      },
    },
  };
}

export default function LoginPage() {
  return (
    <div className="bg-cream/50 py-12 sm:py-20 px-4">
      <Suspense>
        <CustomerAuth />
      </Suspense>
    </div>
  );
}
