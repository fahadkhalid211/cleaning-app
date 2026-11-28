import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { HttpError, readJson, route } from '@/lib/server/http';
import { cancelHostelBooking, getHostelBookingForCustomer } from '@/lib/server/hostel';

type Ctx = { params: Promise<{ ref: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser('cleaner');
  const { ref } = await params;
  const booking = getHostelBookingForCustomer(user.id, ref);
  return NextResponse.json({ booking });
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser('cleaner');
  const { ref } = await params;
  const body = (await readJson(req)) as { action?: string };

  if (body.action === 'cancel') {
    cancelHostelBooking(user.id, ref);
    const updated = getHostelBookingForCustomer(user.id, ref);
    return NextResponse.json({ booking: updated });
  }

  throw new HttpError(400, 'Unknown action.');
});
