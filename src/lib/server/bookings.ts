import 'server-only';
import { randomInt } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { LIMITS, SCHEDULE } from '@/lib/config';
import { daysBetween, nowInBusinessTz } from '@/lib/dates';
import { FREQUENCIES, quote, type Frequency, type Rooms } from '@/lib/pricing';
import type { AccessMethod, BookingStatus, BookingView, Catalog } from '@/lib/types';
import { audit, isUniqueViolation, transaction } from './db';
import { HttpError } from './http';
import { assertBookableDate, candidateStarts, isCleanerFree, pickCleaner } from './scheduling';
import * as v from './validate';

const ACCESS_METHODS: readonly AccessMethod[] = ['home', 'key_safe', 'concierge', 'other'];
const FREQUENCY_IDS = FREQUENCIES.map((f) => f.id);

export interface BookingDraft {
  serviceId: string;
  serviceTitle: string;
  frequency: Frequency;
  rooms: Rooms;
  addons: { id: string; name: string; price: number }[];
  date: string;
  startMin: number;
  durationMin: number;
  street: string;
  city: string;
  postcode: string;
  accessMethod: AccessMethod;
  accessNotes: string;
  hasPets: boolean;
  notes: string;
  subtotal: number;
  discount: number;
  total: number;
}

/** Validates the "what / when" part of a booking and prices it from the database, ignoring any price the browser sent. */
export function parseJob(body: Record<string, unknown>, catalog: Catalog) {
  const service = catalog.services.find((s) => s.id === body.serviceId);
  if (!service) throw new HttpError(400, 'Please choose a type of cleaning.', 'serviceId');

  const r = (body.rooms ?? {}) as Record<string, unknown>;
  const rooms: Rooms = {
    bedrooms: v.int(r.bedrooms, 'rooms', 'Bedrooms', 0, LIMITS.maxBedrooms),
    bathrooms: v.int(r.bathrooms, 'rooms', 'Bathrooms', 1, LIMITS.maxBathrooms),
    kitchens: v.int(r.kitchens, 'rooms', 'Kitchens', 0, LIMITS.maxKitchens),
    livingRooms: v.int(r.livingRooms, 'rooms', 'Living rooms', 0, LIMITS.maxLivingRooms),
    extraAreas: v.int(r.extraAreas, 'rooms', 'Extra rooms', 0, LIMITS.maxExtraAreas),
  };

  const requested = Array.isArray(body.addonIds) ? body.addonIds : [];
  if (requested.length > catalog.addons.length) throw new HttpError(400, 'Invalid extras.', 'addonIds');
  const addons = catalog.addons.filter((a) => requested.includes(a.id));
  if (addons.length !== new Set(requested).size) throw new HttpError(400, 'One of the extras is no longer available. Please review your extras.', 'addonIds');

  const frequency = v.oneOf(body.frequency, FREQUENCY_IDS, 'frequency', 'how often');
  const q = quote(service, rooms, addons, frequency);
  return { service, rooms, addons, frequency, quote: q };
}

export function parseDraft(body: Record<string, unknown>, catalog: Catalog): BookingDraft {
  const job = parseJob(body, catalog);
  assertBookableDate(body.date);
  const startMin = v.int(body.startMin, 'startMin', 'Start time', 0, 24 * 60);
  assertValidStart(startMin, job.quote.durationMin);

  return {
    serviceId: job.service.id,
    serviceTitle: job.service.title,
    frequency: job.frequency,
    rooms: job.rooms,
    addons: job.addons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    date: body.date,
    startMin,
    durationMin: job.quote.durationMin,
    street: v.text(body.street, 'street', 'Street address', { min: 3, max: 120 }),
    city: v.text(body.city, 'city', 'Town or city', { min: 2, max: 60 }),
    postcode: v.postcode(body.postcode),
    accessMethod: v.oneOf(body.accessMethod, ACCESS_METHODS, 'accessMethod', 'how we get in'),
    accessNotes: v.text(body.accessNotes, 'accessNotes', 'Access details', { max: 300, optional: true }),
    hasPets: v.bool(body.hasPets),
    notes: v.text(body.notes, 'notes', 'Notes', { max: 500, optional: true }),
    subtotal: job.quote.subtotal,
    discount: job.quote.discount,
    total: job.quote.total,
  };
}

