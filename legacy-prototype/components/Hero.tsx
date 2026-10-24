'use client';

import React from 'react';
import { Sparkles, Star, ShieldCheck, CheckCircle2, Zap, HeartHandshake } from 'lucide-react';
import { InstantCalculator } from './InstantCalculator';

interface HeroProps {
  onOpenBookingModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBookingModal }) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-20 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Smarter, Simpler Cleaning</span>
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">NEW</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.14]">
              Spotless Home,{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Booked in 60s.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              No phone calls, no hidden minimum hours, and no messy 8-page booking forms. Pick your rooms on the calculator and reserve a 5-star vetted cleaner instantly.
            </p>

            {/* Key Differentiators Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 text-left">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-slate-900">Instant Fixed Quote</h4>
                  <p className="text-[10px] text-slate-500">No surprise charges</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 w-fit">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-slate-900">Vetted & Insured</h4>
                  <p className="text-[10px] text-slate-500">Top 3% pros only</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 w-fit">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-slate-900">Free Re-Clean</h4>
                  <p className="text-[10px] text-slate-500">72-hour guarantee</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-slate-600 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-semibold text-slate-900 ml-1.5 text-sm">4.96 / 5.0</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-700">18,500+ homes cleaned</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Eco-friendly
              </span>
            </div>
          </div>

          {/* Right Column: Instant Clean Calculator (Replaces the old dashboard preview!) */}
          <div className="lg:col-span-5">
            <InstantCalculator onOpenBookingModal={onOpenBookingModal} />
          </div>
        </div>
      </div>
    </section>
  );
};
