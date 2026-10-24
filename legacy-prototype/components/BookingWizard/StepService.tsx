'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';
import { CLEANING_SERVICES } from '@/data/services';
import { ADDON_OPTIONS } from '@/data/addons';
import { 
  Sparkles, 
  ShieldCheck, 
  KeyRound, 
  Hotel, 
  Hammer, 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Snowflake, 
  Maximize2, 
  Archive, 
  Leaf, 
  Shirt, 
  Dog, 
  Sun,
  Info
} from 'lucide-react';
import { ServiceType } from '@/types/cleaning';

export const StepService: React.FC = () => {
  const { form, updateForm, updateRooms, toggleAddon, formatPrice, currencySymbol } = useBooking();

  const getServiceIcon = (id: ServiceType) => {
    switch (id) {
      case 'regular': return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'deep': return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'end_of_tenancy': return <KeyRound className="w-5 h-5 text-cyan-600" />;
      case 'airbnb': return <Hotel className="w-5 h-5 text-amber-600" />;
      case 'after_renovation': return <Hammer className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getAddonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Snowflake': return <Snowflake className="w-4 h-4 text-sky-500" />;
      case 'Maximize2': return <Maximize2 className="w-4 h-4 text-indigo-500" />;
      case 'Archive': return <Archive className="w-4 h-4 text-emerald-600" />;
      case 'Leaf': return <Leaf className="w-4 h-4 text-green-600" />;
      case 'Shirt': return <Shirt className="w-4 h-4 text-rose-500" />;
      case 'Dog': return <Dog className="w-4 h-4 text-amber-600" />;
      case 'Sun': return <Sun className="w-4 h-4 text-yellow-500" />;
      default: return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Service Type Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Select Your Cleaning Package
          </label>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">All packages include certified cleaners</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CLEANING_SERVICES.map((srv) => {
            const isSelected = form.serviceType === srv.id;
            return (
              <div
                key={srv.id}
                onClick={() => updateForm({ serviceType: srv.id })}
                className={`relative p-4 rounded-2xl cursor-pointer transition-all border-2 text-left flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {srv.badge && (
                  <span className={`absolute -top-2.5 right-4 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full shadow-2xs ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {srv.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      {getServiceIcon(srv.id)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{srv.title}</h4>
                      <p className="text-[11px] text-emerald-700 font-semibold">From {currencySymbol}{srv.basePricePerHour}/hr</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{srv.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  {srv.includedHighlights.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Room Size Customizer */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Customize Home Layout
          </label>
          <span className="text-xs text-slate-500 font-medium">Instantly adjusts hours & pricing</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Bedrooms */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700">Bedrooms</span>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => updateRooms({ bedrooms: Math.max(0, form.rooms.bedrooms - 1) })}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{form.rooms.bedrooms}</span>
              <button
                type="button"
                onClick={() => updateRooms({ bedrooms: form.rooms.bedrooms + 1 })}
                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors active:scale-95 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700">Bathrooms</span>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => updateRooms({ bathrooms: Math.max(1, form.rooms.bathrooms - 1) })}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{form.rooms.bathrooms}</span>
              <button
                type="button"
                onClick={() => updateRooms({ bathrooms: form.rooms.bathrooms + 1 })}
                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors active:scale-95 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Kitchens */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700">Kitchens</span>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => updateRooms({ kitchens: Math.max(1, form.rooms.kitchens - 1) })}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{form.rooms.kitchens}</span>
              <button
                type="button"
                onClick={() => updateRooms({ kitchens: form.rooms.kitchens + 1 })}
                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors active:scale-95 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Living Rooms */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700">Living Areas</span>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => updateRooms({ livingRooms: Math.max(1, form.rooms.livingRooms - 1) })}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{form.rooms.livingRooms}</span>
              <button
                type="button"
                onClick={() => updateRooms({ livingRooms: form.rooms.livingRooms + 1 })}
                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors active:scale-95 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Add-on Extras */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Optional Deep Extras
          </label>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Tap to add or remove
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ADDON_OPTIONS.map((addon) => {
            const isSelected = form.selectedAddons.includes(addon.id);
            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between text-left ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100">
                        {getAddonIcon(addon.icon)}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{addon.name}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{addon.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">+{formatPrice(addon.price)}</span>
                  {addon.durationMinutes > 0 && (
                    <span className="text-[10px] text-slate-500 font-medium">+{addon.durationMinutes} mins</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
