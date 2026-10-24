import type { Metadata } from 'next';
import { StaffLogin } from '@/components/auth/StaffLogin';

export const metadata: Metadata = { title: 'Admin log in', robots: { index: false } };

export default function AdminLoginPage() {
  return <StaffLogin portal="admin" title="Admin log in" sub="Manage bookings, cleaners and prices." />;
}
