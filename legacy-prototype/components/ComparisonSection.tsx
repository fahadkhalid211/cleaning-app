'use client';

import React from 'react';
import { Check, X, Sparkles, ShieldCheck } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  const comparisons = [
    {
      feature: 'Booking Time & Friction',
      purespace: '60 seconds with instant live price & room calculator',
      legacy: '8+ clunky pages with popups and phone prompts',
      win: true
    },
    {
      feature: 'Pricing Transparency',
      purespace: 'Guaranteed upfront fixed quote with itemized add-ons',
      legacy: 'Hidden minimum hours, congestion & booking fees added later',
      win: true
    },
    {
      feature: 'Live Job Tracking & Checklist',
      purespace: 'Real-time room-by-room checklist + photo proof',
      legacy: 'Basic arrival window with no live progress visibility',
      win: true
    },
    {
      feature: 'Direct Cleaner Communication',
      purespace: 'Direct in-app encrypted chat & one-tap calling',
      legacy: 'Middleman call center / delayed support tickets',
      win: true
    },
    {
      feature: 'Frequency Discounts',
      purespace: 'Save up to 20% immediately with zero annual club fee',
      legacy: 'Forces a paid annual subscription club to get normal rates',
      win: true
    },
    {
      feature: 'Cancellation & Rescheduling',
      purespace: 'Free 1-tap reschedule up to 2 hours before arrival',
      legacy: 'Strict 48-hour cancellation penalties',
      win: true
    },
    {
      feature: 'Cleaner Payout & Quality',
      purespace: 'Cleaners keep 85% of fee (attracts top 3% vetted pros)',
      legacy: 'High agency commissions lead to high cleaner turnover',
      win: true
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern Living</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Why PureSpace is Simply Better
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            We removed the high agency markups, clunky forms, and hidden fees of traditional cleaning agencies to deliver an effortless experience.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto overflow-hidden rounded-3xl border border-slate-200/90 shadow-lg bg-white">
          <div className="grid grid-cols-12 bg-slate-900 text-white p-4 sm:p-5 text-xs sm:text-sm items-center font-medium">
            <div className="col-span-5 sm:col-span-4 font-medium text-slate-300">Features & Experience</div>
            <div className="col-span-4 sm:col-span-4 text-emerald-400 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>PureSpace</span>
            </div>
            <div className="col-span-3 sm:col-span-4 text-slate-400 font-normal">Traditional Cleaning Agencies</div>
          </div>

          <div className="divide-y divide-slate-100">
            {comparisons.map((item, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 p-4 sm:p-5 text-xs items-center gap-2 transition-colors ${
                  idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                }`}
              >
                {/* Feature Name */}
                <div className="col-span-5 sm:col-span-4 font-medium text-slate-900 pr-2">
                  {item.feature}
                </div>

                {/* PureSpace */}
                <div className="col-span-4 sm:col-span-4 flex items-start gap-2 text-emerald-950 font-medium bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-3" />
                  </div>
                  <span className="leading-snug">{item.purespace}</span>
                </div>

                {/* Traditional Agencies */}
                <div className="col-span-3 sm:col-span-4 flex items-start gap-2 text-slate-500 font-normal pl-2">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 stroke-3" />
                  </div>
                  <span className="leading-snug text-slate-600">{item.legacy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
