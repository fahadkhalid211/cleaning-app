'use client';

import React, { useState } from 'react';
import { useBooking, Currency, AppView } from '@/context/BookingContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  User, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  Home
} from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenBooking,
  onOpenLogin
}) => {
  const { 
    activeView, 
    setActiveView, 
    currency, 
    setCurrency, 
    currentUser 
  } = useBooking();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs transition-all">
      {/* Top Value Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-[11px] sm:text-xs py-1.5 px-3 text-center font-medium flex items-center justify-center gap-2 sm:gap-3">
        <span className="inline-flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
          100% Happiness Guarantee
        </span>
        <span className="text-emerald-200">•</span>
        <span className="hidden sm:inline">Vetted & Insured Cleaners</span>
        <span className="hidden sm:inline text-emerald-200">•</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide">
          SAVE 20% WEEKLY
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setActiveView('landing'); setMobileMenuOpen(false); }}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Pure<span className="text-emerald-600">Space</span></span>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border border-emerald-200">HOME</span>
            </div>
            <p className="text-[10px] text-slate-500 font-normal hidden sm:block">Smarter, Simpler Home Cleaning</p>
          </div>
        </div>

        {/* View Switcher: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveView('landing')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeView === 'landing'
                ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                setActiveView('portal');
              } else {
                onOpenLogin();
              }
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeView === 'portal'
                ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeView === 'admin'
                ? 'bg-slate-900 text-emerald-400 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </button>
        </nav>

        {/* Right action group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Toggle (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs font-medium text-slate-600">
            {(['USD', 'GBP', 'EUR'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  currency === c
                    ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {c === 'USD' ? '$ USD' : c === 'GBP' ? '£ GBP' : '€ EUR'}
              </button>
            ))}
          </div>

          {/* User Account / Login Button (Desktop) */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => setActiveView('portal')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="hidden sm:block px-3 py-1.5 text-slate-700 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Primary CTA: Book Clean */}
          <button
            type="button"
            onClick={onOpenBooking}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl shadow-sm shadow-emerald-600/30 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Book in 60s</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { setActiveView('landing'); setMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold flex items-center gap-2 ${
                activeView === 'landing' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Home & Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentUser) {
                  setActiveView('portal');
                } else {
                  onOpenLogin();
                }
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold flex items-center gap-2 ${
                activeView === 'portal' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Customer Portal {currentUser ? `(${currentUser.name})` : '(Sign In)'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveView('admin'); setMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold flex items-center gap-2 ${
                activeView === 'admin' ? 'bg-slate-900 text-emerald-400' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Admin Control Center & Logs</span>
            </button>
          </div>

          {/* Currency Toggle on Mobile */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Currency</span>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
              {(['USD', 'GBP', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    currency === c ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
