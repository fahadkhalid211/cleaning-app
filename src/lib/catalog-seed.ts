// Starting catalogue, written to the database on first run.
// After that, prices are edited from the admin area, not here.

export interface ServiceSeed {
  id: string;
  title: string;
  short: string;
  description: string;
  hourlyRate: number;
  minHours: number;
  timeMultiplier: number;
  icon: string;
  includes: string[];
}

export interface AddonSeed {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
}

export const SERVICE_SEED: ServiceSeed[] = [
  {
    id: 'regular',
    title: 'Regular cleaning',
    short: 'Weekly or fortnightly upkeep',
    description: 'Dusting, hoovering, mopping, a full kitchen wipe-down and bathroom clean.',
    hourlyRate: 24,
    minHours: 2.5,
    timeMultiplier: 1,
    icon: 'Sparkles',
    includes: ['Dusting of reachable surfaces', 'Hoovering and mopping floors', 'Kitchen worktops, hob and sink', 'Bathroom, toilet and mirrors', 'Bins emptied, beds made'],
  },
  {
    id: 'deep',
    title: 'Deep cleaning',
    short: 'Top-to-bottom reset',
    description: 'Everything in a regular clean plus grout, skirting boards, doors, switches and behind furniture.',
    hourlyRate: 29,
    minHours: 3.5,
    timeMultiplier: 1.4,
    icon: 'ShieldCheck',
    includes: ['Everything in a regular clean', 'Limescale and grout scrubbing', 'Doors, frames and light switches', 'Behind and under movable furniture', 'Skirting boards and radiators'],
  },
  {
    id: 'end_of_tenancy',
    title: 'End of tenancy',
    short: 'Get your deposit back',
    description: 'A landlord-standard clean of an empty property, inside cupboards and appliances included.',
    hourlyRate: 32,
    minHours: 4.5,
    timeMultiplier: 1.7,
    icon: 'KeyRound',
    includes: ['Inside all cupboards and drawers', 'Oven, hob and extractor', 'Descaling taps and shower screens', 'Inside windows and sills', '72-hour free re-clean if anything is missed'],
  },
  {
    id: 'airbnb',
    title: 'Airbnb turnover',
    short: 'Guest-ready between stays',
    description: 'Fast changeovers: beds made, kitchen and bathrooms reset, and a check for left-behind items.',
    hourlyRate: 27,
    minHours: 2,
    timeMultiplier: 1.1,
    icon: 'BedDouble',
    includes: ['Beds stripped and made', 'Kitchen and bathroom reset', 'Dishwasher emptied', 'Left-behind items check', 'Damage noted for the host'],
  },
  {
    id: 'after_builders',
    title: 'After builders',
    short: 'Dust and paint removal',
    description: 'Removes fine building dust, paint flecks and plaster residue after work on your home.',
    hourlyRate: 34,
    minHours: 4,
    timeMultiplier: 1.8,
    icon: 'Hammer',
    includes: ['Fine dust vacuumed from every surface', 'Paint and tape residue removed', 'Light fittings and vents dusted', 'Inside cupboards wiped', 'Floors washed until haze-free'],
  },
];

export const ADDON_SEED: AddonSeed[] = [
  { id: 'oven', name: 'Inside the oven', description: 'Racks soaked and degreased, door glass cleaned', price: 30, durationMin: 45 },
  { id: 'fridge', name: 'Inside the fridge', description: 'Shelves and seals cleaned and sanitised', price: 20, durationMin: 30 },
  { id: 'windows', name: 'Inside windows', description: 'Glass, frames and sills, streak-free', price: 25, durationMin: 40 },
  { id: 'cabinets', name: 'Inside kitchen cupboards', description: 'Emptied, wiped and put back', price: 20, durationMin: 30 },
  { id: 'ironing', name: 'Ironing (one basket)', description: 'Up to 15 items pressed and hung', price: 18, durationMin: 45 },
  { id: 'eco', name: 'Eco-friendly products', description: 'Plant-based, non-toxic cleaning products', price: 8, durationMin: 0 },
];
