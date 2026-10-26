import 'server-only';
import Stripe from 'stripe';
import { BRAND } from '@/lib/config';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getDepositPercentage(): number {
  const raw = Number(process.env.DEPOSIT_PERCENT);
  if (!Number.isFinite(raw) || raw <= 0 || raw > 100) {
    return 20; // Default to 20% deposit if not specified
  }
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
    return {
      depositAmount: total,
      balanceAmount: 0,
      depositPercentage: 100,
      isFullPayment: true,
    };
  }
  const deposit = Math.round(total * (percent / 100) * 100) / 100;
  const balance = Math.round((total - deposit) * 100) / 100;
  return {
    depositAmount: deposit,
    balanceAmount: balance,
    depositPercentage: percent,
    isFullPayment: false,
  };
}

export interface CreateCheckoutParams {
  bookingRef: string;
  serviceTitle: string;
  totalAmount: number;
  depositAmount: number;
  customerEmail: string;
  customerName: string;
  date: string;
  origin: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const {
    bookingRef,
    serviceTitle,
    totalAmount,
    depositAmount,
    customerEmail,
    customerName,
    date,
    origin,
  } = params;

  const isFull = depositAmount >= totalAmount;
  const lineItemTitle = isFull
    ? `${BRAND.name} - ${serviceTitle} Cleaning (${date})`
    : `${BRAND.name} - Deposit for ${serviceTitle} Cleaning (${date})`;

  const description = isFull
    ? `Full payment for booking ref: ${bookingRef}`
    : `Deposit for booking ref ${bookingRef}. Remaining balance of £${(totalAmount - depositAmount).toFixed(2)} due after service.`;

  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: lineItemTitle,
            description,
          },
          unit_amount: Math.round(depositAmount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/account?booked=${bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book?cancelled=true&ref=${bookingRef}`,
    metadata: {
      bookingRef,
      customerEmail,
      customerName,
      totalAmount: totalAmount.toString(),
      depositAmount: depositAmount.toString(),
    },
  });

  return session.url;
}
