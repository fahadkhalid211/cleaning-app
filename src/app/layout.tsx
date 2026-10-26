import type { Metadata, Viewport } from 'next';
import { Work_Sans } from 'next/font/google';
import { BRAND } from '@/lib/config';
import './globals.css';

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hoodie.services'),
  title: { default: `${BRAND.name} | Trusted home cleaning`, template: `%s | ${BRAND.name}` },
  description: 'Book a vetted, insured home cleaner online in two minutes. Fixed prices, transparent quotes, free re-clean guarantee.',
};

export const viewport: Viewport = {
  themeColor: '#ea663f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${workSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
