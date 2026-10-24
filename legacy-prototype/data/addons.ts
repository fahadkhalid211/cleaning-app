import { AddonOption } from '@/types/cleaning';

export const ADDON_OPTIONS: AddonOption[] = [
  {
    id: 'oven',
    name: 'Deep Oven Cleaning',
    description: 'Racks soaked, degreased, door glass dismantled and cleaned inside and out',
    price: 35,
    durationMinutes: 45,
    icon: 'Flame',
    popular: true
  },
  {
    id: 'fridge',
    name: 'Inside Refrigerator & Freezer',
    description: 'Empty, sanitize shelves, wipe door seals and remove lingering food odors',
    price: 25,
    durationMinutes: 35,
    icon: 'Snowflake',
    popular: true
  },
  {
    id: 'windows',
    name: 'Interior Windows & Sills',
    description: 'Streak-free glass cleaning of all internal windows, frames and sills',
    price: 30,
    durationMinutes: 40,
    icon: 'Maximize2',
    popular: true
  },
  {
    id: 'cabinets',
    name: 'Inside Kitchen Cabinets',
    description: 'Wipe inside of food cupboards, spice racks and dish organizers',
    price: 25,
    durationMinutes: 30,
    icon: 'Archive'
  },
  {
    id: 'eco_supplies',
    name: '100% Eco-Friendly Supplies Kit',
    description: 'Cleaner brings non-toxic, plant-based formulas + pro HEPA vacuum',
    price: 12,
    durationMinutes: 0,
    icon: 'Leaf',
    popular: true
  },
  {
    id: 'ironing',
    name: 'Ironing Service (1 Basket)',
    description: 'Shirts, trousers and linens pressed and hung neatly (up to 15 items)',
    price: 22,
    durationMinutes: 45,
    icon: 'Shirt'
  },
  {
    id: 'pet_hair',
    name: 'Pet Hair Anti-Allergen Vacuuming',
    description: 'Deep mechanical upholstery brushing for pet dander and fur removal',
    price: 18,
    durationMinutes: 30,
    icon: 'Dog'
  },
  {
    id: 'balcony',
    name: 'Balcony or Patio Clean',
    description: 'Sweeping, surface mopping, outdoor glass wiping and cobweb removal',
    price: 20,
    durationMinutes: 25,
    icon: 'Sun'
  }
];
