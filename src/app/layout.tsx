import type { Metadata, Viewport } from 'next';
import { Work_Sans } from 'next/font/google';
import { BRAND } from '@/lib/config';
import { JsonLd } from '@/components/seo/JsonLd';
import './globals.css';

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: `${BRAND.name} | Trusted Home & Commercial Cleaning in London`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    'Book vetted, fully insured home and apartment cleaners online in 2 minutes. Transparent fixed pricing from £24/hr, pay after the clean, and 72-hour free re-clean guarantee across London and UK.',
  keywords: [
    'home cleaning London',
    'cleaners near me London',
    'domestic cleaning service',
    'deep cleaning service London',
    'end of tenancy cleaning guarantee',
    'Airbnb cleaning service',
    'insured cleaners London',
    'Hoodie cleaning services',
  ],
  authors: [{ name: BRAND.name, url: BRAND.url }],
  creator: BRAND.name,
  publisher: BRAND.name,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: BRAND.url,
    siteName: BRAND.name,
    title: `${BRAND.name} | Trusted Home & Commercial Cleaning in London`,
    description:
      'Book vetted, fully insured home cleaners in 2 minutes. Fixed pricing from £24/hr, pay after the clean, and 72-hour re-clean guarantee.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} | Trusted Home & Commercial Cleaning`,
    description:
      'Book vetted, fully insured home cleaners in 2 minutes. Fixed pricing from £24/hr, pay after the clean, and 72-hour re-clean guarantee.',
  },
};

export const viewport: Viewport = {
  themeColor: '#ea663f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${workSans.variable} h-full`}>
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

