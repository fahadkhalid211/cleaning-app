// Shared, non-secret business settings. Safe to import from client and server.

export const BRAND = {
  name: 'Hoodie',
  phone: '020 3000 0000',
  phoneHref: 'tel:+442030000000',
  email: 'hello@hoodie.services',
  domain: 'hoodie.services',
  url: 'https://hoodie.services',
};

export const CURRENCY = { code: 'GBP', symbol: '£', locale: 'en-GB' };

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, { style: 'currency', currency: CURRENCY.code }).format(amount);
}

/** Business timezone used to decide what "today" is and when slots start. */
export const BUSINESS_TZ = 'Europe/London';

export const SCHEDULE = {
  /** Earliest start, minutes after midnight (08:00). */
  dayStartMin: 8 * 60,
  /** Every job must be finished by this time (18:00). */
  dayEndMin: 18 * 60,
  /** Customers pick start times on this grid. */
  slotStepMin: 60,
  /** Travel/rest gap a cleaner needs between two jobs. */
  bufferMin: 30,
  /** How far ahead customers can book. */
  horizonDays: 60,
  /** Days of week we work (0 = Sunday). */
  workingDays: [1, 2, 3, 4, 5, 6],
  /** Customers can cancel or move a booking until this many hours before it starts. */
  changeCutoffHours: 24,
};

export const LIMITS = {
  maxBedrooms: 8,
  maxBathrooms: 6,
  maxKitchens: 3,
  maxLivingRooms: 4,
  maxExtraAreas: 5,
};
