import { ServiceDefinition } from '@/types/cleaning';

export const CLEANING_SERVICES: ServiceDefinition[] = [
  {
    id: 'regular',
    title: 'Regular Maintenance Clean',
    tagline: 'Keep your sanctuary effortless & consistently fresh',
    description: 'Weekly or bi-weekly housekeeping covering all living spaces, kitchen surfaces, bathroom sanitation, dusting, vacuuming, and mopping.',
    basePricePerHour: 28,
    minHours: 2.5,
    recommendedFor: 'Busy professionals, families, ongoing peace of mind',
    iconName: 'Sparkles',
    badge: 'Most Popular',
    includedHighlights: [
      'Dusting all accessible furniture & skirting boards',
      'Vacuuming rugs & carpets, washing all hard floors',
      'Complete sanitization of kitchen counters, sink & stove',
      'Full bathroom disinfection, mirrors & limescale treatment',
      'Emptying trash cans & replacing liners',
      'Bed making & tidying pillows'
    ]
  },
  {
    id: 'deep',
    title: 'Deep / Spring Reset Clean',
    tagline: 'Intensive top-to-bottom scrub down to the smallest detail',
    description: 'Comprehensive restorative cleaning including behind accessible furniture, tile grout scrubbing, door frames, light switches, and built-up grease removal.',
    basePricePerHour: 34,
    minHours: 3.5,
    recommendedFor: 'Seasonal refreshes, high-traffic homes, first-time clients',
    iconName: 'ShieldCheck',
    badge: 'Best Value Reset',
    includedHighlights: [
      'Everything in Regular Clean plus detailed scrubbing',
      'Deep tile & grout grime removal in bathrooms & kitchen',
      'Detailed wipe-down of all doors, frames, handles & switches',
      'Exterior appliance polishing (fridge, oven, microwave)',
      'Behind & underneath moveable furniture and sofas',
      'Detailed baseboards, window sills & radiators dusted'
    ]
  },
  {
    id: 'end_of_tenancy',
    title: 'End of Tenancy / Move-Out',
    tagline: '100% Landlord & Estate Agent Deposit-Back Guarantee',
    description: 'Compliant with strict agency inventory checklists. Rigorous deep clean of empty properties ensuring full security deposit return with a 72-hour free re-clean guarantee.',
    basePricePerHour: 38,
    minHours: 4.5,
    recommendedFor: 'Moving out of rental properties, home sales, pre-lease handovers',
    iconName: 'KeyRound',
    badge: 'Deposit Guaranteed',
    includedHighlights: [
      'Strict adherence to UK/US landlord & agency inventory standards',
      'Inside & outside of all kitchen cupboards, drawers & worktops',
      'Full descaling of shower heads, faucets, taps & glass screens',
      'Interior window cleaning & sill polishing included',
      'Full wall spot-cleaning (removable scuffs & cobwebs)',
      '72-hour complimentary re-clean guarantee if anything is flagged'
    ]
  },
  {
    id: 'airbnb',
    title: 'Airbnb & Vacation Rental Turnover',
    tagline: 'Hotel-quality 5-star turnaround between guests',
    description: 'Rapid, pristine changeovers featuring linen stripping & bed making, luxury staging, bathroom toiletries restock, and instant host report with photo proof.',
    basePricePerHour: 32,
    minHours: 2.0,
    recommendedFor: 'Superhosts, holiday let managers, boutique rentals',
    iconName: 'Hotel',
    badge: 'Fast Turnaround',
    includedHighlights: [
      'Linen stripping, washing/making hotel-corner beds',
      'Complete kitchen & bathroom reset with hotel-style folds',
      'Dishwasher emptying & kitchenware inspection',
      'Checking drawers & under beds for forgotten guest belongings',
      'Damage reporting & restock checklist alerts via app',
      'Fresh, welcome-ready aesthetic for the next arrival'
    ]
  },
  {
    id: 'after_renovation',
    title: 'Post-Builders & Renovation',
    tagline: 'Eliminate fine silica dust, paint flecks & plaster residue',
    description: 'Specialized industrial clean targeting fine construction dust, residue removal on glass, tape adhesive removal, and air purification wiping.',
    basePricePerHour: 40,
    minHours: 4.0,
    recommendedFor: 'Post-remodel, new builds, kitchen/bathroom renovations',
    iconName: 'Hammer',
    badge: 'Heavy Duty',
    includedHighlights: [
      'HEPA-filter vacuuming of fine plaster & drywall dust',
      'Paint splatter, silicone & tape residue safe removal',
      'Top-to-bottom dusting of ceilings, light fixtures & vents',
      'All cabinet interior crevices vacuumed and wiped clean',
      'Multiple water passes on hard floors to prevent white haze'
    ]
  }
];

export const FREQUENCY_DISCOUNTS = [
  {
    id: 'weekly' as const,
    label: 'Weekly',
    discountPercent: 20,
    badge: 'Save 20% • Best Choice',
    tagline: 'Recommended for effortlessly spotless living every week'
  },
  {
    id: 'biweekly' as const,
    label: 'Every 2 Weeks',
    discountPercent: 15,
    badge: 'Save 15% • Most Popular',
    tagline: 'Perfect balance of freshness and value'
  },
  {
    id: 'monthly' as const,
    label: 'Every 4 Weeks',
    discountPercent: 10,
    badge: 'Save 10%',
    tagline: 'Great for a monthly deep refresh'
  },
  {
    id: 'one_off' as const,
    label: 'One-Time Clean',
    discountPercent: 0,
    badge: 'Flexible',
    tagline: 'Single session with no commitment'
  }
];
