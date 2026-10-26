// Shapes the API returns to the browser.

import type { Frequency, Rooms } from './pricing';

export type BookingStatus = 'confirmed' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
export type AccessMethod = 'home' | 'key_safe' | 'concierge' | 'other';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid';

export const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  on_the_way: 'Cleaner on the way',
  in_progress: 'Cleaning in progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: 'Payment Pending',
  deposit_paid: 'Deposit Paid',
  paid: 'Fully Paid',
};

export const ACCESS_LABEL: Record<AccessMethod, string> = {
  home: "I'll be at home",
  key_safe: 'Key safe / lockbox',
  concierge: 'Concierge or neighbour',
  other: 'Other (explain below)',
};

export interface Service {
  id: string;
  title: string;
  short: string;
  description: string;
  hourlyRate: number;
  minHours: number;
  timeMultiplier: number;
  icon: string;
  includes: string[];
  active: boolean;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  active: boolean;
}

export interface Catalog {
  services: Service[];
  addons: Addon[];
  depositPercent?: number;
  stripeEnabled?: boolean;
}

export interface Slot {
  startMin: number;
  available: boolean;
}

export interface BookingView {
  ref: string;
  status: BookingStatus;
  serviceId: string;
  serviceTitle: string;
  frequency: Frequency;
  rooms: Rooms;
  addons: { id: string; name: string; price: number }[];
  date: string;
  startMin: number;
  durationMin: number;
  street: string;
  city: string;
  postcode: string;
  accessMethod: AccessMethod;
  accessNotes: string;
  hasPets: boolean;
  notes: string;
  subtotal: number;
  discount: number;
  total: number;
  depositAmount?: number;
  paymentStatus?: PaymentStatus;
  stripeSessionId?: string | null;
  createdAt: string;
  canChange: boolean;
  cleaner: { id: number; name: string; phone?: string } | null;
  customer?: { id: number; name: string; phone: string; email?: string };
}

export interface MeResponse {
  user: { id: number; role: 'customer' | 'cleaner' | 'admin'; name: string; email: string; phone: string } | null;
}
