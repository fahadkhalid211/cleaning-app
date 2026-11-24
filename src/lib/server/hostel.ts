import 'server-only';
import { getDb, transaction, audit } from './db';
import { HttpError } from './http';
import { HOSTEL_ADDONS_SEED } from '@/lib/hostel-seed';
import type { HostelAddon, HostelBed, HostelBookingView, HostelRoom, HostelRoomType } from '@/lib/types';

export function listHostelRooms(): HostelRoom[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM hostel_rooms WHERE active = 1 ORDER BY floor ASC, id ASC').all() as {
    id: string;
    name: string;
    slug: string;
    type: HostelRoomType;
    floor: number;
    capacity: number;
    base_price_night: number;
    description: string;
    features_json: string;
  }[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    type: r.type,
    floor: r.floor,
    capacity: r.capacity,
    basePriceNight: r.base_price_night,
    description: r.description,
    features: JSON.parse(r.features_json || '[]'),
  }));
}

export function getHostelRoom(roomId: string): HostelRoom | null {
  const db = getDb();
  const r = db.prepare('SELECT * FROM hostel_rooms WHERE id = ? AND active = 1').get(roomId) as
    | {
        id: string;
        name: string;
        slug: string;
        type: HostelRoomType;
        floor: number;
        capacity: number;
        base_price_night: number;
        description: string;
        features_json: string;
      }
    | undefined;

  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    type: r.type,
    floor: r.floor,
    capacity: r.capacity,
    basePriceNight: r.base_price_night,
    description: r.description,
    features: JSON.parse(r.features_json || '[]'),
  };
}

export function getHostelBeds(roomId: string, checkIn?: string, checkOut?: string): HostelBed[] {
  const db = getDb();
  const beds = db
    .prepare('SELECT * FROM hostel_beds WHERE room_id = ? AND active = 1 ORDER BY position_row ASC, position_col ASC, tier ASC')
    .all(roomId) as {
    id: string;
    room_id: string;
    bed_number: string;
    tier: 'top' | 'bottom';
    bunk_group: string;
    position_col: number;
    position_row: number;
    has_window_view: number;
    has_extra_storage: number;
    price_per_night: number;
    features_json: string;
  }[];

  // If checkIn and checkOut provided, find which beds are already booked during this period.
  const occupiedBedIds = new Set<string>();
  if (checkIn && checkOut) {
    const overlapping = db
      .prepare(
        `SELECT bed_id FROM hostel_bookings
         WHERE room_id = ?
           AND status <> 'cancelled'
           AND check_in < ?
           AND check_out > ?`,
      )
      .all(roomId, checkOut, checkIn) as { bed_id: string }[];

    overlapping.forEach((o) => occupiedBedIds.add(o.bed_id));
  }

  return beds.map((b) => ({
    id: b.id,
    roomId: b.room_id,
    bedNumber: b.bed_number,
    tier: b.tier,
    bunkGroup: b.bunk_group,
    positionCol: b.position_col,
    positionRow: b.position_row,
    hasWindowView: Boolean(b.has_window_view),
    hasExtraStorage: Boolean(b.has_extra_storage),
    pricePerNight: b.price_per_night,
    features: JSON.parse(b.features_json || '[]'),
    isAvailable: !occupiedBedIds.has(b.id),
  }));
}

export function getHostelAddons(): HostelAddon[] {
  return HOSTEL_ADDONS_SEED;
}

export interface HostelDraftInput {
  roomId: string;
  bedId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestGender?: string;
  eta?: string;
  specialRequests?: string;
  addons?: { id: string; name: string; price: number }[];
}

