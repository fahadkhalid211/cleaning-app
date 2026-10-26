import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { getForCustomer } from '@/lib/server/bookings';
import { getDb } from '@/lib/server/db';
import { HttpError, route } from '@/lib/server/http';
import { calculateDeposit, createCheckoutSession, isStripeConfigured } from '@/lib/server/stripe';

type Ctx = { params: Promise<{ ref: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  if (!isStripeConfigured()) {
    throw new HttpError(503, 'Payment processor is not configured.');
  }

  const user = await requireUser('customer');
  const { ref } = await params;
  const db = getDb();
  const booking = getForCustomer(db, user.id, ref);

  if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'deposit_paid') {
    throw new HttpError(400, 'Deposit for this booking has already been paid.');
  }

  const { depositAmount } = calculateDeposit(booking.total);
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://powderblue-louse-144712.hostingersite.com';

  const checkoutUrl = await createCheckoutSession({
    bookingRef: ref,
    serviceTitle: booking.serviceTitle,
    totalAmount: booking.total,
    depositAmount,
    customerEmail: user.email,
    customerName: user.name,
    date: booking.date,
    origin,
  });

  return NextResponse.json({ checkoutUrl });
});
