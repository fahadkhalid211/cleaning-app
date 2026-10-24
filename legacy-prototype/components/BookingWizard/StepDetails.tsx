'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';
import { MapPin, Key, Dog, Car, FileText, Lock, Building, Home } from 'lucide-react';

export const StepDetails: React.FC = () => {
  const { form, updateForm } = useBooking();

  const accessOptions = [
    { id: 'lockbox' as const, label: 'Key in Lockbox / Safe', desc: 'Cleaner uses code to access', icon: Lock },
    { id: 'home' as const, label: 'Someone will be Home', desc: 'You or a family member will greet cleaner', icon: Home },
    { id: 'concierge' as const, label: 'Leave with Concierge', desc: 'Collect key from front desk / doorman', icon: Building },
    { id: 'hidden_spot' as const, label: 'Hidden Safe Spot', desc: 'Hidden under plant, mat, or parcel box', icon: Key },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Address Info */}
      <div className="space-y-3">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
          Where Should We Clean?
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={form.address.street}
                onChange={(e) => updateForm({ address: { ...form.address, street: e.target.value } })}
                placeholder="e.g. 742 Evergreen Terrace"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Apartment, Suite, Unit (Optional)</label>
            <input
              type="text"
              value={form.address.apt || ''}
              onChange={(e) => updateForm({ address: { ...form.address, apt: e.target.value } })}
              placeholder="e.g. Apt 4B / Floor 3"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Postcode / ZIP</label>
            <input
              type="text"
              value={form.address.postcode}
              onChange={(e) => updateForm({ address: { ...form.address, postcode: e.target.value } })}
              placeholder="e.g. SP2 1RT or 94107"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Access Method */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
          How Will the Cleaner Enter?
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accessOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = form.access.accessMethod === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateForm({ access: { ...form.access, accessMethod: opt.id } })}
                className={`p-3.5 rounded-2xl cursor-pointer border-2 transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{opt.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {form.access.accessMethod === 'lockbox' && (
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5 animate-fadeIn">
            <label className="block text-xs font-bold text-emerald-900">Lockbox / Key Safe Code</label>
            <input
              type="text"
              value={form.access.lockboxCode || ''}
              onChange={(e) => updateForm({ access: { ...form.access, lockboxCode: e.target.value } })}
              placeholder="e.g. 4821 or #0912"
              className="w-full sm:w-64 px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-800"
            />
            <p className="text-[11px] text-emerald-700">Only revealed to your verified cleaner 15 minutes before the job starts.</p>
          </div>
        )}
      </div>

      {/* 3. Pets & Parking */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
          Pets & Parking Access
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pets Toggle */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Dog className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pets in Property?</h4>
                <p className="text-[11px] text-slate-500">So cleaner comes prepared</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateForm({ access: { ...form.access, hasPets: !form.access.hasPets } })}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.access.hasPets ? 'bg-emerald-600' : 'bg-slate-200'}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${form.access.hasPets ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Parking Toggle */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Free Parking on Site?</h4>
                <p className="text-[11px] text-slate-500">Driveway, visitor bay or street</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateForm({ access: { ...form.access, parkingAvailable: !form.access.parkingAvailable } })}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.access.parkingAvailable ? 'bg-emerald-600' : 'bg-slate-200'}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${form.access.parkingAvailable ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {form.access.hasPets && (
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 animate-fadeIn">
            <label className="block text-xs font-bold text-amber-900 mb-1">Pet details (Name & temperament)</label>
            <input
              type="text"
              value={form.access.petDetails || ''}
              onChange={(e) => updateForm({ access: { ...form.access, petDetails: e.target.value } })}
              placeholder="e.g. Golden retriever (Bailey), friendly, will be in living room"
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>
        )}
      </div>

      {/* 4. Special Notes & Priority Areas */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">4</span>
          Specific Focus Areas & Instructions
        </label>
        <p className="text-xs text-slate-500">Tell the cleaner where you want them to spend extra attention.</p>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <textarea
            rows={3}
            value={form.access.specialInstructions || ''}
            onChange={(e) => updateForm({ access: { ...form.access, specialInstructions: e.target.value } })}
            placeholder="e.g. Please focus heavily on the limescale around the bathroom taps, and wipe the interior skirting boards in the hallway."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
