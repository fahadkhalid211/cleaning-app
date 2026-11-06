import { NextResponse } from 'next/server';
import { recordPayment, verifyWebhook } from '@/lib/server/paypal';
import { getDb } from '@/lib/server/db';

export async function POST(req: Request) {
  const rawBody = await req.text();
  let event: {
    event_type?: string;
    resource?: { id?: string; custom_id?: string; amount?: { value: string; currency_code: string }; supplementary_data?: { related_ids?: { order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse('Bad request', { status: 400 });
  }

  if (!(await verifyWebhook(req.headers, event))) {
    console.error('[paypal-webhook] signature verification failed');
    return new NextResponse('Invalid signature', { status: 400 });
  }

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' && event.resource) {
    const ref = event.resource.custom_id;
    const amount = Number(event.resource.amount?.value);
    if (ref && Number.isFinite(amount) && event.resource.amount?.currency_code === 'GBP') {
      const row = getDb().prepare('SELECT deposit_amount FROM bookings WHERE ref = ?').get(ref) as { deposit_amount: number } | undefined;
      if (row && Math.abs(row.deposit_amount - amount) <= 0.009) {
        recordPayment(ref, amount, event.resource.supplementary_data?.related_ids?.order_id ?? null, event.resource.id ?? null, 'webhook');
      } else {
        console.error(`[paypal-webhook] amount/booking mismatch for ${ref}`);
      }
    }
  }
  return NextResponse.json({ received: true });
}
