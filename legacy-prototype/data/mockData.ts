import { Booking, CleanerProfile, ChecklistTask, BeforeAfterPhoto, ChatMessage } from '@/types/cleaning';

export const MOCK_CLEANERS: CleanerProfile[] = [
  {
    id: 'cleaner-1',
    name: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    rating: 4.98,
    totalCleans: 482,
    experienceYears: 6,
    badges: ['Top Rated Pro', 'Eco Specialist', 'Pet Friendly', '100% On-Time'],
    bio: 'Detail-oriented professional with 6+ years of residential & luxury apartment experience. Passionate about plant-based cleaning and leaving every corner sparkling.',
    vaccinationVerified: true,
    backgroundChecked: true,
    phone: '+1 (555) 234-8901'
  },
  {
    id: 'cleaner-2',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    rating: 4.96,
    totalCleans: 310,
    experienceYears: 4,
    badges: ['Deep Clean Master', 'Tenancy Certified', 'Superhost Specialist'],
    bio: 'End-of-tenancy and move-out guarantee specialist. Known for turning stubborn ovens and lime-scaled bathrooms into showroom condition.',
    vaccinationVerified: true,
    backgroundChecked: true,
    phone: '+1 (555) 345-6789'
  },
  {
    id: 'cleaner-3',
    name: 'David Okafor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    rating: 4.95,
    totalCleans: 275,
    experienceYears: 5,
    badges: ['Rapid Turnaround', 'Post-Build Pro', '5-Star Speed'],
    bio: 'Specialist in heavy-duty and post-renovation resets. Meticulous dust extraction and surface protection.',
    vaccinationVerified: true,
    backgroundChecked: true,
    phone: '+1 (555) 456-7890'
  }
];

export const INITIAL_CHECKLIST: ChecklistTask[] = [
  { id: 't1', room: 'Kitchen', task: 'Disinfect countertops, backsplashes & cooking prep zones', completed: true, completedAt: '10:15 AM' },
  { id: 't2', room: 'Kitchen', task: 'Scrub and polish stainless steel sink, faucet & drain', completed: true, completedAt: '10:28 AM' },
  { id: 't3', room: 'Kitchen', task: 'Wipe exterior of all appliances (stove, fridge, dishwasher)', completed: true, completedAt: '10:40 AM' },
  { id: 't4', room: 'Kitchen', task: 'Deep clean inside oven & soak baking racks (Add-on)', completed: false },
  { id: 't5', room: 'Bathrooms', task: 'Scrub & disinfect shower walls, tub basin & glass screen', completed: true, completedAt: '11:05 AM' },
  { id: 't6', room: 'Bathrooms', task: 'Sanitize toilet bowl, tank, hinges & surrounding base', completed: true, completedAt: '11:20 AM' },
  { id: 't7', room: 'Bathrooms', task: 'Polish chrome faucets and buff mirrors streak-free', completed: false },
  { id: 't8', room: 'Living Area', task: 'High & low dusting: ceiling corners, lamps, baseboards', completed: false },
  { id: 't9', room: 'Living Area', task: 'Vacuum sofas, cushion crevices & fluff throw pillows', completed: false },
  { id: 't10', room: 'Bedrooms', task: 'Make beds with crisp hospital corners & organize linen', completed: false },
  { id: 't11', room: 'Bedrooms', task: 'Dust nightstands, dressers, mirrors and electronics', completed: false },
  { id: 't12', room: 'Living Area', task: 'Vacuum all rugs/carpets and mop hard floors with eco-citrus wash', completed: false }
];

export const MOCK_BEFORE_AFTER: BeforeAfterPhoto[] = [
  {
    id: 'ba-1',
    area: 'Kitchen Stove & Cooktop',
    beforeUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    caption: 'Burnt grease eradicated and stainless steel surface mirror-polished'
  },
  {
    id: 'ba-2',
    area: 'Bathroom Shower Glass & Tile Grout',
    beforeUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&auto=format&fit=crop&q=80',
    caption: 'Limescale dissolved and tile grout brightened without harsh bleach'
  },
  {
    id: 'ba-3',
    area: 'Living Room Hardwood Floor & Rugs',
    beforeUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    caption: 'High-filtration pet dander vacuuming followed by organic cedar mop'
  }
];

export const INITIAL_ACTIVE_BOOKING: Booking = {
  id: 'PS-8942',
  createdAt: '2026-10-22T08:30:00Z',
  customer: {
    name: 'Emma Watson',
    email: 'emma@example.com',
    phone: '+1 (555) 234-5678',
    notes: 'Please focus on the kitchen oven and bathroom grout.'
  },
  serviceType: 'regular',
  frequency: 'biweekly',
  rooms: {
    bedrooms: 2,
    bathrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    extraAreas: 0
  },
  selectedAddons: ['oven', 'eco_supplies'],
  date: 'Today, Oct 22',
  timeSlot: '10:00 AM - 1:30 PM',
  address: {
    street: '742 Evergreen Terrace, Apt 4B',
    city: 'Springfield / Central',
    postcode: 'SP2 1RT'
  },
  access: {
    accessMethod: 'lockbox',
    lockboxCode: '4821',
    specialInstructions: 'Please mind our friendly golden retriever, Bailey. Master bedroom bathroom has hard water buildup on the faucet.',
    hasPets: true,
    petDetails: 'Golden Retriever (Bailey), very gentle',
    parkingAvailable: true
  },
  status: 'in_progress',
  cleaner: MOCK_CLEANERS[0],
  totalPrice: 108.80,
  discountAmount: 19.20,
  estimatedHours: 3.5,
  tasks: INITIAL_CHECKLIST,
  beforeAfterPhotos: MOCK_BEFORE_AFTER,
  notes: 'Customer requested eco-friendly eucalyptus floor wash.'
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'cleaner',
    senderName: 'Maria Santos',
    text: 'Good morning! I just arrived and used the lockbox code 4821. Bailey gave me a warm welcome! Starting with the kitchen and oven now.',
    timestamp: '10:02 AM'
  },
  {
    id: 'm2',
    sender: 'customer',
    senderName: 'You',
    text: 'Wonderful, thank you Maria! Feel free to grab water from the fridge if you need.',
    timestamp: '10:05 AM'
  },
  {
    id: 'm3',
    sender: 'cleaner',
    senderName: 'Maria Santos',
    text: 'Thank you so much! Kitchen counters and stove are done. Working on the oven soaking and heading to the bathrooms next.',
    timestamp: '10:45 AM'
  }
];
