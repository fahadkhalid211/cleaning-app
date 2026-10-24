'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';
import { FREQUENCY_DISCOUNTS } from '@/data/services';
import { Calendar, Clock, UserCheck, Sparkles, Check, Heart, Shield } from 'lucide-react';

export const StepSchedule: React.FC = () => {
  const { form, updateForm } = useBooking();

  // Generate the next 7 days for quick picking
  const days = [
    { label: 'Wed', sub: 'Oct 22', val: 'Wednesday, Oct 22' },
    { label: 'Thu', sub: 'Oct 23', val: 'Thursday, Oct 23' },
    { label: 'Fri', sub: 'Oct 24', val: 'Friday, Oct 24' },
    { label: 'Sat', sub: 'Oct 25', val: 'Saturday, Oct 25' },
    { label: 'Sun', sub: 'Oct 26', val: 'Sunday, Oct 26' },
    { label: 'Mon', sub: 'Oct 27', val: 'Monday, Oct 27' },
    { label: 'Tue', sub: 'Oct 28', val: 'Tuesday, Oct 28' },
  ];

  const timeSlots = [
    { id: 'morning', label: 'Morning Slot', time: '8:00 AM - 11:00 AM', desc: 'Start your morning with a pristine space' },
    { id: 'midday', label: 'Midday Slot', time: '11:00 AM - 2:00 PM', desc: 'Ideal for lunch breaks & midday handovers' },
    { id: 'afternoon', label: 'Afternoon Slot', time: '2:00 PM - 5:00 PM', desc: 'Come home to a pristine space' },
    { id: 'flexible', label: 'Anytime / Flexible', time: 'Between 8 AM & 6 PM', desc: 'Matches you with the highest-rated cleaner' },
  ];

  const cleanerPreferences = [
    { id: 'any_top_rated', title: 'Top-Rated Pro (Fastest Match)', desc: 'Guaranteed 4.9+ star rating with 100+ verified cleans', icon: Shield },
    { id: 'eco_specialist', title: 'Eco-Specialist Cleaner', desc: 'Trained in low-chemical, asthma & allergy-safe cleaning', icon: Sparkles },
    { id: 'pet_friendly', title: 'Pet-Friendly Verified', desc: 'Experienced with dogs, cats and secure gate procedures', icon: Heart },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Cleaning Frequency */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            How Often Would You Like Us to Clean?
          </label>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Pause or skip anytime with 1 tap
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FREQUENCY_DISCOUNTS.map((freq) => {
            const isSelected = form.frequency === freq.id;
            return (
              <div
                key={freq.id}
                onClick={() => updateForm({ frequency: freq.id })}
                className={`relative p-4 rounded-2xl cursor-pointer transition-all border-2 text-left flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                {freq.discountPercent > 0 && (
                  <span className={`absolute -top-2.5 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {freq.badge}
                  </span>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{freq.label}</h4>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{freq.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Choose Date */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
          Choose Your Preferred Date
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {days.map((d, i) => {
            const isSelected = form.date === d.val;
            return (
              <button
                key={i}
                type="button"
                onClick={() => updateForm({ date: d.val })}
                className={`py-2 px-1.5 rounded-xl text-center border transition-all flex flex-col items-center justify-center min-h-[56px] ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                <span className={`text-[10px] font-medium uppercase tracking-wider ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {d.label}
                </span>
                <span className="text-xs sm:text-sm font-semibold tabular-nums mt-0.5">{d.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Choose Time Slot */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
          Select Arrival Window
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {timeSlots.map((slot) => {
            const isSelected = form.timeSlot.includes(slot.time) || form.timeSlot === slot.time;
            return (
              <div
                key={slot.id}
                onClick={() => updateForm({ timeSlot: `${slot.label} (${slot.time})` })}
                className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{slot.label}</span>
                    <span className="text-xs font-bold text-emerald-700">{slot.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{slot.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Cleaner Preference */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">4</span>
          Professional Cleaner Match
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cleanerPreferences.map((pref) => {
            const Icon = pref.icon;
            const isSelected = form.cleanerPreference === pref.id;
            return (
              <div
                key={pref.id}
                onClick={() => updateForm({ cleanerPreference: pref.id })}
                className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{pref.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{pref.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
