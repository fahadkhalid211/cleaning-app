'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export const ConversionBanner: React.FC<{ onBookNow: () => void }> = ({ onBookNow }) => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl text-center space-y-6">
          {/* Decorative blur rings */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 left-0 w-72 h-72 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-emerald-200 text-xs font-semibold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              100% Risk-Free Home Cleaning
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Reclaim Your Weekends.
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed font-normal">
              Book a verified, top-rated cleaner in 60 seconds with upfront transparent pricing and a 72-hour free re-clean guarantee.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onBookNow}
              className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-900 font-semibold rounded-2xl shadow-xl hover:bg-emerald-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base tracking-wide"
            >
              <span>Calculate Price & Book Now</span>
              <ArrowRight className="w-5 h-5 text-emerald-700" />
            </button>
            <div className="flex items-center gap-2 text-xs text-emerald-200 font-medium">
              <Clock className="w-4 h-4" />
              <span>Takes 60 seconds • No card required upfront</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
