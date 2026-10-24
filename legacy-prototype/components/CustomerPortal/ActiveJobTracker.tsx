'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { CleanerChatModal } from './CleanerChatModal';
import { TipAndReviewModal } from './TipAndReviewModal';
import { BeforeAfterGallery } from './BeforeAfterGallery';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Heart, 
  Lock, 
  AlertCircle,
  FileCheck,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { BookingStatus } from '@/types/cleaning';

export const ActiveJobTracker: React.FC<{ onBookAnother?: () => void }> = ({ onBookAnother }) => {
  const { 
    activeBooking, 
    toggleChecklistTask, 
    updateBookingStatus, 
    formatPrice,
    setActiveTab
  } = useBooking();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  if (!activeBooking) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Active Cleanings</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You don&apos;t have any active cleanings scheduled right now. Use our 60-second calculator to schedule your first clean!
        </p>
        <button
          type="button"
          onClick={onBookAnother}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Book a Cleaning Now
        </button>
      </div>
    );
  }

  const cleaner = activeBooking.cleaner;
  const completedTasksCount = activeBooking.tasks.filter(t => t.completed).length;
  const totalTasksCount = activeBooking.tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const statuses: { id: BookingStatus; label: string; desc: string }[] = [
    { id: 'confirmed', label: 'Confirmed', desc: 'Booking received' },
    { id: 'cleaner_assigned', label: 'Pro Assigned', desc: 'Cleaner confirmed' },
    { id: 'on_the_way', label: 'En Route', desc: 'Arriving in 12 mins' },
    { id: 'in_progress', label: 'In Progress', desc: 'Cleaning active' },
    { id: 'completed', label: 'Completed', desc: 'Pristine & verified' },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.id === activeBooking.status);

  return (
    <section className="py-8 sm:py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Active Booking Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Live Cleaning Tracker
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                  #{activeBooking.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeBooking.date} • {activeBooking.timeSlot} • {activeBooking.address.street}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-emerald-200"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Cleaner</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Tip & Review</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {statuses.map((st, idx) => {
                const isPassed = currentStatusIndex > idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div
                    key={st.id}
                    onClick={() => updateBookingStatus(st.id)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : isPassed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                    title="Click to simulate cleaner advancing status"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>{st.label}</span>
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      ) : null}
                    </div>
                    <span className={`text-[10px] block mt-0.5 ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {st.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout: Cleaner & Checklist on Left, Access & Before/After on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Cleaner Profile & Room-by-Room Checklist */}
          <div className="lg:col-span-8 space-y-6">
            {/* Cleaner Profile Card */}
            {cleaner && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={cleaner.avatar}
                        alt={cleaner.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{cleaner.name}</h3>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                          CERTIFIED PRO
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <span className="flex items-center text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                          {cleaner.rating}
                        </span>
                        <span>•</span>
                        <span>{cleaner.totalCleans} verified cleans</span>
                        <span>•</span>
                        <span>{cleaner.experienceYears} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat with Maria</span>
                    </button>
                    <a
                      href={`tel:${cleaner.phone}`}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Call cleaner directly"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {cleaner.bio}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cleaner.badges.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Live Interactive Task Checklist */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      Live Room-by-Room Checklist
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Cleaner checks off tasks in real-time as they complete each zone
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {completedTasksCount} / {totalTasksCount} completed ({progressPercent}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Checklist items by Room */}
              <div className="space-y-3">
                {['Kitchen', 'Bathrooms', 'Bedrooms', 'Living Area', 'Special Add-ons'].map((roomName) => {
                  const roomTasks = activeBooking.tasks.filter(t => t.room === roomName);
                  if (roomTasks.length === 0) return null;

                  return (
                    <div key={roomName} className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {roomName}
                      </span>
                      <div className="space-y-1.5">
                        {roomTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => toggleChecklistTask(t.id)}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              t.completed
                                ? 'bg-emerald-50/50 border-emerald-200 text-slate-700'
                                : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                  t.completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <span className={`text-xs font-medium ${t.completed ? 'line-through text-slate-500' : ''}`}>
                                {t.task}
                              </span>
                            </div>

                            {t.completedAt && (
                              <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                                {t.completedAt}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hint */}
              <p className="text-[11px] text-slate-400 italic pt-2">
                Tip: You can tap tasks above to simulate real-time cleaner progress updates!
              </p>
            </div>

            {/* Before & After Photo Proof Gallery */}
            <BeforeAfterGallery photos={activeBooking.beforeAfterPhotos} />
          </div>

          {/* Right Column (4 cols): Property Access, Booking Details & Re-clean Guarantee */}
          <div className="lg:col-span-4 space-y-6">
            {/* Access Code & Key Security Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Access & Security
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ENCRYPTED
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Method</span>
                  <p className="font-bold text-slate-800">
                    {activeBooking.access.accessMethod === 'lockbox'
                      ? 'Lockbox / Key Safe Code'
                      : activeBooking.access.accessMethod === 'home'
                      ? 'Someone is Home'
                      : 'Concierge / Safe Spot'}
                  </p>
                  {activeBooking.access.lockboxCode && (
                    <div className="mt-1 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono font-bold text-slate-900">
                      <span>Code:</span>
                      <span className="text-emerald-700 text-sm tracking-widest">{activeBooking.access.lockboxCode}</span>
                    </div>
                  )}
                </div>

                {activeBooking.access.hasPets && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-[11px] space-y-0.5">
                    <span className="font-bold block">🐾 Pet on Site</span>
                    <p className="text-amber-800">{activeBooking.access.petDetails || 'Dog / Cat present'}</p>
                  </div>
                )}

                {activeBooking.notes && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 text-[11px] space-y-0.5">
                    <span className="font-bold text-slate-900 block">Customer Priority Note</span>
                    <p className="italic text-slate-600">&quot;{activeBooking.notes}&quot;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Guarantee Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-900 block pb-2 border-b border-slate-100">
                Payment & Price Receipt
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Total ({activeBooking.estimatedHours} hrs):</span>
                  <span className="font-bold text-slate-900">{formatPrice(activeBooking.totalPrice)}</span>
                </div>
                {activeBooking.tipAmount && activeBooking.tipAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Tip added for {cleaner?.name}:</span>
                    <span>+{formatPrice(activeBooking.tipAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">
                    {formatPrice(activeBooking.totalPrice + (activeBooking.tipAmount || 0))}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Rate or Tip Cleaner</span>
                </button>
              </div>
            </div>

            {/* Cleaner Partner App Simulator Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Dual-Portal Mode
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Want to see what the cleaner sees on their phone? Switch to the Cleaner Partner Portal to accept jobs, check off tasks, and view earnings.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('cleaner')}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Switch to Cleaner Pro View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isChatOpen && <CleanerChatModal onClose={() => setIsChatOpen(false)} />}
      {isReviewOpen && <TipAndReviewModal onClose={() => setIsReviewOpen(false)} />}
    </section>
  );
};
