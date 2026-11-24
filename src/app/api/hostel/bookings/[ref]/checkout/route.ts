import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { HttpError, route } from '@/lib/server/http';
import { getHostelBookingForCustomer } from '@/lib/server/hostel';
import { createCheckoutSession, isPayPalConfigured } from '@/lib/server/paypal';

type Ctx = { params: Promise<{ ref: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser('customer');
  const { ref } = await params;

  const booking = getHostelBookingForCustomer(user.id, ref);

  if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'deposit_paid') {
    throw new HttpError(400, 'This booking has already been paid.');
  }

  if (!isPayPalConfigured()) {
    throw new HttpError(503, 'Online payment is not available at this time.');
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://hoodie.services';
  const checkoutUrl = await createCheckoutSession({
    bookingRef: booking.ref,
    serviceTitle: `Hostel Bed ${booking.bedLabel} (${booking.roomName})`,
    totalAmount: booking.total,
    depositAmount: booking.depositAmount,
    date: `${booking.checkIn} to ${booking.checkOut}`,
    origin,
  });

  return NextResponse.json({ checkoutUrl });
});
