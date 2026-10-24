'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  MessageSquare, 
  FileText, 
  Home, 
  Plus, 
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { BookingStatus } from '@/types/cleaning';
import { CleanerChatModal } from './CleanerChatModal';

export const CustomerDashboard: React.FC<{ onBookNewClean: () => void }> = ({ onBookNewClean }) => {
  const { 
    currentUser, 
    logout, 
    allBookings, 
    activeBooking,
    setActiveBooking,
    cancelBooking,
    rescheduleBooking,
    toggleChecklistTask,
    formatPrice,
    setActiveView
  } = useBooking();

  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'profile'>('current');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [rescheduleModalId, setRescheduleModalId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('Friday, Oct 24');
  const [newTime, setNewTime] = useState('Morning (8:00 AM - 11:00 AM)');

  // Filter bookings for this user if logged in, or show all for demo
  const userBookings = currentUser
    ? allBookings.filter(b => b.customer.email.toLowerCase() === currentUser.email.toLowerCase())
    : allBookings;

  const currentJob = activeBooking || userBookings[0];

  const handleReschedule = (bookingId: string) => {
    rescheduleBooking(bookingId, newDate, newTime);
    setRescheduleModalId(null);
    alert(`Your booking has been rescheduled to ${newDate} (${newTime})!`);
  };

  const completedCount = currentJob?.tasks.filter(t => t.completed).length || 0;
  const totalCount = currentJob?.tasks.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statuses: { id: BookingStatus; label: string; desc: string }[] = [
    { id: 'confirmed', label: 'Confirmed', desc: 'Booking received' },
    { id: 'cleaner_assigned', label: 'Pro Assigned', desc: 'Top cleaner matched' },
    { id: 'on_the_way', label: 'En Route', desc: 'Cleaner arriving soon' },
    { id: 'in_progress', label: 'In Progress', desc: 'Active in your home' },
    { id: 'completed', label: 'Completed', desc: '100% spotless & verified' },
  ];

  const currentStatusIndex = currentJob ? statuses.findIndex(s => s.id === currentJob.status) : 0;

  return (
    <section className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Dashboard Top Header Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Welcome, {currentUser?.name || 'Valued Customer'}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  CUSTOMER PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in via passwordless email: <strong className="text-slate-800 font-medium">{currentUser?.email || 'emma@example.com'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onBookNewClean}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book New Clean</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'current'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 font-medium'
            }`}
          >
            Active & Upcoming Bookings ({userBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 font-medium'
            }`}
          >
            Past Cleans & Invoices
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 font-medium'
            }`}
          >
            My Preferences
          </button>
        </div>

        {/* TAB 1: Current & Active Bookings */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {currentJob ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left 8 Cols: Job Card & Live Room Checklist */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Status Banner Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h3 className="text-lg font-bold text-slate-900">
                            Booking #{currentJob.id}
                          </h3>
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            {currentJob.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {currentJob.date} • {currentJob.timeSlot}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRescheduleModalId(currentJob.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelBooking(currentJob.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-rose-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    {/* Stepper Progress */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {statuses.map((st, idx) => {
                        const isPassed = currentStatusIndex > idx;
                        const isCurrent = currentStatusIndex === idx;

                        return (
                          <div
                            key={st.id}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isCurrent
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : isPassed
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span>{st.label}</span>
                              {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <span className={`text-[10px] block mt-0.5 ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                              {st.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room-by-Room Checklist Progress */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Live Room-by-Room Checklist</h4>
                        <p className="text-xs text-slate-500 font-normal">Cleaner checks off each task in real time</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {completedCount} / {totalCount} completed ({progressPercent}%)
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-2 pt-2">
                      {currentJob.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleChecklistTask(currentJob.id, task.id)}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-700'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                task.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-xs font-medium ${task.completed ? 'line-through text-slate-500' : ''}`}>
                              {task.task}
                            </span>
                          </div>
                          {task.completedAt && (
                            <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {task.completedAt}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Address, Lockbox, & Receipt */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Address & Access Card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
                    <span className="text-xs font-semibold text-slate-900 block pb-2 border-b border-slate-100">
                      Cleaning Location & Access
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900">{currentJob.address.street}</p>
                          <p className="text-slate-500">{currentJob.address.postcode}</p>
                        </div>
                      </div>

                      {currentJob.access.lockboxCode && (
                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                          <span className="text-[10px] font-semibold text-emerald-800 block">LOCKBOX ACCESS CODE</span>
                          <span className="text-base font-semibold font-mono tracking-widest text-emerald-900">
                            {currentJob.access.lockboxCode}
                          </span>
                        </div>
                      )}

                      {currentJob.customer.notes && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 text-xs">
                          <span className="text-slate-400 text-[10px] font-semibold block">SPECIAL INSTRUCTIONS</span>
                          &quot;{currentJob.customer.notes}&quot;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Receipt Summary */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
                    <span className="text-xs font-semibold text-slate-900 block pb-2 border-b border-slate-100">
                      Order Summary
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Due on Completion:</span>
                        <span className="font-bold text-slate-900">{formatPrice(currentJob.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Insurance & Protection:</span>
                        <span className="text-emerald-700 font-semibold">Included Free</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message Cleaner</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <p className="text-sm text-slate-500">You don&apos;t have any active cleanings right now.</p>
                <button
                  type="button"
                  onClick={onBookNewClean}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Book Your First Clean
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Past Cleans & Invoices */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Completed Cleans & Invoices</h3>
            <div className="divide-y divide-slate-100">
              {allBookings.map((b) => (
                <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">#{b.id}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-700">{b.date}</span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md uppercase">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal">
                      {b.rooms.bedrooms} Bed, {b.rooms.bathrooms} Bath • {b.address.street}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{formatPrice(b.totalPrice)}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading official PDF receipt for #${b.id}...`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                    >
                      Receipt PDF
                    </button>
                    <button
                      type="button"
                      onClick={onBookNewClean}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                    >
                      Re-Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Preferences */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Account & Cleaning Preferences</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Saved Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || 'Customer'}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Registered Email (Passwordless ID)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || 'customer@purespace.app'}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Registered Phone</label>
                <input
                  type="tel"
                  disabled
                  value={currentUser?.phone || '+1 (555) 234-5678'}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-semibold text-slate-900">Reschedule Booking</h4>
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Select New Date</label>
              <select
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Friday, Oct 24">Friday, Oct 24</option>
                <option value="Saturday, Oct 25">Saturday, Oct 25</option>
                <option value="Sunday, Oct 26">Sunday, Oct 26</option>
                <option value="Monday, Oct 27">Monday, Oct 27</option>
              </select>

              <label className="block font-bold text-slate-700 pt-1">Select Time Window</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Morning (8:00 AM - 11:00 AM)">Morning (8:00 AM - 11:00 AM)</option>
                <option value="Midday (11:00 AM - 2:00 PM)">Midday (11:00 AM - 2:00 PM)</option>
                <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleReschedule(rescheduleModalId)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm New Date
              </button>
              <button
                type="button"
                onClick={() => setRescheduleModalId(null)}
                className="py-2.5 px-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isChatOpen && <CleanerChatModal onClose={() => setIsChatOpen(false)} />}
    </section>
  );
};
