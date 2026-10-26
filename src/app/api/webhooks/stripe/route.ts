import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getDb, audit } from '@/lib/server/db';
import { getStripe } from '@/lib/server/stripe';

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return new NextResponse('Stripe not configured', { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get('stripe-signature');

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe-webhook] Signature verification failed:', message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const ref = session.metadata?.bookingRef;
    const depositAmount = Number(session.metadata?.depositAmount || '0');
    const totalAmount = Number(session.metadata?.totalAmount || '0');
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

    if (ref) {
      const db = getDb();
      const newStatus = depositAmount >= totalAmount ? 'paid' : 'deposit_paid';
      db.prepare(
        `UPDATE bookings
         SET payment_status = ?,
             deposit_amount = ?,
             stripe_session_id = ?,
             stripe_payment_intent_id = ?,
             updated_at = datetime('now')
         WHERE ref = ?`,
      ).run(newStatus, depositAmount, session.id, paymentIntentId, ref);

      audit(0, 'payment.deposit_received', `Booking ${ref} received deposit of £${depositAmount} via Stripe (${session.id})`);
      console.log(`[stripe-webhook] Marked booking ${ref} as ${newStatus}`);
    }
  }

  return NextResponse.json({ received: true });
}
