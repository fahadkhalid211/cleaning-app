import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { clientIp, HttpError, rateLimit, readJson, route } from '@/lib/server/http';
import { createHostelBooking, getHostelRoom, getHostelBeds, listHostelBookingsForCustomer } from '@/lib/server/hostel';
import { calculateDeposit, createCheckoutSession, isPayPalConfigured } from '@/lib/server/paypal';
import { HOSTEL_ADDONS_SEED } from '@/lib/hostel-seed';

interface HostelBookingRequestBody {
  roomId?: string;
  bedId?: string;
  checkIn?: string;
  checkOut?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestGender?: string;
  eta?: string;
  specialRequests?: string;
  addons?: unknown[];
}

// Staff accommodation: only logged-in cleaners can view or make hostel bookings.
export const GET = route(async () => {
  const user = await requireUser('cleaner');
  return NextResponse.json({ bookings: listHostelBookingsForCustomer(user.id) });
});

export const POST = route(async (req) => {
  rateLimit(`hostel_book:${clientIp(req)}`, 20, 60 * 60 * 1000);
  const body = (await readJson(req)) as HostelBookingRequestBody;

  const user = await requireUser('cleaner');
  const customerId = user.id;

  // Basic validation of body
  const roomId = String(body.roomId || '');
  const bedId = String(body.bedId || '');
  const checkIn = String(body.checkIn || '');
  const checkOut = String(body.checkOut || '');
  const guestName = String(body.guestName || user.name || '');
  const guestEmail = String(body.guestEmail || user.email || '');
  const guestPhone = String(body.guestPhone || user.phone || '');

  if (!roomId || !bedId || !checkIn || !checkOut || !guestName || !guestEmail) {
    throw new HttpError(400, 'Missing required booking details.');
  }

  // Strict YYYY-MM-DD date validation
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_REGEX.test(checkIn) || !DATE_REGEX.test(checkOut)) {
    throw new HttpError(400, 'Dates must be in YYYY-MM-DD format.');
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (checkIn < todayStr) {
    throw new HttpError(400, 'Check-in date cannot be in the past.');
  }

  if (checkIn >= checkOut) {
    throw new HttpError(400, 'Check-out date must be after check-in date.');
  }

  const room = getHostelRoom(roomId);
  if (!room) throw new HttpError(404, 'Room not found.');

  const beds = getHostelBeds(roomId);
  const bed = beds.find((b) => b.id === bedId);
  if (!bed) throw new HttpError(404, 'Bed not found.');

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  const subtotal = Math.round(bed.pricePerNight * nights * 100) / 100;

  // Verify and calculate add-on prices strictly from server seed catalog
  const rawAddons = Array.isArray(body.addons) ? body.addons : [];
  const requestedAddonIds = rawAddons.map((a) =>
    typeof a === 'string' ? a : ((a as { id?: string }).id || ''),
  );
  const validAddons = HOSTEL_ADDONS_SEED.filter((a) => requestedAddonIds.includes(a.id));
  const verifiedAddons = validAddons.map((a) => ({
    id: a.id,
    name: a.name,
    price: a.perNight ? Math.round(a.price * nights * 100) / 100 : a.price,
  }));
  const addonsTotal = verifiedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = Math.round((subtotal + addonsTotal) * 100) / 100;

  const { depositAmount, balanceAmount, depositPercentage, isFullPayment } = calculateDeposit(total);

  const ref = createHostelBooking(
    customerId,
    {
      roomId,
      bedId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      guestGender: body.guestGender,
      eta: body.eta,
      specialRequests: body.specialRequests,
      addons: verifiedAddons,
    },
    depositAmount,
  );

  let checkoutUrl: string | null = null;
  if (isPayPalConfigured()) {
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://hoodie.services';
    const referer = req.headers.get('referer') || '';
    const locale = referer.includes('/cn') ? 'cn' : 'en';
    checkoutUrl = await createCheckoutSession({
      bookingRef: ref,
      serviceTitle: `Hostel Bed ${bed.bedNumber} (${room.name})`,
      totalAmount: total,
      depositAmount,
      date: `${checkIn} to ${checkOut}`,
      origin,
      locale,
    });
  }

  return NextResponse.json(
    {
      ref,
      checkoutUrl,
      depositAmount,
      balanceAmount,
      depositPercentage,
      isFullPayment,
      paymentsEnabled: Boolean(checkoutUrl),
    },
    { status: 201 },
  );
});
