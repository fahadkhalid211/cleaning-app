'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  Clock, 
  Activity, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Filter, 
  Search, 
  Download, 
  Sliders, 
  MapPin, 
  Phone, 
  Mail, 
  Zap, 
  TrendingUp, 
  FileText, 
  Send, 
  Eye, 
  Check, 
  Tag, 
  Menu, 
  Star, 
  Award, 
  Layers, 
  ArrowUpRight, 
  ArrowRight, 
  ExternalLink, 
  Settings, 
  Sparkles, 
  X,
  Lock,
  UserCheck
} from 'lucide-react';
import { BookingStatus } from '@/types/cleaning';
import { MOCK_CLEANERS } from '@/data/mockData';
import { EmailDispatchRecord } from '@/services/emailService';
import { AdminSidebar, AdminFeatureTab } from './AdminSidebar';
import { ServicesPricingManager } from './ServicesPricingManager';

export const AdminDashboard: React.FC = () => {
  const { 
    allBookings, 
    adminLogs, 
    addAdminLog, 
    updateBookingStatus, 
    assignCleaner, 
    cancelBooking, 
    formatPrice, 
    setActiveView, 
    sentEmails, 
    services, 
    addons,
    currency,
    setCurrency
  } = useBooking();

  const [currentTab, setCurrentTab] = useState<AdminFeatureTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewAdminEmail, setPreviewAdminEmail] = useState<EmailDispatchRecord | null>(null);

  // Settings State
  const [recleanGuaranteeEnabled, setRecleanGuaranteeEnabled] = useState(true);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(true);
  const [smsArrivalAlertsEnabled, setSmsArrivalAlertsEnabled] = useState(true);

  // Calculate platform stats
  const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalPrice, 0) + 42740;
  const inProgressCount = allBookings.filter(b => b.status === 'in_progress').length;
  const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length;
  const completedCount = allBookings.filter(b => b.status === 'completed').length + 328;
  const totalBookingsCount = allBookings.length + 347;

  // Filtered bookings
  const filteredBookings = allBookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.street.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered logs
  const filteredLogs = adminLogs.filter(log => {
    if (logFilter === 'all') return true;
    return log.category === logFilter;
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
  };

  const handleAssignCleaner = (bookingId: string, cleanerId: string) => {
    assignCleaner(bookingId, cleanerId);
  };

  const handleExportCSV = () => {
    alert('Exporting booking and financial records to PureSpace-Platform-Report.csv...');
  };

  const getTabTitle = (tab: AdminFeatureTab) => {
    switch (tab) {
      case 'overview': return 'Overview & Analytics';
      case 'bookings': return 'Bookings & Dispatch Center';
      case 'cleaners': return 'Verified Cleaners & Pros';
      case 'pricing': return 'Service Plans & Hourly Pricing';
      case 'addons': return 'Addons & Extras Catalog';
      case 'emails': return 'Outbound Email Notifications';
      case 'logs': return 'Platform Audit & Event Logs';
      case 'settings': return 'Platform Settings & Policies';
      default: return 'Admin Console';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col lg:flex-row antialiased font-sans">
      {/* Sleek Light Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 sticky top-0 z-20 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">PureSpace Console /</span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {getTabTitle(currentTab)}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">
                {getTabTitle(currentTab)}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </span>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('landing')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-1"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Dynamic Main Tab Content Area */}
        <main className="p-4 sm:p-8 space-y-6 flex-1 text-left">
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {currentTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Executive Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gross Volume */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Gross Platform Volume</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{formatPrice(totalRevenue)}</div>
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +14.2% vs last month
                  </p>
                </div>

                {/* Active Jobs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Live Cleans In Progress</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 tracking-tight flex items-center gap-2 tabular-nums">
                    <span>{inProgressCount} active</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    {confirmedCount} confirmed awaiting dispatch
                  </p>
                </div>

                {/* Total Cleans */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Total Cleans (Oct)</span>
                    <Calendar className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{totalBookingsCount}</div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    99.4% on-time cleaner arrival
                  </p>
                </div>

                {/* Customer Satisfaction */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Customer CSAT Rating</span>
                    <Users className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600 tracking-tight tabular-nums">4.96 / 5.0</div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Based on 480+ verified reviews
                  </p>
                </div>
              </div>

              {/* 2-Column Overview Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left (8 cols): Recent Bookings Preview */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Recent Customer Bookings</h3>
                      <p className="text-xs text-slate-500">Latest reservations across all service plans</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('bookings')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>View All ({allBookings.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500">
                          <th className="pb-3 font-semibold">Booking ID</th>
                          <th className="pb-3 font-semibold">Customer</th>
                          <th className="pb-3 font-semibold">Date & Window</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allBookings.slice(0, 4).map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 font-mono font-medium text-emerald-800">{b.id}</td>
                            <td className="py-3">
                              <span className="font-semibold text-slate-900 block">{b.customer.name}</span>
                              <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">{b.customer.email}</span>
                            </td>
                            <td className="py-3">
                              <span className="font-medium text-slate-800 block">{b.date}</span>
                              <span className="text-[11px] text-slate-500 block">{b.timeSlot}</span>
                            </td>
                            <td className="py-3">
                              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                b.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : b.status === 'in_progress'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : b.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}>
                                {b.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 text-right font-semibold text-slate-900 tabular-nums">
                              {formatPrice(b.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right (4 cols): Operations Quick Card */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Outbound Email Quick Stat */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-sky-600" />
                        <h4 className="text-xs font-semibold text-slate-900">Email Dispatches</h4>
                      </div>
                      <span className="text-[10px] font-medium bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                        {sentEmails.length} Sent
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      Instant customer confirmation receipts & admin alerts are delivered automatically on every booking.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('emails')}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Sent Emails</span>
                    </button>
                  </div>

                  {/* Cleaners Health Quick Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-semibold text-slate-900">Cleaner Pool</h4>
                      </div>
                      <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        100% Verified
                      </span>
                    </div>
                    <div className="space-y-2">
                      {MOCK_CLEANERS.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{c.name}</span>
                          <span className="text-amber-600 font-bold flex items-center gap-0.5">
                            ★ {c.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('cleaners')}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <span>Manage Cleaners</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS & DISPATCH */}
          {currentTab === 'bookings' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">All Platform Bookings</h3>
                    <p className="text-xs text-slate-500">Dispatch pros, advance live cleaning stages & manage customer reservations</p>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {['all', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          statusFilter === st
                            ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' ? 'All' : st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Booking ID, customer name, email address, or street..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-normal"
                  />
                </div>

                {/* Bookings Table */}
                <div className="overflow-x-auto no-scrollbar border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 font-semibold">Booking Details</th>
                        <th className="p-3.5 font-semibold">Customer Contact</th>
                        <th className="p-3.5 font-semibold">Cleaning Address</th>
                        <th className="p-3.5 font-semibold">Assigned Pro</th>
                        <th className="p-3.5 font-semibold">Total Price</th>
                        <th className="p-3.5 font-semibold text-right">Actions & Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-normal">
                            No bookings match the search or filter query.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3.5">
                              <span className="font-mono font-semibold text-emerald-800 text-xs block">
                                #{b.id}
                              </span>
                              <span className="text-[11px] text-slate-700 block font-medium">
                                {b.date}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {b.timeSlot}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-slate-900 block">{b.customer.name}</span>
                              <span className="text-[11px] text-slate-500 block font-mono">{b.customer.email}</span>
                              <span className="text-[10px] text-slate-500 block">{b.customer.phone}</span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-medium text-slate-800 block truncate max-w-[170px]">{b.address.street}</span>
                              <span className="text-[11px] text-slate-500 block">{b.address.city}, {b.address.postcode}</span>
                              {b.access.lockboxCode && (
                                <span className="text-[10px] text-emerald-700 font-mono font-medium block">
                                  Lockbox: {b.access.lockboxCode}
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <select
                                value={b.cleaner?.id || ''}
                                onChange={(e) => handleAssignCleaner(b.id, e.target.value)}
                                className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {MOCK_CLEANERS.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ({c.rating}★)
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-3.5">
                              <span className="text-sm font-semibold text-slate-900 block tabular-nums">
                                {formatPrice(b.totalPrice)}
                              </span>
                              <span className="text-[10px] text-slate-500 block tabular-nums">
                                Net: {formatPrice(b.totalPrice * 0.85)}
                              </span>
                            </td>

                            <td className="p-3.5 text-right space-y-1">
                              {b.status === 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b.id, 'in_progress')}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-medium shadow-xs transition-colors"
                                >
                                  Start Clean
                                </button>
                              )}
                              {b.status === 'in_progress' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b.id, 'completed')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium shadow-xs transition-colors"
                                >
                                  Mark Complete
                                </button>
                              )}
                              {b.status === 'completed' && (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  ✓ Completed
                                </span>
                              )}
                              {b.status !== 'cancelled' && b.status !== 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => cancelBooking(b.id)}
                                  className="block text-[10px] text-rose-600 hover:text-rose-800 font-medium ml-auto pt-1"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLEANERS & PROS DIRECTORY */}
          {currentTab === 'cleaners' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Verified Cleaning Specialists</h3>
                  <p className="text-xs text-slate-500">5-star vetted home service professionals assigned to platform jobs</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    3 Pros Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_CLEANERS.map((cleaner) => (
                  <div
                    key={cleaner.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={cleaner.avatar}
                          alt={cleaner.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{cleaner.name}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                            <span>★ {cleaner.rating}</span>
                            <span className="text-slate-400 font-normal">({cleaner.totalCleans} cleans)</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal">
                            {cleaner.experienceYears} Years Residential Exp.
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-normal">
                        {cleaner.bio}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cleaner.badges.map((b, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1 font-normal">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Background Checked</span>
                        </span>
                        <span className="font-semibold text-emerald-700">Verified</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                        <span>Direct Contact:</span>
                        <span className="font-semibold text-slate-700">{cleaner.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SERVICE PLANS & HOURLY PRICING */}
          {currentTab === 'pricing' && (
            <div className="space-y-6 animate-fadeIn">
              <ServicesPricingManager filterMode="services" />
            </div>
          )}

          {/* TAB 5: ADDONS & EXTRAS CATALOG */}
          {currentTab === 'addons' && (
            <div className="space-y-6 animate-fadeIn">
              <ServicesPricingManager filterMode="addons" />
            </div>
          )}

          {/* TAB 6: OUTBOUND EMAILS */}
          {currentTab === 'emails' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Outbound Email Notifications</h3>
                  <p className="text-xs text-slate-500">Audit logs of customer confirmation receipts & admin dispatch alerts</p>
                </div>
                <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  {sentEmails.length} Emails Sent
                </span>
              </div>

              {sentEmails.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Send className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">No Emails Dispatched Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
                    Once a user confirms a booking on the website, customer receipts and admin notifications are logged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentEmails.map((email) => (
                      <div
                        key={email.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                              email.type === 'customer_confirmation'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-purple-50 text-purple-800 border border-purple-200'
                            }`}>
                              {email.type === 'customer_confirmation' ? 'Customer Receipt' : 'Admin Operations Alert'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{email.sentAt}</span>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-900 truncate">{email.subject}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">Recipient: {email.to}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewAdminEmail(previewAdminEmail?.id === email.id ? null : email)}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{previewAdminEmail?.id === email.id ? 'Hide Preview' : 'Inspect HTML Template'}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Rendered HTML Email Preview */}
                  {previewAdminEmail && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-lg space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Email Inspection Preview</span>
                          <h4 className="text-sm font-semibold text-slate-900">{previewAdminEmail.subject}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewAdminEmail(null)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100"
                        >
                          Close Preview ✕
                        </button>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-h-96 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: previewAdminEmail.htmlContent }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PLATFORM AUDIT LOGS */}
          {currentTab === 'logs' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">System Audit & Event Logs</h3>
                    <p className="text-xs text-slate-500">Live operational ledger of all events, pricing adjustments, and bookings</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-medium">
                    {filteredLogs.length} Events Logged
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'booking', 'auth', 'system', 'cleaner', 'payment'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLogFilter(cat)}
                      className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                        logFilter === cat
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-medium'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Event Logs Stream */}
                <div className="space-y-2.5 max-h-[550px] overflow-y-auto no-scrollbar pt-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          log.category === 'booking'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : log.category === 'auth'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : log.category === 'system'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : log.category === 'cleaner'
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {log.event}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug font-normal">{log.details}</p>
                    </div>
                  ))}
                </div>

                {/* Health Check Button */}
                <button
                  type="button"
                  onClick={() => addAdminLog('System Health Check', 'system', 'info', 'All operational microservices healthy • Ping 12ms')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Execute Platform Health Ping</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: PLATFORM SETTINGS & POLICIES */}
          {currentTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn max-w-4xl">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Platform Settings & Operational Policies</h3>
                  <p className="text-xs text-slate-500">Configure global parameters, currencies, and satisfaction guarantees</p>
                </div>

                {/* Currency Selection */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-xs font-semibold text-slate-900 block">Platform Billing Currency</label>
                  <p className="text-[11px] text-slate-500">Choose the standard currency displayed to customers across the portal.</p>
                  <div className="flex gap-2 pt-1">
                    {(['USD', 'GBP', 'EUR'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          currency === c
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {c === 'USD' ? '$ USD (United States)' : c === 'GBP' ? '£ GBP (United Kingdom)' : '€ EUR (Europe)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  {/* Re-Clean Guarantee */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">72-Hour Free Re-Clean Guarantee</h4>
                      <p className="text-[11px] text-slate-500">Offers customers a complimentary re-clean if any area does not meet expectations.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecleanGuaranteeEnabled(!recleanGuaranteeEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${recleanGuaranteeEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${recleanGuaranteeEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Auto-Dispatch */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Automated Smart Pro Dispatch</h4>
                      <p className="text-[11px] text-slate-500">Automatically assign the nearest top-rated cleaner upon booking confirmation.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoDispatchEnabled(!autoDispatchEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${autoDispatchEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoDispatchEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* SMS Arrival Alerts */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">SMS Arrival Window Notifications</h4>
                      <p className="text-[11px] text-slate-500">Send automatic SMS updates to the customer when the cleaner is en route.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmsArrivalAlertsEnabled(!smsArrivalAlertsEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${smsArrivalAlertsEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${smsArrivalAlertsEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Liability Insurance Banner */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">$2,000,000 Public Liability Insurance Policy</span>
                    <span className="text-[11px] text-emerald-700">All cleaners and properties are automatically covered under the PureSpace Master Commercial Policy #PS-88492.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