export function createHostelBooking(
  customerId: number,
  draft: HostelDraftInput,
  depositAmount: number,
): string {
  // Validate date format strictly YYYY-MM-DD
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_REGEX.test(draft.checkIn) || !DATE_REGEX.test(draft.checkOut)) {
    throw new HttpError(400, 'Dates must be in YYYY-MM-DD format.');
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (draft.checkIn < todayStr) {
    throw new HttpError(400, 'Check-in date cannot be in the past.');
  }
  if (draft.checkIn >= draft.checkOut) {
    throw new HttpError(400, 'Check-out date must be after check-in date.');
  }

  const checkInDate = new Date(draft.checkIn);
  const checkOutDate = new Date(draft.checkOut);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new HttpError(400, 'Invalid check-in or check-out date.');
  }

  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    throw new HttpError(400, 'Check-out date must be at least 1 night after check-in.');
  }
  if (nights > 30) {
    throw new HttpError(400, 'Maximum stay per single booking is 30 nights.');
  }

  return transaction((db) => {
    // 1. Fetch room & bed
    const room = db.prepare('SELECT * FROM hostel_rooms WHERE id = ? AND active = 1').get(draft.roomId) as
      | { name: string; type: string }
      | undefined;
    if (!room) throw new HttpError(404, 'Selected hostel room was not found.');

    const bed = db.prepare('SELECT * FROM hostel_beds WHERE id = ? AND room_id = ? AND active = 1').get(draft.bedId, draft.roomId) as
      | { bed_number: string; tier: string; price_per_night: number }
      | undefined;
    if (!bed) throw new HttpError(404, 'Selected bed was not found in this room.');

    // 2. Strict concurrency check: verify bed is not booked for overlapping dates
    const conflict = db
      .prepare(
        `SELECT id, ref FROM hostel_bookings
         WHERE bed_id = ?
           AND status <> 'cancelled'
           AND check_in < ?
           AND check_out > ?
         LIMIT 1`,
      )
      .get(draft.bedId, draft.checkOut, draft.checkIn) as { id: number; ref: string } | undefined;

    if (conflict) {
      throw new HttpError(
        409,
        `Bed ${bed.bed_number} was just booked by another guest for these dates. Please select an available bed.`,
      );
    }

    // 3. Calculate pricing using server-verified add-on prices (never trust client prices)
    const subtotal = Math.round(bed.price_per_night * nights * 100) / 100;
    const requestedAddonIds = Array.isArray(draft.addons)
      ? draft.addons.map((a) => (typeof a === 'string' ? a : a.id))
      : [];
    const validAddons = HOSTEL_ADDONS_SEED.filter((a) => requestedAddonIds.includes(a.id));
    const verifiedAddons = validAddons.map((a) => ({
      id: a.id,
      name: a.name,
      price: a.perNight ? Math.round(a.price * nights * 100) / 100 : a.price,
    }));
    const addonsTotal = verifiedAddons.reduce((sum, a) => sum + a.price, 0);
    const total = Math.round((subtotal + addonsTotal) * 100) / 100;

    // 4. Generate unique reference with 'HDH-' prefix
    let ref = '';
    for (let attempts = 0; attempts < 5; attempts++) {
      const candidate = `HDH-${Math.floor(100000 + Math.random() * 900000)}`;
      const exists = db.prepare('SELECT id FROM hostel_bookings WHERE ref = ?').get(candidate);
      if (!exists) {
        ref = candidate;
        break;
      }
    }
    if (!ref) throw new HttpError(500, 'Failed to generate unique hostel booking reference.');

    const bedLabel = `${bed.bed_number} (${bed.tier === 'top' ? 'Upper Bunk' : 'Lower Bunk'})`;

    db.prepare(
      `INSERT INTO hostel_bookings (
         ref, customer_id, room_id, bed_id, room_name, bed_label,
         check_in, check_out, nights, guest_name, guest_email, guest_phone,
         guest_gender, eta, special_requests, addons_json, subtotal, total,
         deposit_amount, payment_status, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'confirmed')`,
    ).run(
      ref,
      customerId,
      draft.roomId,
      draft.bedId,
      room.name,
      bedLabel,
      draft.checkIn,
      draft.checkOut,
      nights,
      draft.guestName,
      draft.guestEmail,
      draft.guestPhone,
      draft.guestGender || 'unspecified',
      draft.eta || '14:00 - 18:00',
      draft.specialRequests || '',
      JSON.stringify(verifiedAddons),
      subtotal,
      total,
      depositAmount,
    );

    audit(customerId, 'hostel.book', `Booked bed ${draft.bedId} in ${room.name} (${draft.checkIn} to ${draft.checkOut}), ref ${ref}`);
    return ref;
  });
}

