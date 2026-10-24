'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Booking, 
  BookingStatus, 
  ChecklistTask, 
  CleanerProfile, 
  ChatMessage, 
  FrequencyType, 
  RoomConfig, 
  ServiceType,
  UserAccount,
  AdminLog,
  CustomerDetails,
  ServiceDefinition,
  AddonOption
} from '@/types/cleaning';
import { CLEANING_SERVICES, FREQUENCY_DISCOUNTS } from '@/data/services';
import { ADDON_OPTIONS } from '@/data/addons';
import { INITIAL_ACTIVE_BOOKING, INITIAL_CHAT_MESSAGES, MOCK_CLEANERS } from '@/data/mockData';
import { dispatchBookingEmails, EmailDispatchRecord } from '@/services/emailService';

export type Currency = 'USD' | 'GBP' | 'EUR';
export type AppView = 'landing' | 'portal' | 'admin';

interface PriceEstimate {
  baseHours: number;
  addonHours: number;
  totalHours: number;
  hourlyRate: number;
  rawPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  addonsCost: number;
}

interface BookingFormState {
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
  access: {
    accessMethod: 'home' | 'lockbox' | 'concierge' | 'hidden_spot';
    lockboxCode?: string;
    specialInstructions?: string;
    hasPets: boolean;
    petDetails?: string;
    parkingAvailable: boolean;
  };
  cleanerPreference?: string;
}

interface BookingContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
  
  // Auth state
  currentUser: UserAccount | null;
  loginPasswordless: (email: string) => boolean;
  logout: () => void;
  
  // Bookings list
  allBookings: Booking[];
  activeBooking: Booking | null;
  setActiveBooking: (b: Booking | null) => void;
  
  // Wizard state & controls
  form: BookingFormState;
  updateForm: (updates: Partial<BookingFormState>) => void;
  updateCustomer: (updates: Partial<CustomerDetails>) => void;
  updateRooms: (roomUpdates: Partial<RoomConfig>) => void;
  toggleAddon: (addonId: string) => void;
  calculateEstimate: (state?: Partial<BookingFormState>) => PriceEstimate;
  currentEstimate: PriceEstimate;
  submitNewBooking: () => Booking;
  resetForm: () => void;
  
  // Admin & Booking Actions
  adminLogs: AdminLog[];
  addAdminLog: (event: string, category: AdminLog['category'], level: AdminLog['level'], details: string) => void;
  updateBookingStatus: (idOrStatus: string, maybeStatus?: BookingStatus) => void;
  assignCleaner: (bookingId: string, cleanerId: string) => void;
  cancelBooking: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newTime: string) => void;
  toggleChecklistTask: (idOrTaskId: string, maybeTaskId?: string) => void;
  tipCleaner: (amount: number) => void;
  submitReview: (rating: number, comment: string) => void;
  
  // Outbound Email Notifications
  sentEmails: EmailDispatchRecord[];
  lastDispatchedEmails: { customerEmail: EmailDispatchRecord; adminEmail: EmailDispatchRecord } | null;

  // Dynamic Services & Addons (Admin Pricing Controls)
  services: ServiceDefinition[];
  addons: AddonOption[];
  updateServicePrice: (serviceId: string, newRate: number) => void;
  addNewService: (service: ServiceDefinition) => void;
  deleteService: (serviceId: string) => void;
  updateAddonPrice: (addonId: string, newPrice: number) => void;
  addNewAddon: (addon: AddonOption) => void;
  deleteAddon: (addonId: string) => void;

  // In-app chat
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, sender?: 'customer' | 'cleaner') => void;
}

const defaultFormState: BookingFormState = {
  customer: {
    name: '',
    email: '',
    phone: '',
    notes: '',
  },
  serviceType: 'regular',
  frequency: 'biweekly',
  rooms: {
    bedrooms: 2,
    bathrooms: 1,
    kitchens: 1,
    livingRooms: 1,
    extraAreas: 0,
  },
  selectedAddons: ['eco_supplies'],
  date: 'Thursday, Oct 23',
  timeSlot: 'Morning (8:00 AM - 11:00 AM)',
  address: {
    street: '',
    apt: '',
    city: 'San Francisco',
    postcode: '',
  },
  access: {
    accessMethod: 'home',
    lockboxCode: '',
    specialInstructions: '',
    hasPets: false,
    petDetails: '',
    parkingAvailable: true,
  },
  cleanerPreference: 'any_top_rated',
};

