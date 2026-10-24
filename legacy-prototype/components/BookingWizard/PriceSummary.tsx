'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';
import { CLEANING_SERVICES, FREQUENCY_DISCOUNTS } from '@/data/services';
import { ADDON_OPTIONS } from '@/data/addons';
import { ShieldCheck, Clock, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface PriceSummaryProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  currentStep,
  onNext,
  onBack,
  onSubmit
}) => {
  const { form, currentEstimate, formatPrice, currencySymbol } = useBooking();

  const service = CLEANING_SERVICES.find(s => s.id === form.serviceType) || CLEANING_SERVICES[0];
  const freq = FREQUENCY_DISCOUNTS.find(f => f.id === form.frequency);

  const selectedAddonsList = form.selectedAddons
    .map(id => ADDON_OPTIONS.find(a => a.id === id))
    .filter(Boolean);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xl space-y-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Live Price Breakdown</h3>
          <p className="text-xs text-slate-500">Zero hidden fees • Guaranteed quote</p>
        </div>
        <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>~{currentEstimate.totalHours} hrs</span>
        </div>
      </div>

      {/* Breakdown Items */}
      <div className="space-y-2.5 text-xs">
        {/* Base Service */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800">{service.title}</span>
            <span className="text-slate-400">({currentEstimate.baseHours} hrs @ {currencySymbol}{service.basePricePerHour}/h)</span>
          </div>
          <span className="font-semibold text-slate-900">
            {formatPrice(currentEstimate.baseHours * service.basePricePerHour)}
          </span>
        </div>

        {/* Rooms Configuration Line */}
        <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-emerald-200">
          {form.rooms.bedrooms} Bed • {form.rooms.bathrooms} Bath • {form.rooms.kitchens} Kitchen • {form.rooms.livingRooms} Living
        </div>

        {/* Add-ons breakdown */}
        {selectedAddonsList.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Selected Extras</span>
            {selectedAddonsList.map(a => a && (
              <div key={a.id} className="flex items-center justify-between pl-1">
                <span className="text-slate-600 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {a.name}
                </span>
                <span className="font-semibold text-slate-900">+{formatPrice(a.price)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Frequency Discount */}
        {currentEstimate.discountAmount > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-xl">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{freq?.label} Discount ({currentEstimate.discountPercent}%)</span>
            </span>
            <span>-{formatPrice(currentEstimate.discountAmount)}</span>
          </div>
        )}

        {/* Subtotal & Insurance */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Public Liability & Damage Insurance</span>
            <span className="text-emerald-600 font-semibold">Included (Free)</span>
          </div>
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Cleaner Fair Living Wage</span>
            <span className="text-emerald-600 font-semibold">Guaranteed</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t-2 border-slate-900/10 flex items-baseline justify-between">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Total Due</span>
            <span className="text-[10px] text-slate-400">Charged only after completion</span>
          </div>
          <div className="text-right">
            {currentEstimate.discountAmount > 0 && (
              <span className="text-xs text-slate-400 line-through block font-medium">
                {formatPrice(currentEstimate.rawPrice)}
              </span>
            )}
            <span className="text-2xl font-bold text-slate-900 tracking-tight text-emerald-700">
              {formatPrice(currentEstimate.finalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Happiness Guarantee Box */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5 text-slate-700">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-slate-900">PureSpace Promise:</strong> If anything isn&apos;t 100% spotless, we will send another cleaner back for free within 72 hours.
        </p>
      </div>

      {/* Button Controls */}
      <div className="space-y-2 pt-1">
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={onNext}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <span>Continue to {currentStep === 1 ? 'Schedule' : 'Location & Access'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-xl shadow-emerald-600/35 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirm & Match Top Cleaner</span>
          </button>
        )}

        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 bg-transparent hover:bg-slate-100 text-slate-600 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>
        )}
      </div>
    </div>
  );
};