export function listHostelBookingsForCustomer(customerId: number): HostelBookingView[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.*, r.type as room_type, bd.tier
       FROM hostel_bookings b
       JOIN hostel_rooms r ON b.room_id = r.id
       JOIN hostel_beds bd ON b.bed_id = bd.id
       WHERE b.customer_id = ?
       ORDER BY b.check_in DESC, b.id DESC`,
    )
    .all(customerId) as {
    ref: string;
    room_id: string;
    room_name: string;
    room_type: HostelRoomType;
    bed_id: string;
    bed_label: string;
    tier: 'top' | 'bottom';
    check_in: string;
    check_out: string;
    nights: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_gender: string;
    eta: string;
    special_requests: string;
    subtotal: number;
    addons_json: string;
    total: number;
    deposit_amount: number;
    payment_status: 'unpaid' | 'deposit_paid' | 'paid';
    status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
    paypal_order_id: string | null;
    created_at: string;
  }[];

  return rows.map((r) => ({
    ref: r.ref,
    roomId: r.room_id,
    roomName: r.room_name,
    roomType: r.room_type,
    bedId: r.bed_id,
    bedLabel: r.bed_label,
    tier: r.tier,
    checkIn: r.check_in,
    checkOut: r.check_out,
    nights: r.nights,
    guestName: r.guest_name,
    guestEmail: r.guest_email,
    guestPhone: r.guest_phone,
    guestGender: r.guest_gender,
    eta: r.eta,
    specialRequests: r.special_requests,
    subtotal: r.subtotal,
    addons: JSON.parse(r.addons_json || '[]'),
    total: r.total,
    depositAmount: r.deposit_amount,
    paymentStatus: r.payment_status,
    status: r.status,
    paypalOrderId: r.paypal_order_id,
    createdAt: r.created_at,
  }));
}

export function getHostelBookingByRef(ref: string): HostelBookingView | null {
  const db = getDb();
  const r = db
    .prepare(
      `SELECT b.*, r.type as room_type, bd.tier
       FROM hostel_bookings b
       JOIN hostel_rooms r ON b.room_id = r.id
       JOIN hostel_beds bd ON b.bed_id = bd.id
       WHERE b.ref = ?`,
    )
    .get(ref) as
    | {
        ref: string;
        room_id: string;
        room_name: string;
        room_type: HostelRoomType;
        bed_id: string;
        bed_label: string;
        tier: 'top' | 'bottom';
        check_in: string;
        check_out: string;
        nights: number;
        guest_name: string;
        guest_email: string;
        guest_phone: string;
        guest_gender: string;
        eta: string;
        special_requests: string;
        subtotal: number;
        addons_json: string;
        total: number;
        deposit_amount: number;
        payment_status: 'unpaid' | 'deposit_paid' | 'paid';
        status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
        paypal_order_id: string | null;
        created_at: string;
      }
    | undefined;

  if (!r) return null;

  return {
    ref: r.ref,
    roomId: r.room_id,
    roomName: r.room_name,
    roomType: r.room_type,
    bedId: r.bed_id,
    bedLabel: r.bed_label,
    tier: r.tier,
    checkIn: r.check_in,
    checkOut: r.check_out,
    nights: r.nights,
    guestName: r.guest_name,
    guestEmail: r.guest_email,
    guestPhone: r.guest_phone,
    guestGender: r.guest_gender,
    eta: r.eta,
    specialRequests: r.special_requests,
    subtotal: r.subtotal,
    addons: JSON.parse(r.addons_json || '[]'),
    total: r.total,
    depositAmount: r.deposit_amount,
    paymentStatus: r.payment_status,
    status: r.status,
    paypalOrderId: r.paypal_order_id,
    createdAt: r.created_at,
  };
}

export function getHostelBookingForCustomer(customerId: number, ref: string): HostelBookingView {
  const db = getDb();
  const r = db
    .prepare(
      `SELECT b.*, r.type as room_type, bd.tier
       FROM hostel_bookings b
       JOIN hostel_rooms r ON b.room_id = r.id
       JOIN hostel_beds bd ON b.bed_id = bd.id
       WHERE b.ref = ? AND b.customer_id = ?`,
    )
    .get(ref, customerId) as
    | {
        ref: string;
        room_id: string;
        room_name: string;
        room_type: HostelRoomType;
        bed_id: string;
        bed_label: string;
        tier: 'top' | 'bottom';
        check_in: string;
        check_out: string;
        nights: number;
        guest_name: string;
        guest_email: string;
        guest_phone: string;
        guest_gender: string;
        eta: string;
        special_requests: string;
        subtotal: number;
        addons_json: string;
        total: number;
        deposit_amount: number;
        payment_status: 'unpaid' | 'deposit_paid' | 'paid';
        status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
        paypal_order_id: string | null;
        created_at: string;
      }
    | undefined;

  if (!r) throw new HttpError(404, 'Hostel stay not found.');

  return {
    ref: r.ref,
    roomId: r.room_id,
    roomName: r.room_name,
    roomType: r.room_type,
    bedId: r.bed_id,
    bedLabel: r.bed_label,
    tier: r.tier,
    checkIn: r.check_in,
    checkOut: r.check_out,
    nights: r.nights,
    guestName: r.guest_name,
    guestEmail: r.guest_email,
    guestPhone: r.guest_phone,
    guestGender: r.guest_gender,
    eta: r.eta,
    specialRequests: r.special_requests,
    subtotal: r.subtotal,
    addons: JSON.parse(r.addons_json || '[]'),
    total: r.total,
    depositAmount: r.deposit_amount,
    paymentStatus: r.payment_status,
    status: r.status,
    paypalOrderId: r.paypal_order_id,
    createdAt: r.created_at,
  };
}

export function cancelHostelBooking(customerId: number, ref: string): void {
  const db = getDb();
  const booking = db.prepare('SELECT id, status, customer_id FROM hostel_bookings WHERE ref = ?').get(ref) as
    | { id: number; status: string; customer_id: number }
    | undefined;

  if (!booking) throw new HttpError(404, 'Hostel stay not found.');
  if (booking.customer_id !== customerId) throw new HttpError(403, 'You do not have access to this booking.');
  if (booking.status === 'cancelled') throw new HttpError(400, 'Stay is already cancelled.');

  transaction((txDb) => {
    txDb.prepare("UPDATE hostel_bookings SET status = 'cancelled' WHERE ref = ?").run(ref);
    audit(customerId, 'hostel_booking_cancelled', `Ref: ${ref}`);
  });
}

