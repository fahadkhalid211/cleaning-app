import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/server/paypal';

// PayPal sends the customer back here after they approve (or cancel) the payment.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get('ref') ?? '';
  const token = url.searchParams.get('token'); // PayPal order id
  const base = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const to = (query: string) => NextResponse.redirect(`${base}/account?${query}`, 303);

  if (!/^[A-Za-z0-9-]{3,40}$/.test(ref)) return to('payment=failed');
  if (url.searchParams.get('cancelled') || !token) return to(`booked=${encodeURIComponent(ref)}&payment=cancelled`);

  try {
    const ok = await captureOrder(token, ref);
    return to(ok ? `booked=${encodeURIComponent(ref)}&paid=1` : `booked=${encodeURIComponent(ref)}&payment=failed`);
  } catch (err) {
    console.error('[paypal-return]', err);
    return to(`booked=${encodeURIComponent(ref)}&payment=failed`);
  }
}
