import 'server-only';
import type { DatabaseSync } from 'node:sqlite';
import { SCHEDULE } from '@/lib/config';
import { addDays, dayOfWeek, daysBetween, isValidDate, nowInBusinessTz } from '@/lib/dates';
import type { Slot } from '@/lib/types';
import { HttpError } from './http';

// How double booking is prevented:
//  1. A cleaner is "busy" from a job's start until its end plus a travel buffer.
//  2. A new job only goes to a cleaner with no overlapping busy period.
//  3. The check and the insert run inside one BEGIN IMMEDIATE transaction
//     (see db.ts), so two customers clicking at the same moment are handled
//     strictly one after the other; the second one sees the first's booking.
//  4. Unique indexes on (cleaner, date, start) and (customer, date, start)
//     reject anything that somehow slips past steps 1–3.

interface Busy {
  cleanerId: number;
  start: number;
  end: number;
}

export function bookableWindow() {
  const today = nowInBusinessTz().date;
  return { first: addDays(today, 1), last: addDays(today, SCHEDULE.horizonDays) };
}

/** Throws a friendly error if customers can't book on this date. */
export function assertBookableDate(date: unknown): asserts date is string {
  if (!isValidDate(date)) throw new HttpError(400, 'Please choose a date.', 'date');
  const { first, last } = bookableWindow();
  if (daysBetween(first, date) < 0) throw new HttpError(400, 'The earliest you can book is tomorrow.', 'date');
  if (daysBetween(date, last) < 0) throw new HttpError(400, `You can book up to ${SCHEDULE.horizonDays} days ahead.`, 'date');
  if (!SCHEDULE.workingDays.includes(dayOfWeek(date))) throw new HttpError(400, 'We are closed on that day. Please choose another date.', 'date');
}

export function candidateStarts(durationMin: number): number[] {
  const starts: number[] = [];
  for (let t = SCHEDULE.dayStartMin; t + durationMin <= SCHEDULE.dayEndMin; t += SCHEDULE.slotStepMin) starts.push(t);
  return starts;
}

function activeCleanerIds(db: DatabaseSync): number[] {
  return (db.prepare("SELECT id FROM users WHERE role = 'cleaner' AND active = 1 ORDER BY id").all() as { id: number }[]).map((r) => r.id);
}

function busyOn(db: DatabaseSync, date: string, excludeBookingId?: number): Busy[] {
  const rows = db
    .prepare(
      `SELECT cleaner_id AS cleanerId, start_min AS start, start_min + duration_min AS end
         FROM bookings
        WHERE date = ? AND status <> 'cancelled' AND id <> ?`,
    )
    .all(date, excludeBookingId ?? -1) as unknown as Busy[];
  return rows;
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd + SCHEDULE.bufferMin && bStart < aEnd + SCHEDULE.bufferMin;

function freeCleaners(cleaners: number[], busy: Busy[], start: number, duration: number): number[] {
  const end = start + duration;
  return cleaners.filter((id) => !busy.some((b) => b.cleanerId === id && overlaps(start, end, b.start, b.end)));
}

export function availability(db: DatabaseSync, date: string, durationMin: number, excludeBookingId?: number): Slot[] {
  const cleaners = activeCleanerIds(db);
  const busy = busyOn(db, date, excludeBookingId);
  return candidateStarts(durationMin).map((startMin) => ({
    startMin,
    available: freeCleaners(cleaners, busy, startMin, durationMin).length > 0,
  }));
}

/**
 * Picks a free cleaner for the slot, or null if the slot is full.
 * MUST be called inside transaction() so the answer can't go stale before the insert.
 */
export function pickCleaner(
  db: DatabaseSync,
  date: string,
  startMin: number,
  durationMin: number,
  opts: { excludeBookingId?: number; prefer?: number } = {},
): number | null {
  if (!candidateStarts(durationMin).includes(startMin)) return null;
  const busy = busyOn(db, date, opts.excludeBookingId);
  const free = freeCleaners(activeCleanerIds(db), busy, startMin, durationMin);
  if (free.length === 0) return null;
  if (opts.prefer && free.includes(opts.prefer)) return opts.prefer;
  // Spread work fairly: the cleaner with the fewest minutes booked that day.
  const load = (id: number) => busy.filter((b) => b.cleanerId === id).reduce((s, b) => s + (b.end - b.start), 0);
  return free.sort((a, b) => load(a) - load(b) || a - b)[0];
}

/** For admin re-assignment: is this specific cleaner free for this booking's time? */
export function isCleanerFree(db: DatabaseSync, cleanerId: number, date: string, startMin: number, durationMin: number, excludeBookingId: number) {
  const busy = busyOn(db, date, excludeBookingId);
  return freeCleaners([cleanerId], busy, startMin, durationMin).length === 1;
}
