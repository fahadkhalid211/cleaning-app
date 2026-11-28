import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import { Spinner } from '@/components/ui';

// Staff accommodation: only for registered cleaners (admins can look too).
// Keep it out of search engines; it is not offered to the public.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function HostelStaffLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<Spinner />}>
      <StaffOnly params={params}>{children}</StaffOnly>
    </Suspense>
  );
}

async function StaffOnly({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await connection();
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user || (user.role !== 'cleaner' && user.role !== 'admin')) {
    const validLocale = locale === 'cn' ? 'cn' : 'en';
    redirect(`/cleaner/login?next=${encodeURIComponent(`/${validLocale}/hostel/book`)}`);
  }
  return children;
}
