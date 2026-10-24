import type { Metadata } from 'next';
import { StaffLogin } from '@/components/auth/StaffLogin';

export const metadata: Metadata = { title: 'Cleaner log in', robots: { index: false } };

export default function CleanerLoginPage() {
  return <StaffLogin portal="cleaner" title="Cleaner log in" sub="See your jobs for today and the days ahead." />;
}