function assertValidStart(startMin: number, durationMin: number) {
  if (!candidateStarts(durationMin).includes(startMin)) {
    throw new HttpError(400, 'Please choose one of the arrival times shown.', 'startMin');
  }
}

const REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newRef = () => 'HD-' + Array.from({ length: 6 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join('');

function customerHasClash(db: DatabaseSync, customerId: number, date: string, start: number, duration: number, excludeId = -1) {
  return !!db
    .prepare(
      `SELECT 1 FROM bookings
        WHERE customer_id = ? AND date = ? AND status <> 'cancelled' AND id <> ?
          AND start_min < ? AND start_min + duration_min > ? LIMIT 1`,
    )
    .get(customerId, date, excludeId, start + duration, start);
}

const SLOT_TAKEN = 'Sorry, that time was just booked by someone else. Please pick another time.';

export function createBooking(customerId: number, d: BookingDraft, requestKey: string | null, depositAmount = 0): string {
  try {
    return transaction((db) => {
      if (requestKey) {
        const existing = db.prepare('SELECT ref FROM bookings WHERE customer_id = ? AND request_key = ?').get(customerId, requestKey) as
          | { ref: string }
          | undefined;
        if (existing) return existing.ref; // Double-click / retry: return the booking we already made.
      }
      if (customerHasClash(db, customerId, d.date, d.startMin, d.durationMin)) {
        throw new HttpError(409, 'You already have a cleaning booked at that time. Please choose a different time.', 'startMin');
      }
      const cleanerId = pickCleaner(db, d.date, d.startMin, d.durationMin);
      if (!cleanerId) throw new HttpError(409, SLOT_TAKEN, 'startMin');

      for (let attempt = 0; ; attempt++) {
        const ref = newRef();
        try {
          db.prepare(
            `INSERT INTO bookings (ref, customer_id, cleaner_id, service_id, service_title, frequency, rooms_json, addons_json,
               date, start_min, duration_min, status, street, city, postcode, access_method, access_notes, has_pets, notes,
               subtotal, discount, total, deposit_amount, payment_status, request_key)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?)`,
          ).run(
            ref, customerId, cleanerId, d.serviceId, d.serviceTitle, d.frequency, JSON.stringify(d.rooms), JSON.stringify(d.addons),
            d.date, d.startMin, d.durationMin, d.street, d.city, d.postcode, d.accessMethod, d.accessNotes, d.hasPets ? 1 : 0, d.notes,
            d.subtotal, d.discount, d.total, depositAmount, requestKey,
          );
          audit(customerId, 'booking.create', `${ref} ${d.date} ${d.startMin} cleaner=${cleanerId} total=${d.total} deposit=${depositAmount}`);
          return ref;
        } catch (err) {
          // Only a reference-number collision is worth retrying; anything else is a real conflict.
          if (isUniqueViolation(err) && /bookings\.ref/.test((err as Error).message) && attempt < 5) continue;
          throw err;
        }
      }
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new HttpError(409, SLOT_TAKEN, 'startMin');
    throw err;
  }
}

// ---------- Reading ----------

interface BookingRow {
  id: number;
  ref: string;
  customer_id: number;
  cleaner_id: number;
  service_id: string;
  service_title: string;
  frequency: Frequency;
  rooms_json: string;
  addons_json: string;
  date: string;
  start_min: number;
  duration_min: number;
  status: BookingStatus;
  street: string;
  city: string;
  postcode: string;
  access_method: AccessMethod;
  access_notes: string;
  has_pets: number;
  notes: string;
  subtotal: number;
  discount: number;
  total: number;
  deposit_amount?: number;
  payment_status?: string;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  created_at: string;
  cleaner_name: string;
  cleaner_phone: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

const SELECT = `
  SELECT b.*, c.name AS cleaner_name, c.phone AS cleaner_phone,
         u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email
    FROM bookings b
    JOIN users c ON c.id = b.cleaner_id
    JOIN users u ON u.id = b.customer_id`;

export function minutesUntilStart(date: string, startMin: number): number {
  const now = nowInBusinessTz();
  return daysBetween(now.date, date) * 1440 + startMin - now.minutes;
}

const changeable = (r: { status: BookingStatus; date: string; start_min: number }) =>
  r.status === 'confirmed' && minutesUntilStart(r.date, r.start_min) >= SCHEDULE.changeCutoffHours * 60;

type Audience = 'customer' | 'cleaner' | 'admin';

/** Each audience only gets the fields it needs. */
function toView(r: BookingRow, audience: Audience): BookingView {
  const view: BookingView = {
    ref: r.ref,
    status: r.status,
    serviceId: r.service_id,
    serviceTitle: r.service_title,
    frequency: r.frequency,
    rooms: JSON.parse(r.rooms_json),
    addons: JSON.parse(r.addons_json),
    date: r.date,
    startMin: r.start_min,
    durationMin: r.duration_min,
    street: r.street,
    city: r.city,
    postcode: r.postcode,
    accessMethod: r.access_method,
    accessNotes: r.access_notes,
    hasPets: r.has_pets === 1,
    notes: r.notes,
    subtotal: r.subtotal,
    discount: r.discount,
    total: r.total,
    depositAmount: r.deposit_amount ?? 0,
    paymentStatus: (r.payment_status as BookingView['paymentStatus']) ?? 'unpaid',
    stripeSessionId: r.stripe_session_id ?? null,
    createdAt: r.created_at,
    canChange: audience === 'customer' ? changeable(r) : false,
    cleaner: { id: r.cleaner_id, name: audience === 'customer' ? r.cleaner_name.split(' ')[0] : r.cleaner_name },
  };
  if (audience === 'admin') view.cleaner!.phone = r.cleaner_phone;
  if (audience !== 'customer') view.customer = { id: r.customer_id, name: r.customer_name, phone: r.customer_phone };
  if (audience === 'admin') view.customer!.email = r.customer_email;
  return view;
}

export function listForCustomer(db: DatabaseSync, customerId: number): BookingView[] {
  const rows = db.prepare(`${SELECT} WHERE b.customer_id = ? ORDER BY b.date DESC, b.start_min DESC`).all(customerId) as unknown as BookingRow[];
  return rows.map((r) => toView(r, 'customer'));
}

export function listForCleaner(db: DatabaseSync, cleanerId: number, fromDate: string): BookingView[] {
  const rows = db
    .prepare(`${SELECT} WHERE b.cleaner_id = ? AND b.date >= ? AND b.status <> 'cancelled' ORDER BY b.date, b.start_min LIMIT 200`)
    .all(cleanerId, fromDate) as unknown as BookingRow[];
  return rows.map((r) => toView(r, 'cleaner'));
}

export function listForAdmin(db: DatabaseSync, filter: { from?: string; to?: string; status?: string; q?: string }): BookingView[] {
  const where: string[] = [];
  const params: (string | number)[] = [];
  const add = (clause: string, value: string) => {
    where.push(clause);
    params.push(value);
  };
  if (filter.from) add('b.date >= ?', filter.from);
  if (filter.to) add('b.date <= ?', filter.to);
  if (filter.status) add('b.status = ?', filter.status);
  if (filter.q) {
    where.push('(b.ref LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR b.postcode LIKE ?)');
    const like = `%${filter.q.replace(/[%_]/g, '')}%`;
    params.push(like, like, like, like);
  }
  const sql = `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY b.date, b.start_min LIMIT 500`;
  return (db.prepare(sql).all(...params) as unknown as BookingRow[]).map((r) => toView(r, 'admin'));
}

function findRow(db: DatabaseSync, ref: unknown): BookingRow | undefined {
  if (typeof ref !== 'string' || !/^HD-[A-Z0-9]{6}$/.test(ref)) return undefined;
  return db.prepare(`${SELECT} WHERE b.ref = ?`).get(ref) as unknown as BookingRow | undefined;
}

export function getForCustomer(db: DatabaseSync, customerId: number, ref: unknown): BookingView {
  const row = findRow(db, ref);
  // Same 404 whether it doesn't exist or belongs to someone else: no probing other people's references.
  if (!row || row.customer_id !== customerId) throw new HttpError(404, 'Booking not found.');
  return toView(row, 'customer');
}

// ---------- Changes ----------

export function cancelByCustomer(customerId: number, ref: unknown) {
  transaction((db) => {
    const row = findRow(db, ref);
    if (!row || row.customer_id !== customerId) throw new HttpError(404, 'Booking not found.');
    if (!changeable(row)) {
      throw new HttpError(409, `This booking can no longer be cancelled online (less than ${SCHEDULE.changeCutoffHours} hours to go). Please call us.`);
    }
    db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(row.id);
    audit(customerId, 'booking.cancel', row.ref);
  });
}

export function rescheduleByCustomer(customerId: number, ref: unknown, date: unknown, startMinRaw: unknown) {
  assertBookableDate(date);
  const startMin = v.int(startMinRaw, 'startMin', 'Start time', 0, 24 * 60);
  try {
    transaction((db) => {
      const row = findRow(db, ref);
      if (!row || row.customer_id !== customerId) throw new HttpError(404, 'Booking not found.');
      assertValidStart(startMin, row.duration_min);
      if (!changeable(row)) {
        throw new HttpError(409, `This booking can no longer be moved online (less than ${SCHEDULE.changeCutoffHours} hours to go). Please call us.`);
      }
      if (customerHasClash(db, customerId, date, startMin, row.duration_min, row.id)) {
        throw new HttpError(409, 'You already have a cleaning booked at that time.', 'startMin');
      }
      const cleanerId = pickCleaner(db, date, startMin, row.duration_min, { excludeBookingId: row.id, prefer: row.cleaner_id });
      if (!cleanerId) throw new HttpError(409, SLOT_TAKEN, 'startMin');
      db.prepare("UPDATE bookings SET date = ?, start_min = ?, cleaner_id = ?, updated_at = datetime('now') WHERE id = ?").run(
        date, startMin, cleanerId, row.id,
      );
      audit(customerId, 'booking.reschedule', `${row.ref} -> ${date} ${startMin}`);
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new HttpError(409, SLOT_TAKEN, 'startMin');
    throw err;
  }
}

const CLEANER_FLOW: Partial<Record<BookingStatus, BookingStatus>> = {
  confirmed: 'on_the_way',
  on_the_way: 'in_progress',
  in_progress: 'completed',
};

export function advanceByCleaner(cleanerId: number, ref: unknown, to: unknown) {
  transaction((db) => {
    const row = findRow(db, ref);
    if (!row || row.cleaner_id !== cleanerId) throw new HttpError(404, 'Job not found.');
    const next = CLEANER_FLOW[row.status];
    if (!next || next !== to) throw new HttpError(409, 'This job has already been updated. Refresh the page.');
    if (row.date !== nowInBusinessTz().date) throw new HttpError(409, 'You can only update jobs on the day of the clean.');
    db.prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?").run(next, row.id);
    audit(cleanerId, 'job.status', `${row.ref} ${row.status} -> ${next}`);
  });
}

const ADMIN_STATUSES: readonly BookingStatus[] = ['confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'];

export function updateByAdmin(adminId: number, ref: unknown, body: Record<string, unknown>) {
  try {
    transaction((db) => {
      const row = findRow(db, ref);
      if (!row) throw new HttpError(404, 'Booking not found.');
      let currentCleaner = row.cleaner_id;

      if (body.cleanerId !== undefined) {
        const cleanerId = v.int(body.cleanerId, 'cleanerId', 'Cleaner', 1, Number.MAX_SAFE_INTEGER);
        const cleaner = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'cleaner' AND active = 1").get(cleanerId);
        if (!cleaner) throw new HttpError(400, 'That cleaner is not available.', 'cleanerId');
        if (row.status !== 'cancelled' && !isCleanerFree(db, cleanerId, row.date, row.start_min, row.duration_min, row.id)) {
          throw new HttpError(409, 'That cleaner already has a job at this time.', 'cleanerId');
        }
        db.prepare("UPDATE bookings SET cleaner_id = ?, updated_at = datetime('now') WHERE id = ?").run(cleanerId, row.id);
        currentCleaner = cleanerId;
        audit(adminId, 'admin.reassign', `${row.ref} cleaner ${row.cleaner_id} -> ${cleanerId}`);
      }

      if (body.status !== undefined) {
        const status = v.oneOf(body.status, ADMIN_STATUSES, 'status', 'a status');
        if (row.status === 'cancelled' && status !== 'cancelled') {
          // Re-activating takes the slot back, so it must still be free.
          if (!isCleanerFree(db, currentCleaner, row.date, row.start_min, row.duration_min, row.id)) {
            throw new HttpError(409, 'Cannot restore: the cleaner is now booked at that time. Assign another cleaner first.');
          }
        }
        db.prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, row.id);
        audit(adminId, 'admin.status', `${row.ref} ${row.status} -> ${status}`);
      }
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new HttpError(409, 'That change would double-book a cleaner.');
    throw err;
  }
}
