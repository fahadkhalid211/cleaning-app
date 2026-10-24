export type ServiceType = 
  | 'regular' 
  | 'deep' 
  | 'end_of_tenancy' 
  | 'airbnb' 
  | 'after_renovation'
  | string;

export type FrequencyType = 'weekly' | 'biweekly' | 'monthly' | 'one_off';

export interface ServiceDefinition {
  id: string;
  title: string;
  tagline: string;
  description: string;
  basePricePerHour: number;
  minHours: number;
  recommendedFor: string;
  iconName: string;
  badge?: string;
  includedHighlights: string[];
}

export interface AddonOption {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  icon: string;
  popular?: boolean;
}

export interface RoomConfig {
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  livingRooms: number;
  extraAreas: number;
}

export interface AccessDetails {
  accessMethod: 'home' | 'lockbox' | 'concierge' | 'hidden_spot';
  lockboxCode?: string;
  specialInstructions?: string;
  hasPets: boolean;
  petDetails?: string;
  parkingAvailable: boolean;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  defaultAddress?: string;
  bookings: string[]; // Booking IDs
}

export interface CleanerProfile {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalCleans: number;
  experienceYears: number;
  badges: string[];
  bio: string;
  vaccinationVerified: boolean;
  backgroundChecked: boolean;
  phone: string;
}

export interface ChecklistTask {
  id: string;
  room: 'Kitchen' | 'Bathrooms' | 'Bedrooms' | 'Living Area' | 'Special Add-ons';
  task: string;
  completed: boolean;
  completedAt?: string;
}

export interface BeforeAfterPhoto {
  id: string;
  area: string;
  beforeUrl: string;
  afterUrl: string;
  caption: string;
}

export type BookingStatus = 
  | 'confirmed' 
  | 'cleaner_assigned' 
  | 'on_the_way' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface Booking {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  serviceType: ServiceType;
  frequency: FrequencyType;
  rooms: RoomConfig;
  selectedAddons: string[];
  date: string;
  timeSlot: string;
  address: {
    street: string;
    apt?: string;
    city: string;
    postcode: string;
  };
  access: AccessDetails;
  status: BookingStatus;
  cleaner?: CleanerProfile;
  totalPrice: number;
  discountAmount: number;
  estimatedHours: number;
  tasks: ChecklistTask[];
  beforeAfterPhotos: BeforeAfterPhoto[];
  notes?: string;
  tipAmount?: number;
  customerReview?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'cleaner';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  event: string;
  category: 'booking' | 'auth' | 'system' | 'cleaner' | 'payment';
  level: 'info' | 'warning' | 'success';
  details: string;
}
