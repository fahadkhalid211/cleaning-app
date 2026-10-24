'use client';

import React, { useState } from 'react';
import { CLEANING_SERVICES } from '@/data/services';
import { useBooking } from '@/context/BookingContext';
import { Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { ServiceType } from '@/types/cleaning';

interface CleanCatalogSectionProps {
  onSelectServiceAndBook: (serviceId: ServiceType) => void;
}

export const CleanCatalogSection: React.FC<CleanCatalogSectionProps> = ({ onSelectServiceAndBook }) => {
  const [selectedService, setSelectedService] = useState<ServiceType>('regular');
  const { updateForm, services, formatPrice } = useBooking();

  const current = services.find(s => s.id === selectedService) || services[0] || CLEANING_SERVICES[0];

  const handleSelect = (id: ServiceType) => {
    setSelectedService(id);
    updateForm({ serviceType: id });
  };

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Service Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Exactly What Gets Cleaned
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Every clean follows our rigorous 45-point checklist. Never guess what your cleaner will do.
          </p>
        </div>

        {/* Clean Service Tabs */}
        <div className="flex justify-center overflow-x-auto pb-1 no-scrollbar">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl gap-1">
            {services.map((srv) => {
              const isSelected = selectedService === srv.id;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handleSelect(srv.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {srv.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Service Detailed Inclusions Card */}
        <div className="max-w-4xl mx-auto bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{current.title}</h3>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {formatPrice(current.basePricePerHour)}/hr
                </span>
                {current.badge && (
                  <span className="text-[10px] font-semibold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {current.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{current.description}</p>
            </div>

            <button
              type="button"
              onClick={() => onSelectServiceAndBook(current.id)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>Book This Clean</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Checklist Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Included In Every Session
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.includedHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-2xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-3" />
                  </div>
                  <span className="leading-snug font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              100% Free Re-Clean if anything is missed within 72 hours
            </span>
            <span>Recommended for: <strong className="text-slate-700">{current.recommendedFor}</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
