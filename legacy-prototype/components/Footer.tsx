'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';
import { Sparkles, ShieldCheck, Leaf, Mail, Phone, Lock, User } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView } = useBooking();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('landing')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Pure<span className="text-emerald-400">Space</span></span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              The modern, frictionless home cleaning platform. Instant transparent pricing, 100% satisfaction guarantee, passwordless customer login, and real-time live task updates.
            </p>

            <div className="flex items-center gap-4 text-emerald-400 font-medium text-[11px]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Insured up to $2M
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Leaf className="w-4 h-4" /> 100% Non-Toxic
              </span>
            </div>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => setActiveView('landing')}>Regular Maintenance Clean</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => setActiveView('landing')}>Deep / Spring Reset Clean</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => setActiveView('landing')}>End of Tenancy Deposit-Back</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => setActiveView('landing')}>Airbnb / Vacation Turnover</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => setActiveView('landing')}>Post-Renovation Clean</li>
            </ul>
          </div>

          {/* Col 4: Platform Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Portals & Tools</h4>
            <ul className="space-y-2">
              <li
                onClick={() => setActiveView('portal')}
                className="hover:text-emerald-400 cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>Customer Portal (My Bookings)</span>
              </li>
              <li
                onClick={() => setActiveView('admin')}
                className="hover:text-emerald-400 cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Admin Control Dashboard</span>
              </li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">
                Instant Price Calculator
              </li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">
                Eco-Friendly Cleaning Kit
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Support & Guarantees</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+1 (800) 555-PURE</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>support@purespace.app</span>
              </li>
              <li className="pt-2 text-emerald-300 font-medium leading-relaxed">
                72-Hour Free Re-Clean Guarantee on every booking.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 PureSpace Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer" onClick={() => setActiveView('admin')}>Superadmin Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
