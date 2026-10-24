// Pure pricing maths. The browser uses it for the live preview; the server
// re-runs it with catalogue values from the database and only trusts its own result.

export type Frequency = 'one_off' | 'weekly' | 'biweekly' | 'monthly';

export const FREQUENCIES: { id: Frequency; label: string; discountPercent: number; note: string }[] = [
  { id: 'one_off', label: 'Just once', discountPercent: 0, note: 'No commitment' },
  { id: 'weekly', label: 'Every week', discountPercent: 20, note: 'Save 20%' },
  { id: 'biweekly', label: 'Every 2 weeks', discountPercent: 15, note: 'Save 15%' },
  { id: 'monthly', label: 'Every 4 weeks', discountPercent: 10, note: 'Save 10%' },
];

export interface Rooms {
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  livingRooms: number;
  extraAreas: number;
}

export interface PricingService {
  id: string;
  hourlyRate: number;
  minHours: number;
  timeMultiplier: number;
}

export interface PricingAddon {
  id: string;
  price: number;
  durationMin: number;
}

export interface Quote {
  hours: number;
  durationMin: number;
  labour: number;
  addonsTotal: number;
  subtotal: number;
  discountPercent: number;
  discount: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const roundUpToHalf = (n: number) => Math.ceil(n * 2) / 2;

export function quote(
  service: PricingService,
  rooms: Rooms,
  addons: PricingAddon[],
  frequency: Frequency,
): Quote {
  const roomHours =
    rooms.bedrooms * 0.6 +
    rooms.bathrooms * 0.7 +
    rooms.kitchens * 0.8 +
    rooms.livingRooms * 0.5 +
    rooms.extraAreas * 0.4;

  const baseHours = Math.max(service.minHours, roundUpToHalf(roomHours * service.timeMultiplier));
  const addonMinutes = addons.reduce((sum, a) => sum + a.durationMin, 0);
  const hours = roundUpToHalf(baseHours + addonMinutes / 60);

  const labour = round2(baseHours * service.hourlyRate);
  const addonsTotal = round2(addons.reduce((sum, a) => sum + a.price, 0));
  const subtotal = round2(labour + addonsTotal);
  const discountPercent = FREQUENCIES.find((f) => f.id === frequency)?.discountPercent ?? 0;
  const discount = round2(subtotal * (discountPercent / 100));

  return {
    hours,
    durationMin: Math.round(hours * 60),
    labour,
    addonsTotal,
    subtotal,
    discountPercent,
    discount,
    total: round2(subtotal - discount),
  };
}
