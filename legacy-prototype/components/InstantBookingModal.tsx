'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useBooking } from '@/context/BookingContext';
import { 
  X, 
  Calendar, 
  MapPin, 
  Lock, 
  Home, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  User,
  Mail,
  Phone,
  FileText,
  Clock,
  Check,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { CLEANING_SERVICES, FREQUENCY_DISCOUNTS } from '@/data/services';

interface CalendarDateItem {
  val: string;
  dayOfWeek: string;
  dayNumber: number;
  month: string;
}

const UPCOMING_CALENDAR_DATES: CalendarDateItem[] = [
  { val: 'Thursday, Oct 23', dayOfWeek: 'Thu', dayNumber: 23, month: 'Oct' },
  { val: 'Friday, Oct 24', dayOfWeek: 'Fri', dayNumber: 24, month: 'Oct' },
  { val: 'Saturday, Oct 25', dayOfWeek: 'Sat', dayNumber: 25, month: 'Oct' },
  { val: 'Sunday, Oct 26', dayOfWeek: 'Sun', dayNumber: 26, month: 'Oct' },
  { val: 'Monday, Oct 27', dayOfWeek: 'Mon', dayNumber: 27, month: 'Oct' },
  { val: 'Tuesday, Oct 28', dayOfWeek: 'Tue', dayNumber: 28, month: 'Oct' },
  { val: 'Wednesday, Oct 29', dayOfWeek: 'Wed', dayNumber: 29, month: 'Oct' },
  { val: 'Thursday, Oct 30', dayOfWeek: 'Thu', dayNumber: 30, month: 'Oct' },
  { val: 'Friday, Oct 31', dayOfWeek: 'Fri', dayNumber: 31, month: 'Oct' },
  { val: 'Saturday, Nov 1', dayOfWeek: 'Sat', dayNumber: 1, month: 'Nov' },
  { val: 'Sunday, Nov 2', dayOfWeek: 'Sun', dayNumber: 2, month: 'Nov' },
  { val: 'Monday, Nov 3', dayOfWeek: 'Mon', dayNumber: 3, month: 'Nov' },
  { val: 'Tuesday, Nov 4', dayOfWeek: 'Tue', dayNumber: 4, month: 'Nov' },
  { val: 'Wednesday, Nov 5', dayOfWeek: 'Wed', dayNumber: 5, month: 'Nov' },
  { val: 'Thursday, Nov 6', dayOfWeek: 'Thu', dayNumber: 6, month: 'Nov' },
  { val: 'Friday, Nov 7', dayOfWeek: 'Fri', dayNumber: 7, month: 'Nov' },
  { val: 'Saturday, Nov 8', dayOfWeek: 'Sat', dayNumber: 8, month: 'Nov' },
  { val: 'Sunday, Nov 9', dayOfWeek: 'Sun', dayNumber: 9, month: 'Nov' },
  { val: 'Monday, Nov 10', dayOfWeek: 'Mon', dayNumber: 10, month: 'Nov' },
  { val: 'Tuesday, Nov 11', dayOfWeek: 'Tue', dayNumber: 11, month: 'Nov' },
  { val: 'Wednesday, Nov 12', dayOfWeek: 'Wed', dayNumber: 12, month: 'Nov' }
];

interface InstantBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InstantBookingModal: React.FC<InstantBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    form, 
    updateForm, 
    updateCustomer,
    currentEstimate, 
    formatPrice, 
    submitNewBooking,
    setActiveView,
    lastDispatchedEmails,
    services
  } = useBooking();

  const [step, setStep] = useState<'details' | 'success'>('details');
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  const [previewEmailType, setPreviewEmailType] = useState<'customer' | 'admin' | null>(null);
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  const scrollCalendar = (direction: 'left' | 'right') => {
    if (calendarScrollRef.current) {
      calendarScrollRef.current.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth'
      });
    }
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [year, month, day] = val.split('-').map(Number);
    const picked = new Date(year, month - 1, day);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = `${dayNames[picked.getDay()]}, ${monthNames[picked.getMonth()]} ${day}`;
    updateForm({ date: formatted });
  };

  if (!isOpen) return null;

  const timeSlots = [
    { label: 'Morning', time: '8:00 AM - 11:00 AM' },
    { label: 'Midday', time: '11:00 AM - 2:00 PM' },
    { label: 'Afternoon', time: '2:00 PM - 5:00 PM' },
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = submitNewBooking();
    setCreatedBookingId(newBooking.id);
    setStep('success');

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  const service = services.find(s => s.id === form.serviceType) || services[0] || CLEANING_SERVICES[0];
  const freq = FREQUENCY_DISCOUNTS.find(f => f.id === form.frequency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      {/* 80% Wide Modal on Laptop/Desktop */}
      <div className="bg-white rounded-3xl w-full max-w-5xl lg:w-[82%] xl:max-w-6xl p-5 sm:p-8 shadow-2xl border border-slate-200/90 text-left relative animate-scaleUp my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'details' ? (
          <form onSubmit={handleConfirm} className="space-y-6">
            {/* Modal Header */}
            <div className="pb-4 border-b border-slate-100 pr-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Quick Checkout • 30 Seconds
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 hidden sm:inline">Pay only after cleaning is complete</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Complete Your Home Cleaning Booking
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {service.title} • {form.rooms.bedrooms} Bed, {form.rooms.bathrooms} Bath • {freq?.label}
              </p>
            </div>

            {/* Clean 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column (7 cols): Schedule, Location & Key Access */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Date & Time Selection with Interactive Calendar Row */}
                <div className="space-y-3 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      1. Choose Date & Arrival Time
                    </label>
                    <div className="flex items-center gap-1">
                      {/* Custom Date Picker Shortcut */}
                      <label className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-2 py-0.5 rounded-lg cursor-pointer border border-emerald-200 transition-colors flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        <span>Pick Custom Date</span>
                        <input
                          type="date"
                          className="sr-only"
                          onChange={handleCustomDateChange}
                        />
                      </label>
                      {/* Scroll Navigation */}
                      <button
                        type="button"
                        onClick={() => scrollCalendar('left')}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 shadow-2xs transition-colors"
                        title="Previous dates"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCalendar('right')}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 shadow-2xs transition-colors"
                        title="Next dates"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Calendar Date Row (3 Weeks) */}
                  <div
                    ref={calendarScrollRef}
                    className="flex gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar select-none"
                  >
                    {UPCOMING_CALENDAR_DATES.map((d, i) => {
                      const isSelected = form.date === d.val || form.date.includes(d.val);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => updateForm({ date: d.val })}
                          className={`shrink-0 w-14 sm:w-16 py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[62px] cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm font-semibold ring-2 ring-emerald-400/40'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                          }`}
                        >
                          <span className={`text-[10px] font-medium uppercase tracking-wider block ${
                            isSelected ? 'text-emerald-100' : 'text-slate-400'
                          }`}>
                            {d.dayOfWeek}
                          </span>
                          <span className="text-sm sm:text-base font-semibold leading-none my-1 block tabular-nums">
                            {d.dayNumber}
                          </span>
                          <span className={`text-[10px] font-medium block ${
                            isSelected ? 'text-emerald-100' : 'text-slate-400'
                          }`}>
                            {d.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Selected Date Confirmation Strip */}
                  <div className="bg-emerald-50/80 rounded-xl px-3 py-1.5 border border-emerald-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-700">
                      Scheduled: <strong className="text-emerald-950 font-semibold">{form.date}</strong>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Cleaner Arrival Guaranteed
                    </span>
                  </div>

                  {/* Arrival Time Slots */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-600 block">Arrival Window:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {timeSlots.map((slot, i) => {
                        const isSelected = form.timeSlot.includes(slot.time);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => updateForm({ timeSlot: `${slot.label} (${slot.time})` })}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500/30'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xs block font-bold text-slate-900">{slot.label}</span>
                            <span className="text-[11px] text-slate-500 block">{slot.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Cleaning Address */}
                <div className="space-y-2.5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    2. Cleaning Address & Postcode
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        value={form.address.street}
                        onChange={(e) => updateForm({ address: { ...form.address, street: e.target.value } })}
                        placeholder="Street Address (e.g. 742 Evergreen Terrace)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={form.address.postcode}
                        onChange={(e) => updateForm({ address: { ...form.address, postcode: e.target.value } })}
                        placeholder="ZIP / Postcode"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Key Access Instructions */}
                <div className="space-y-2.5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    3. How Should the Cleaner Enter?
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateForm({ access: { ...form.access, accessMethod: 'home' } })}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        form.access.accessMethod === 'home'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block text-slate-900">Someone is Home</span>
                        <span className="text-[10px] text-slate-500">You will greet cleaner</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateForm({ access: { ...form.access, accessMethod: 'lockbox' } })}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        form.access.accessMethod === 'lockbox'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block text-slate-900">Key in Lockbox</span>
                        <span className="text-[10px] text-slate-500">Safe / code access</span>
                      </div>
                    </button>
                  </div>

                  {form.access.accessMethod === 'lockbox' && (
                    <div className="pt-1 animate-fadeIn">
                      <input
                        type="text"
                        value={form.access.lockboxCode || ''}
                        onChange={(e) => updateForm({ access: { ...form.access, lockboxCode: e.target.value } })}
                        placeholder="Enter 4-digit lockbox code (e.g. 4821)"
                        className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols): Contact & Account Details + Summary */}
              <div className="lg:col-span-5 space-y-5">
                {/* Contact Details */}
                <div className="space-y-3 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    Your Contact Information
                  </label>

                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={form.customer.name}
                        onChange={(e) => updateCustomer({ name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number (For arrival SMS)</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={form.customer.phone}
                        onChange={(e) => updateCustomer({ phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email (For passwordless portal login)</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={form.customer.email}
                        onChange={(e) => updateCustomer({ email: e.target.value })}
                        placeholder="sarah@example.com"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Notes / Special Instructions */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Special Instructions (Optional)</label>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <textarea
                        rows={2}
                        value={form.customer.notes || ''}
                        onChange={(e) => updateCustomer({ notes: e.target.value })}
                        placeholder="e.g. Focus on bathroom shower glass; small cat will be in living room."
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary & Pricing Card */}
                <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200/90 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-200/70">
                    <span className="font-bold text-slate-900">{service.title}</span>
                    <span className="font-mono text-emerald-800 font-bold">~{currentEstimate.totalHours} hrs</span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Room Configuration:</span>
                      <span className="font-semibold text-slate-800">{form.rooms.bedrooms} Bed, {form.rooms.bathrooms} Bath</span>
                    </div>
                    {currentEstimate.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>{freq?.label} Savings ({currentEstimate.discountPercent}%):</span>
                        <span>-{formatPrice(currentEstimate.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Public Liability Insurance:</span>
                      <span className="text-emerald-700 font-semibold">Included ($2M)</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="pt-2 border-t border-emerald-200/70 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Total Due on Completion</span>
                      <span className="text-[10px] text-slate-500">Zero upfront charge</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 text-emerald-800 tabular-nums">
                      {formatPrice(currentEstimate.finalPrice)}
                    </span>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition-all tracking-wide"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>72-Hour Free Re-Clean Guarantee • Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* Confirmation & Success Screen */
          <div className="py-4 text-center space-y-4 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block font-mono">
                Booking #{createdBookingId} Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Booking Confirmed!</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Your passwordless account is active and booking details have been dispatched.
              </p>
            </div>

            {/* Email Notifications Dispatched Status Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Dispatched Notifications (2 Emails Sent)
                    </h4>
                    <p className="text-[11px] text-slate-500">Sent instantly to customer and platform administrator</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Delivered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* 1. Customer Email */}
                <div className={`p-3 rounded-xl border transition-all ${
                  previewEmailType === 'customer' 
                    ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400' 
                    : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">User Email</span>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[170px] sm:max-w-[200px]">
                          {form.customer.email || 'customer@example.com'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewEmailType(previewEmailType === 'customer' ? null : 'customer')}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100/60 hover:bg-emerald-100"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{previewEmailType === 'customer' ? 'Hide' : 'Preview'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    Includes full receipt, scheduled date ({form.date}), 72h guarantee & passwordless magic login link.
                  </p>
                </div>

                {/* 2. Admin Email */}
                <div className={`p-3 rounded-xl border transition-all ${
                  previewEmailType === 'admin' 
                    ? 'bg-slate-900 text-white border-slate-700 ring-1 ring-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${previewEmailType === 'admin' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Admin Alert
                        </span>
                        <p className={`text-xs font-bold truncate max-w-[170px] sm:max-w-[200px] ${previewEmailType === 'admin' ? 'text-white' : 'text-slate-900'}`}>
                          admin@purespace.app
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewEmailType(previewEmailType === 'admin' ? null : 'admin')}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                        previewEmailType === 'admin'
                          ? 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{previewEmailType === 'admin' ? 'Hide' : 'Preview'}</span>
                    </button>
                  </div>
                  <p className={`text-[11px] mt-2 line-clamp-2 ${previewEmailType === 'admin' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Includes customer contact, job address, notes, gross revenue & cleaner payout calculation.
                  </p>
                </div>
              </div>

              {/* Render Selected Email Preview */}
              {previewEmailType && lastDispatchedEmails && (
                <div className="mt-3 pt-3 border-t border-slate-200 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      Live Dispatched Email: {previewEmailType === 'customer' ? 'Customer Confirmation Receipt' : 'Admin Operations Alert'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewEmailType(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold"
                    >
                      Close Preview ✕
                    </button>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-300 max-h-56 overflow-y-auto shadow-inner text-xs">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: previewEmailType === 'customer' 
                          ? lastDispatchedEmails.customerEmail.htmlContent 
                          : lastDispatchedEmails.adminEmail.htmlContent 
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps Info */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Upfront Charge • Pay on Completion</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Your 5-star pro has been assigned for <strong>{form.date} ({form.timeSlot})</strong>. You can check the live progress checklist, chat with the cleaner, or reschedule anytime directly from your customer portal.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('portal');
                }}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Go to Customer Dashboard & Status Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('admin');
                }}
                className="py-3 px-4 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>View Admin Center</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