const INITIAL_LOGS: AdminLog[] = [
  {
    id: 'log-1',
    timestamp: '10:02 AM',
    event: 'Cleaner On Site',
    category: 'cleaner',
    level: 'info',
    details: 'Maria Santos arrived at 742 Evergreen Terrace for job #PS-8942'
  },
  {
    id: 'log-2',
    timestamp: '09:45 AM',
    event: 'Status Advanced',
    category: 'booking',
    level: 'success',
    details: 'Job #PS-8942 marked In Progress (checklist active)'
  },
  {
    id: 'log-3',
    timestamp: '08:30 AM',
    event: 'New Booking Confirmed',
    category: 'booking',
    level: 'success',
    details: 'Booking #PS-8942 ($108.80) created by Emma Watson'
  },
  {
    id: 'log-4',
    timestamp: '08:30 AM',
    event: 'Auto-Account Generated',
    category: 'auth',
    level: 'info',
    details: 'Created customer account for emma@example.com'
  },
  {
    id: 'log-5',
    timestamp: '08:29 AM',
    event: 'Pre-Authorization Success',
    category: 'payment',
    level: 'info',
    details: 'Payment hold of $108.80 pre-authorized via Stripe'
  }
];

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  const [allBookings, setAllBookings] = useState<Booking[]>([INITIAL_ACTIVE_BOOKING]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingFormState>(defaultFormState);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(INITIAL_LOGS);
  const [sentEmails, setSentEmails] = useState<EmailDispatchRecord[]>([]);
  const [lastDispatchedEmails, setLastDispatchedEmails] = useState<{ customerEmail: EmailDispatchRecord; adminEmail: EmailDispatchRecord } | null>(null);

  // Dynamic services & addons catalog manageable by Admin
  const [services, setServices] = useState<ServiceDefinition[]>(CLEANING_SERVICES);
  const [addons, setAddons] = useState<AddonOption[]>(ADDON_OPTIONS);

  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '$';
    }
  }, [currency]);

  const formatPrice = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const addAdminLog = (event: string, category: AdminLog['category'], level: AdminLog['level'], details: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: AdminLog = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      event,
      category,
      level,
      details
    };
    setAdminLogs(prev => [newLog, ...prev]);
  };

  const updateServicePrice = (serviceId: string, newRate: number) => {
    const validRate = Math.max(1, Math.round(newRate * 100) / 100);
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, basePricePerHour: validRate } : s));
    const sName = services.find(s => s.id === serviceId)?.title || serviceId;
    addAdminLog(
      'Service Price Updated',
      'system',
      'info',
      `Admin updated "${sName}" base hourly rate to $${validRate}/hr`
    );
  };

  const addNewService = (newService: ServiceDefinition) => {
    setServices(prev => [...prev, newService]);
    addAdminLog(
      'New Service Added',
      'system',
      'success',
      `Admin created new service plan "${newService.title}" at $${newService.basePricePerHour}/hr (min ${newService.minHours}h)`
    );
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    addAdminLog('Service Removed', 'system', 'warning', `Admin removed service plan: ${serviceId}`);
  };

  const updateAddonPrice = (addonId: string, newPrice: number) => {
    const validPrice = Math.max(0, Math.round(newPrice * 100) / 100);
    setAddons(prev => prev.map(a => a.id === addonId ? { ...a, price: validPrice } : a));
    const aName = addons.find(a => a.id === addonId)?.name || addonId;
    addAdminLog(
      'Addon Price Updated',
      'system',
      'info',
      `Admin updated addon "${aName}" price to $${validPrice}`
    );
  };

  const addNewAddon = (newAddon: AddonOption) => {
    setAddons(prev => [...prev, newAddon]);
    addAdminLog(
      'New Addon Created',
      'system',
      'success',
      `Admin created new addon "${newAddon.name}" at $${newAddon.price} (~${newAddon.durationMinutes} mins)`
    );
  };

  const deleteAddon = (addonId: string) => {
    setAddons(prev => prev.filter(a => a.id !== addonId));
    addAdminLog('Addon Removed', 'system', 'warning', `Admin removed addon: ${addonId}`);
  };

  const updateForm = (updates: Partial<BookingFormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const updateCustomer = (updates: Partial<CustomerDetails>) => {
    setForm(prev => ({
      ...prev,
      customer: { ...prev.customer, ...updates }
    }));
  };

  const updateRooms = (roomUpdates: Partial<RoomConfig>) => {
    setForm(prev => ({
      ...prev,
      rooms: { ...prev.rooms, ...roomUpdates }
    }));
  };

  const toggleAddon = (addonId: string) => {
    setForm(prev => {
      const exists = prev.selectedAddons.includes(addonId);
      return {
        ...prev,
        selectedAddons: exists
          ? prev.selectedAddons.filter(id => id !== addonId)
          : [...prev.selectedAddons, addonId]
      };
    });
  };

  const calculateEstimate = (override?: Partial<BookingFormState>): PriceEstimate => {
    const s = { ...form, ...override };
    const service = services.find(srv => srv.id === s.serviceType) || services[0] || CLEANING_SERVICES[0];
    
    let baseHours = 0;
    baseHours += s.rooms.bedrooms * 0.6;
    baseHours += s.rooms.bathrooms * 0.7;
    baseHours += s.rooms.kitchens * 0.8;
    baseHours += s.rooms.livingRooms * 0.5;
    baseHours += s.rooms.extraAreas * 0.4;

    if (s.serviceType === 'deep') baseHours *= 1.4;
    else if (s.serviceType === 'end_of_tenancy') baseHours *= 1.7;
    else if (s.serviceType === 'after_renovation') baseHours *= 1.8;
    else if (s.serviceType === 'airbnb') baseHours *= 1.1;

    baseHours = Math.max(service.minHours, Math.round(baseHours * 2) / 2);

    let addonsCost = 0;
    let addonMinutes = 0;
    s.selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        addonsCost += addon.price;
        addonMinutes += addon.durationMinutes;
      }
    });

    const addonHours = Math.round((addonMinutes / 60) * 2) / 2;
    const totalHours = Math.round((baseHours + addonHours) * 10) / 10;
    const hourlyRate = service.basePricePerHour;
    const rawPrice = (baseHours * hourlyRate) + addonsCost;

    const freqDiscount = FREQUENCY_DISCOUNTS.find(f => f.id === s.frequency);
    const discountPercent = freqDiscount ? freqDiscount.discountPercent : 0;
    const discountAmount = Math.round((rawPrice * (discountPercent / 100)) * 100) / 100;
    const finalPrice = Math.max(0, Math.round((rawPrice - discountAmount) * 100) / 100);

    return {
      baseHours,
      addonHours,
      totalHours,
      hourlyRate,
      rawPrice,
      discountPercent,
      discountAmount,
      finalPrice,
      addonsCost
    };
  };

  const currentEstimate = useMemo(() => {
    return calculateEstimate();
  }, [form, services, addons]);

  // Passwordless login by email
  const loginPasswordless = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    const existingBooking = allBookings.find(b => b.customer.email.toLowerCase() === cleanEmail);

    const userName = existingBooking ? existingBooking.customer.name : cleanEmail.split('@')[0];
    const userPhone = existingBooking ? existingBooking.customer.phone : '';
    const userBookingIds = allBookings
      .filter(b => b.customer.email.toLowerCase() === cleanEmail)
      .map(b => b.id);

    const account: UserAccount = {
      id: `usr-${Date.now()}`,
      name: userName || 'Customer',
      email: cleanEmail,
      phone: userPhone,
      createdAt: new Date().toLocaleDateString(),
      bookings: userBookingIds
    };

    setCurrentUser(account);
    addAdminLog('Passwordless Login', 'auth', 'info', `User ${cleanEmail} logged into customer portal`);

    if (existingBooking) {
      setActiveBooking(existingBooking);
    }
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('landing');
  };

  const submitNewBooking = (): Booking => {
    const estimate = calculateEstimate();
    const service = services.find(s => s.id === form.serviceType) || services[0] || CLEANING_SERVICES[0];
    
    const dynamicTasks: ChecklistTask[] = [
      { id: `k1-${Date.now()}`, room: 'Kitchen', task: 'Sanitize kitchen counters, backsplash & stove', completed: false },
      { id: `k2-${Date.now()}`, room: 'Kitchen', task: 'Polish stainless steel sink & polish chrome fixtures', completed: false },
      { id: `b1-${Date.now()}`, room: 'Bathrooms', task: `Full scrub of ${form.rooms.bathrooms} bathroom(s), mirrors & tiles`, completed: false },
      { id: `bed1-${Date.now()}`, room: 'Bedrooms', task: `Bed making, linen tidy & surface dusting in ${form.rooms.bedrooms} bedroom(s)`, completed: false },
      { id: `l1-${Date.now()}`, room: 'Living Area', task: 'High & low dusting, vacuum rugs & mop hard floors', completed: false },
    ];

    if (form.selectedAddons.includes('oven')) {
      dynamicTasks.push({ id: `ao-${Date.now()}`, room: 'Special Add-ons', task: 'Deep clean inside oven, racks soaked & degreased', completed: false });
    }
    if (form.selectedAddons.includes('fridge')) {
      dynamicTasks.push({ id: `af-${Date.now()}`, room: 'Special Add-ons', task: 'Deep clean inside refrigerator & sanitize all shelves', completed: false });
    }
    if (form.selectedAddons.includes('windows')) {
      dynamicTasks.push({ id: `aw-${Date.now()}`, room: 'Special Add-ons', task: 'Streak-free polish of internal windows & sills', completed: false });
    }

    const assignedCleaner = MOCK_CLEANERS[0];
    const bookingId = `PS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: bookingId,
      createdAt: new Date().toISOString(),
      customer: {
        name: form.customer.name.trim() || 'Valued Customer',
        email: form.customer.email.trim() || 'customer@purespace.app',
        phone: form.customer.phone.trim() || '+1 (555) 000-0000',
        notes: form.customer.notes || form.access.specialInstructions
      },
      serviceType: form.serviceType,
      frequency: form.frequency,
      rooms: { ...form.rooms },
      selectedAddons: [...form.selectedAddons],
      date: form.date,
      timeSlot: form.timeSlot,
      address: { ...form.address },
      access: { ...form.access },
      status: 'confirmed',
      cleaner: assignedCleaner,
      totalPrice: estimate.finalPrice,
      discountAmount: estimate.discountAmount,
      estimatedHours: estimate.totalHours,
      tasks: dynamicTasks,
      beforeAfterPhotos: [
        {
          id: `ba-${Date.now()}`,
          area: 'Kitchen & Living Area',
          beforeUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
          afterUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
          caption: 'Ready for full sparkle service'
        }
      ],
      notes: form.customer.notes || form.access.specialInstructions
    };

    setAllBookings(prev => [newBooking, ...prev]);
    setActiveBooking(newBooking);

    const userAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newBooking.customer.name,
      email: newBooking.customer.email,
      phone: newBooking.customer.phone,
      createdAt: new Date().toLocaleDateString(),
      defaultAddress: `${newBooking.address.street}, ${newBooking.address.postcode}`,
      bookings: [bookingId]
    };
    setCurrentUser(userAccount);

    // Send email to user and admin both
    const emailResults = dispatchBookingEmails(newBooking);
    setSentEmails(prev => [emailResults.customerEmail, emailResults.adminEmail, ...prev]);
    setLastDispatchedEmails(emailResults);

    addAdminLog(
      'New Booking Created',
      'booking',
      'success',
      `Booking #${bookingId} ($${estimate.finalPrice.toFixed(2)}) placed by ${newBooking.customer.name} (${newBooking.customer.email})`
    );

    addAdminLog(
      'Account Auto-Created',
      'auth',
      'info',
      `Auto-generated account for ${newBooking.customer.email}`
    );

    addAdminLog(
      'Customer Email Dispatched',
      'system',
      'success',
      `Confirmation & magic login link sent to ${newBooking.customer.email}`
    );

    addAdminLog(
      'Admin Alert Dispatched',
      'system',
      'info',
      `New booking alert email dispatched to admin@purespace.app for #${bookingId}`
    );

    return newBooking;
  };

  const resetForm = () => {
    setForm(defaultFormState);
  };

  const updateBookingStatus = (idOrStatus: string, maybeStatus?: BookingStatus) => {
    if (maybeStatus) {
      const bookingId = idOrStatus;
      const status = maybeStatus;
      setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      if (activeBooking?.id === bookingId) {
        setActiveBooking(prev => prev ? { ...prev, status } : null);
      }
      addAdminLog('Booking Status Changed', 'booking', 'info', `Booking #${bookingId} status updated to ${status}`);
    } else {
      const status = idOrStatus as BookingStatus;
      if (!activeBooking) return;
      setAllBookings(prev => prev.map(b => b.id === activeBooking.id ? { ...b, status } : b));
      setActiveBooking(prev => prev ? { ...prev, status } : null);
      addAdminLog('Booking Status Changed', 'booking', 'info', `Booking #${activeBooking.id} status updated to ${status}`);
    }
  };

  const assignCleaner = (bookingId: string, cleanerId: string) => {
    const cleaner = MOCK_CLEANERS.find(c => c.id === cleanerId) || MOCK_CLEANERS[0];
    setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, cleaner, status: 'cleaner_assigned' } : b));
    if (activeBooking?.id === bookingId) {
      setActiveBooking(prev => prev ? { ...prev, cleaner, status: 'cleaner_assigned' } : null);
    }
    addAdminLog('Cleaner Assigned', 'cleaner', 'success', `Assigned ${cleaner.name} to #${bookingId}`);
  };

  const cancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelled');
    addAdminLog('Booking Cancelled', 'booking', 'warning', `Booking #${bookingId} was cancelled`);
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newTime: string) => {
    setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, date: newDate, timeSlot: newTime } : b));
    if (activeBooking?.id === bookingId) {
      setActiveBooking(prev => prev ? { ...prev, date: newDate, timeSlot: newTime } : null);
    }
    addAdminLog('Booking Rescheduled', 'booking', 'info', `Booking #${bookingId} rescheduled to ${newDate} (${newTime})`);
  };

  const toggleChecklistTask = (idOrTaskId: string, maybeTaskId?: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (maybeTaskId) {
      const bookingId = idOrTaskId;
      const taskId = maybeTaskId;
      setAllBookings(prev => prev.map(b => {
        if (b.id !== bookingId) return b;
        const updatedTasks = b.tasks.map(t => {
          if (t.id === taskId) {
            const next = !t.completed;
            return { ...t, completed: next, completedAt: next ? nowStr : undefined };
          }
          return t;
        });
        const allCompleted = updatedTasks.every(t => t.completed);
        const nextStatus = allCompleted ? 'completed' : 'in_progress';
        return { ...b, tasks: updatedTasks, status: nextStatus };
      }));

      if (activeBooking?.id === bookingId) {
        setActiveBooking(prev => {
          if (!prev) return null;
          const updatedTasks = prev.tasks.map(t => {
            if (t.id === taskId) {
              const next = !t.completed;
              return { ...t, completed: next, completedAt: next ? nowStr : undefined };
            }
            return t;
          });
          const allCompleted = updatedTasks.every(t => t.completed);
          const nextStatus = allCompleted ? 'completed' : 'in_progress';
          return { ...prev, tasks: updatedTasks, status: nextStatus };
        });
      }
    } else {
      const taskId = idOrTaskId;
      if (!activeBooking) return;
      const updatedTasks = activeBooking.tasks.map(t => {
        if (t.id === taskId) {
          const next = !t.completed;
          return { ...t, completed: next, completedAt: next ? nowStr : undefined };
        }
        return t;
      });
      const allCompleted = updatedTasks.every(t => t.completed);
      const nextStatus = allCompleted ? 'completed' : 'in_progress';
      setActiveBooking({
        ...activeBooking,
        tasks: updatedTasks,
        status: nextStatus
      });
    }
  };

  const tipCleaner = (amount: number) => {
    if (!activeBooking) return;
    setActiveBooking({
      ...activeBooking,
      tipAmount: (activeBooking.tipAmount || 0) + amount
    });
  };

  const submitReview = (rating: number, comment: string) => {
    if (!activeBooking) return;
    setActiveBooking({
      ...activeBooking,
      customerReview: {
        rating,
        comment,
        createdAt: new Date().toLocaleDateString()
      }
    });
  };

  const sendChatMessage = (text: string, sender: 'customer' | 'cleaner' = 'customer') => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender,
      senderName: sender === 'customer' ? 'You' : (activeBooking?.cleaner?.name || 'Cleaner'),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const setActiveTab = (tab: any) => {
    if (tab === 'customer') setActiveView('landing');
    else if (tab === 'cleaner') setActiveView('admin');
  };

  return (
    <BookingContext.Provider
      value={{
        activeView,
        setActiveView,
        activeTab: activeView,
        setActiveTab,
        currency,
        setCurrency,
        currencySymbol,
        formatPrice,
        currentUser,
        loginPasswordless,
        logout,
        allBookings,
        activeBooking,
        setActiveBooking,
        form,
        updateForm,
        updateCustomer,
        updateRooms,
        toggleAddon,
        calculateEstimate,
        currentEstimate,
        submitNewBooking,
        resetForm,
        adminLogs,
        addAdminLog,
        updateBookingStatus,
        assignCleaner,
        cancelBooking,
        rescheduleBooking,
        toggleChecklistTask,
        tipCleaner,
        submitReview,
        sentEmails,
        lastDispatchedEmails,
        services,
        addons,
        updateServicePrice,
        addNewService,
        deleteService,
        updateAddonPrice,
        addNewAddon,
        deleteAddon,
        chatMessages,
        sendChatMessage
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
