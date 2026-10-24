'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { 
  Sparkles, 
  Minus, 
  Plus, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Flame, 
  Snowflake, 
  Maximize2, 
  Leaf 
} from 'lucide-react';
import { ServiceType, FrequencyType } from '@/types/cleaning';

interface InstantCalculatorProps {
  onOpenBookingModal: () => void;
}

export const InstantCalculator: React.FC<InstantCalculatorProps> = ({ onOpenBookingModal }) => {
  const { 
    form, 
    updateForm, 
    updateRooms, 
    toggleAddon, 
    currentEstimate, 
    formatPrice,
    services,
    addons
  } = useBooking();

  const frequencies: { id: FrequencyType; label: string; discount?: string }[] = [
    { id: 'weekly', label: 'Weekly', discount: '-20%' },
    { id: 'biweekly', label: 'Every 2 Wks', discount: '-15%' },
    { id: 'one_off', label: 'One-Time', discount: undefined },
  ];

  const getAddonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Snowflake': return Snowflake;
      case 'Maximize2': return Maximize2;
      case 'Leaf': return Leaf;
      default: return Sparkles;
    }
  };

  const displayServices = services.slice(0, 3);
  const quickExtras = addons.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 space-y-4 sm:space-y-5 text-left relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Instant Clean Calculator</h3>
            <p className="text-[11px] text-slate-500">Live guaranteed quote in 3 clicks</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          FREE CANCEL (2H)
        </span>
      </div>

      {/* 1. Service Type Segmented Pill */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          1. Cleaning Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          {displayServices.map((srv) => {
            const isSelected = form.serviceType === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => updateForm({ serviceType: srv.id })}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                  isSelected
                    ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="block leading-tight truncate">{srv.title.replace(' Clean', '').replace(' / Spring Reset', '')}</span>
                <span className={`text-[10px] block ${isSelected ? 'text-emerald-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                  {formatPrice(srv.basePricePerHour)}/hr
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Room Size Compact Steppers */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          2. Home Size
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Bedrooms */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-xs font-medium text-slate-700 pl-1">Bedrooms</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateRooms({ bedrooms: Math.max(0, form.rooms.bedrooms - 1) })}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-semibold text-slate-900 w-4 text-center">
                {form.rooms.bedrooms}
              </span>
              <button
                type="button"
                onClick={() => updateRooms({ bedrooms: form.rooms.bedrooms + 1 })}
                className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-colors font-medium"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-xs font-medium text-slate-700 pl-1">Bathrooms</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateRooms({ bathrooms: Math.max(1, form.rooms.bathrooms - 1) })}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-semibold text-slate-900 w-4 text-center">
                {form.rooms.bathrooms}
              </span>
              <button
                type="button"
                onClick={() => updateRooms({ bathrooms: form.rooms.bathrooms + 1 })}
                className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-colors font-medium"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Frequency Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            3. Frequency
          </label>
          <span className="text-[10px] text-emerald-700 font-medium">Cancel or skip anytime</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {frequencies.map((freq) => {
            const isSelected = form.frequency === freq.id;
            return (
              <button
                key={freq.id}
                type="button"
                onClick={() => updateForm({ frequency: freq.id })}
                className={`py-2 px-2 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-semibold shadow-2xs ring-1 ring-emerald-500/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="text-xs block leading-tight">{freq.label}</span>
                {freq.discount && (
                  <span className="text-[10px] font-semibold text-emerald-700 block mt-0.5">
                    {freq.discount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Optional Quick Extras */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          4. Quick Extras (Optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {quickExtras.map((extra) => {
            const isSelected = form.selectedAddons.includes(extra.id);
            const Icon = getAddonIcon(extra.icon);
            return (
              <button
                key={extra.id}
                type="button"
                onClick={() => toggleAddon(extra.id)}
                className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs truncate">+{extra.name.split(' ')[0]} ({formatPrice(extra.price)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Live Price & Instant Book CTA */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Est. ~{currentEstimate.totalHours} hrs</span>
              {currentEstimate.discountAmount > 0 && (
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-sm text-[10px]">
                  Saved {formatPrice(currentEstimate.discountAmount)}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {formatPrice(currentEstimate.finalPrice)}
              </span>
              {currentEstimate.discountAmount > 0 && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatPrice(currentEstimate.rawPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-400">
            <span>Guaranteed price</span>
            <span className="block text-emerald-700 font-medium">No surprise fees</span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={onOpenBookingModal}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition-all tracking-wide"
        >
          <span>Book This Clean in 60s</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Guarantee text */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Pay after clean • 100% Satisfaction or Free Re-clean</span>
        </div>
      </div>
    </div>
  );
};
