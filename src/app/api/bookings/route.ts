import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/server/accounts';
import { getSessionUser, requireUser } from '@/lib/server/auth';
import { createBooking, listForCustomer, parseDraft } from '@/lib/server/bookings';
import { getCatalog } from '@/lib/server/catalog';
import { getDb } from '@/lib/server/db';
import { clientIp, HttpError, rateLimit, readJson, route } from '@/lib/server/http';
import { calculateDeposit, createCheckoutSession, isStripeConfigured } from '@/lib/server/stripe';

export const GET = route(async () => {
  const user = await requireUser('customer');
  return NextResponse.json({ bookings: listForCustomer(getDb(), user.id) });
});

export const POST = route(async (req) => {
  rateLimit(`book:${clientIp(req)}`, 20, 60 * 60 * 1000);
  const body = await readJson(req);
  const draft = parseDraft(body, getCatalog());

  const key = typeof body.requestKey === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(body.requestKey) ? body.requestKey : null;

  const user = await getSessionUser();
  if (user && user.role !== 'customer') {
    throw new HttpError(403, 'Staff accounts cannot make bookings. Please log out first.');
  }
  let customerId = user?.id;
  if (!customerId) {
    if (!body.account || typeof body.account !== 'object') throw new HttpError(401, 'Please create an account or log in to book.');
    customerId = await registerCustomer(body.account as Record<string, unknown>);
  }

  const { depositAmount, balanceAmount, depositPercentage, isFullPayment } = calculateDeposit(draft.total);
  const ref = createBooking(customerId, draft, key, depositAmount);

  let checkoutUrl: string | null = null;
  if (isStripeConfigured()) {
    const customer = getDb().prepare('SELECT name, email FROM users WHERE id = ?').get(customerId) as { name: string; email: string };
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://powderblue-louse-144712.hostingersite.com';
    checkoutUrl = await createCheckoutSession({
      bookingRef: ref,
      serviceTitle: draft.serviceTitle,
      totalAmount: draft.total,
      depositAmount,
      customerEmail: customer.email,
      customerName: customer.name,
      date: draft.date,
      origin,
    });
  }

  return NextResponse.json({
    ref,
    checkoutUrl,
    depositAmount,
    balanceAmount,
    depositPercentage,
    isFullPayment,
    stripeEnabled: Boolean(checkoutUrl),
  }, { status: 201 });
});
