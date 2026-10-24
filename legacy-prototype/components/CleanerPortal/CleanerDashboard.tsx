'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { CleanerChatModal } from '../CustomerPortal/CleanerChatModal';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Lock, 
  Dog, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight, 
  Zap,
  TrendingUp,
  CreditCard,
  Sparkles,
  Camera
} from 'lucide-react';
import { BookingStatus } from '@/types/cleaning';

export const CleanerDashboard: React.FC = () => {
  const { 
    activeBooking, 
    toggleChecklistTask, 
    updateBookingStatus, 
    formatPrice,
    setActiveTab
  } = useBooking();

  const [activeTabSub, setActiveTabSub] = useState<'current_job' | 'earnings' | 'available_jobs'>('current_job');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [payoutSuccess, setPayoutSuccess] = useState<boolean>(false);

  const cleaner = activeBooking?.cleaner;
  const completedTasks = activeBooking?.tasks.filter(t => t.completed).length || 0;
  const totalTasks = activeBooking?.tasks.length || 0;

  // Available new jobs for cleaners in the area
  const [availableJobs, setAvailableJobs] = useState([
    {
      id: 'JOB-9021',
      title: 'Move-Out Deep Tenancy Clean',
      area: 'Pacific Heights • 1.8 miles away',
      date: 'Thursday, 9:00 AM',
      payout: 168.00,
      hours: 4.5,
      rooms: '3 Bed, 2 Bath',
      notes: 'Key in concierge. Landlord inspection at 3pm.'
    },
    {
      id: 'JOB-9022',
      title: 'Weekly Maintenance Clean',
      area: 'Noe Valley • 2.4 miles away',
      date: 'Friday, 1:00 PM',
      payout: 89.50,
      hours: 2.5,
      rooms: '2 Bed, 1 Bath',
      notes: 'Client has friendly cat. Eco-supplies provided on site.'
    }
  ]);

  const handleAcceptJob = (jobId: string) => {
    setAvailableJobs(prev => prev.filter(j => j.id !== jobId));
    alert('Job accepted! It has been added to your schedule.');
  };

  const handleInstantPayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3000);
  };

  return (
    <section className="py-8 sm:py-12 bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cleaner Pro Header */}
        <div className="bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={cleaner?.avatar}
                alt={cleaner?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
              />
              <span className={`w-3.5 h-3.5 rounded-full ring-2 ring-slate-800 absolute -bottom-1 -right-1 ${
                isOnline ? 'bg-emerald-400' : 'bg-slate-500'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{cleaner?.name || 'Maria Santos'}</h2>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  TIER 1 PRO
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="flex items-center text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  {cleaner?.rating} Rating
                </span>
                <span>•</span>
                <span>{cleaner?.totalCleans} Cleans</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">100% On-Time</span>
              </div>
            </div>
          </div>

          {/* Quick stats & Status toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Online / Offline switch */}
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border flex items-center gap-2 ${
                isOnline 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isOnline ? 'Status: Active & Accepting' : 'Status: Paused'}</span>
            </button>

            {/* Switch to customer view link */}
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Back to Customer View
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTabSub('current_job')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTabSub === 'current_job'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Active Job & Checklist ({completedTasks}/{totalTasks})
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSub('earnings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTabSub === 'earnings'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Earnings & Instant Payout
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSub('available_jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTabSub === 'available_jobs'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <span>Available Jobs Nearby</span>
            {availableJobs.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {availableJobs.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Current Job & Task Checklist */}
        {activeTabSub === 'current_job' && (
          <div className="space-y-6">
            {activeBooking ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left 8 cols: Checklist & Job Controls */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Job Overview Bar */}
                  <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <h3 className="text-base font-bold text-white">Active Clean: #{activeBooking.id}</h3>
                          <span className="bg-emerald-950 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-800">
                            {activeBooking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeBooking.address.street}, {activeBooking.address.postcode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsChatOpen(true)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat with Client</span>
                        </button>
                      </div>
                    </div>

                    {/* Status Advance Buttons for Cleaner */}
                    <div className="pt-3 border-t border-slate-700/80 flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => updateBookingStatus('on_the_way')}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                          activeBooking.status === 'on_the_way'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                        }`}
                      >
                        1. I&apos;m En Route
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBookingStatus('in_progress')}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                          activeBooking.status === 'in_progress'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                        }`}
                      >
                        2. Arrived & Cleaning Active
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBookingStatus('completed')}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                          activeBooking.status === 'completed'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                            : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                        }`}
                      >
                        3. Mark 100% Completed
                      </button>
                    </div>
                  </div>

                  {/* Cleaner Checklist */}
                  <div className="bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-700 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <div>
                        <h4 className="text-sm font-bold text-white">Interactive Job Checklist</h4>
                        <p className="text-xs text-slate-400">
                          Tap each task as you complete it. Client receives live updates!
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {completedTasks} / {totalTasks} ({Math.round((completedTasks / totalTasks) * 100)}%)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeBooking.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleChecklistTask(task.id)}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                              : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                task.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                  : 'border-slate-500 bg-slate-800'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-xs font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}>
                              {task.task}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.completedAt || task.room}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 4 cols: Access Codes & Earnings Preview */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Access Codes & Customer Notes */}
                  <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Access & Instructions
                    </h4>

                    {activeBooking.access.lockboxCode && (
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">LOCKBOX CODE</span>
                        <span className="text-lg font-bold font-mono tracking-widest text-emerald-400">
                          {activeBooking.access.lockboxCode}
                        </span>
                      </div>
                    )}

                    {activeBooking.access.hasPets && (
                      <div className="p-2.5 bg-amber-950/40 border border-amber-800 rounded-xl text-amber-200 text-xs">
                        <strong>🐾 Pet on premises:</strong> {activeBooking.access.petDetails}
                      </div>
                    )}

                    {activeBooking.notes && (
                      <div className="p-2.5 bg-slate-900 rounded-xl text-xs text-slate-300">
                        <span className="text-slate-400 text-[10px] block font-bold">CLIENT NOTE</span>
                        &quot;{activeBooking.notes}&quot;
                      </div>
                    )}
                  </div>

                  {/* Estimated Payout for this clean */}
                  <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-slate-400">Your Net Payout for this Job</span>
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatPrice(activeBooking.totalPrice * 0.85)}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      85% cleaner payout rate (Highest in the industry vs 50% on older platforms).
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-10">No active job at the moment.</p>
            )}
          </div>
        )}

        {/* Tab 2: Earnings & Instant Payout */}
        {activeTabSub === 'earnings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 cols: Earnings Breakdown */}
            <div className="lg:col-span-8 bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">This Week&apos;s Earnings</h3>
                  <p className="text-xs text-slate-400">Oct 16 - Oct 22 • 14 completed homes</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-400">{formatPrice(1180.50)}</span>
                  <span className="text-[11px] text-emerald-300 block font-semibold">+18% vs last week</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block font-medium">Base Cleans</span>
                  <span className="text-base font-bold text-white mt-1 block">{formatPrice(980.50)}</span>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block font-medium">Customer Tips</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">{formatPrice(200.00)}</span>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block font-medium">Hours Logged</span>
                  <span className="text-base font-bold text-white mt-1 block">34.5 hrs</span>
                </div>
              </div>

              {/* Instant Payout Card */}
              <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    Instant Bank Transfer Available
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Transfer {formatPrice(1180.50)} to your linked Visa Debit (•••• 4129) instantly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInstantPayout}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Withdraw Earnings Now</span>
                </button>
              </div>

              {payoutSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500 rounded-xl text-emerald-300 text-xs text-center font-bold animate-fadeIn">
                  ✓ Transfer initiated! Funds will reflect in your account within 30 seconds.
                </div>
              )}
            </div>

            {/* Right 4 cols: Quality Rating & Achievements */}
            <div className="lg:col-span-4 bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quality Score</h4>
              <div className="text-center py-3 bg-slate-900 rounded-2xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-2xl font-bold text-white block">4.98 / 5.0</span>
                <span className="text-[11px] text-slate-400">Based on 482 customer ratings</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-700/80">
                  <span className="text-slate-400">Reliability Rate:</span>
                  <span className="font-bold text-white">99.8%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-700/80">
                  <span className="text-slate-400">Repeat Client Ratio:</span>
                  <span className="font-bold text-emerald-400">76%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Re-Clean Requests:</span>
                  <span className="font-bold text-white">0 in last 90 days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Available Jobs Nearby */}
        {activeTabSub === 'available_jobs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Open Jobs in Your Neighborhood</h3>
            <p className="text-xs text-slate-400">Claim upcoming cleaning sessions before other pros.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-800 p-5 rounded-3xl border border-slate-700 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          {job.id}
                        </span>
                        <h4 className="text-base font-bold text-white">{job.title}</h4>
                      </div>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {formatPrice(job.payout)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.area}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.date} (~{job.hours} hrs)</span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-700/70">
                      {job.notes}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleAcceptJob(job.id)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Accept & Claim Job</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isChatOpen && <CleanerChatModal onClose={() => setIsChatOpen(false)} />}
    </section>
  );
};
