import 'server-only';
import { BRAND } from '@/lib/config';
import { audit, getDb } from '@/lib/server/db';

// PayPal Orders v2 over plain fetch (no SDK). Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET,
// PAYPAL_ENV ("live" | "sandbox", default sandbox), PAYPAL_WEBHOOK_ID.

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function baseUrl(): string {
  return (process.env.PAYPAL_ENV || '').toLowerCase() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;
  const basic = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function paypalFetch(path: string, init: RequestInit & { requestId?: string } = {}): Promise<Response> {
  const token = await accessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (init.requestId) headers['PayPal-Request-Id'] = init.requestId;
  return fetch(`${baseUrl()}${path}`, { ...init, headers, cache: 'no-store' });
}

export function getDepositPercentage(): number {
  const raw = Number(process.env.DEPOSIT_PERCENT);
  if (!Number.isFinite(raw) || raw <= 0 || raw > 100) return 20;
  return Math.round(raw);
}

export function calculateDeposit(total: number): {
  depositAmount: number;
  balanceAmount: number;
  depositPercentage: number;
  isFullPayment: boolean;
} {
  const percent = getDepositPercentage();
  if (percent >= 100) {
    return { depositAmount: total, balanceAmount: 0, depositPercentage: 100, isFullPayment: true };
  }
  const deposit = Math.round(total * (percent / 100) * 100) / 100;
  const balance = Math.round((total - deposit) * 100) / 100;
  return { depositAmount: deposit, balanceAmount: balance, depositPercentage: percent, isFullPayment: false };
}

export interface CreateCheckoutParams {
  bookingRef: string;
  serviceTitle: string;
  totalAmount: number;
  depositAmount: number;
  date: string;
  origin: string;
}

/** Creates a PayPal order and returns the URL the customer must approve it at. */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string | null> {
  if (!isPayPalConfigured()) return null;
  const { bookingRef, serviceTitle, totalAmount, depositAmount, date, origin } = params;

  const isFull = depositAmount >= totalAmount;
  const description = (isFull
    ? `${BRAND.name} - ${serviceTitle} Cleaning (${date}) ref ${bookingRef}`
    : `${BRAND.name} - Deposit for ${serviceTitle} Cleaning (${date}) ref ${bookingRef}`
  ).slice(0, 127);

  const res = await paypalFetch('/v2/checkout/orders', {
    method: 'POST',
    // Same booking + same amount => PayPal returns the same order instead of duplicating it.
    requestId: `${bookingRef}-${depositAmount.toFixed(2)}`,
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: bookingRef,
          custom_id: bookingRef,
          invoice_id: `${bookingRef}-DEP`,
          description,
          amount: { currency_code: 'GBP', value: depositAmount.toFixed(2) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: BRAND.name,
            locale: 'en-GB',
            landing_page: 'LOGIN',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: `${origin}/api/paypal/return?ref=${encodeURIComponent(bookingRef)}`,
            cancel_url: `${origin}/api/paypal/return?ref=${encodeURIComponent(bookingRef)}&cancelled=1`,
          },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`PayPal create order failed (${res.status}): ${await res.text()}`);

  const order = (await res.json()) as { id: string; links?: { rel: string; href: string }[] };
  const approve = order.links?.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href ?? null;
  if (!approve) throw new Error('PayPal order has no approval link.');

  getDb()
    .prepare("UPDATE bookings SET paypal_order_id = ?, updated_at = datetime('now') WHERE ref = ?")
    .run(order.id, bookingRef);
  return approve;
}

/** Marks a booking paid. Idempotent: only moves unpaid bookings forward. */
export function recordPayment(ref: string, amount: number, orderId: string | null, captureId: string | null, via: string): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT total, payment_status FROM bookings WHERE ref = ?')
    .get(ref) as { total: number; payment_status: string } | undefined;
  if (!row) return false;
  if (row.payment_status === 'paid' || row.payment_status === 'deposit_paid') return true;

  const status = amount + 0.005 >= row.total ? 'paid' : 'deposit_paid';
  db.prepare(
    `UPDATE bookings
     SET payment_status = ?, deposit_amount = ?, paypal_order_id = COALESCE(?, paypal_order_id),
         paypal_capture_id = ?, updated_at = datetime('now')
     WHERE ref = ?`,
  ).run(status, amount, orderId, captureId, ref);
  audit(0, 'payment.deposit_received', `Booking ${ref} received £${amount.toFixed(2)} via PayPal (${via}, capture ${captureId})`);
  return true;
}

/** Captures an approved order and records the payment. Returns true if the booking is now paid. */
export async function captureOrder(orderId: string, ref: string): Promise<boolean> {
  const db = getDb();
  const row = db
    .prepare('SELECT total, deposit_amount, paypal_order_id FROM bookings WHERE ref = ?')
    .get(ref) as { total: number; deposit_amount: number; paypal_order_id: string | null } | undefined;
  // The order must be the one we created for this exact booking.
  if (!row || row.paypal_order_id !== orderId) return false;

  const res = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    requestId: `capture-${orderId}`,
    body: '{}',
  });
  const body = (await res.json().catch(() => ({}))) as {
    status?: string;
    details?: { issue?: string }[];
    purchase_units?: { payments?: { captures?: { id: string; status: string; amount: { value: string; currency_code: string } }[] } }[];
  };

  const alreadyCaptured = !res.ok && body.details?.some((d) => d.issue === 'ORDER_ALREADY_CAPTURED');
  if (alreadyCaptured) {
    const get = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
    if (get.ok) return applyCaptured(await get.json(), orderId, ref, row.deposit_amount);
    return false;
  }
  if (!res.ok) {
    console.error('[paypal] capture failed', res.status, JSON.stringify(body));
    return false;
  }
  return applyCaptured(body, orderId, ref, row.deposit_amount);
}

function applyCaptured(
  body: { purchase_units?: { payments?: { captures?: { id: string; status: string; amount: { value: string; currency_code: string } }[] } }[] },
  orderId: string,
  ref: string,
  expectedDeposit: number,
): boolean {
  const capture = body.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture || capture.status !== 'COMPLETED' || capture.amount.currency_code !== 'GBP') return false;
  const amount = Number(capture.amount.value);
  if (!Number.isFinite(amount) || Math.abs(amount - expectedDeposit) > 0.009) {
    console.error(`[paypal] amount mismatch for ${ref}: captured ${amount}, expected ${expectedDeposit}`);
    audit(0, 'payment.amount_mismatch', `Booking ${ref}: captured £${amount}, expected £${expectedDeposit} (order ${orderId})`);
    return false;
  }
  return recordPayment(ref, amount, orderId, capture.id, 'return');
}

/** Verifies a webhook call came from PayPal using PAYPAL_WEBHOOK_ID. */
export async function verifyWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const res = await paypalFetch('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status?: string };
  return data.verification_status === 'SUCCESS';
}
