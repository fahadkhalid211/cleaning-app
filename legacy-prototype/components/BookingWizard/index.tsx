'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { StepService } from './StepService';
import { StepSchedule } from './StepSchedule';
import { StepDetails } from './StepDetails';
import { PriceSummary } from './PriceSummary';
import { BookingSuccessModal } from './BookingSuccessModal';
import { Booking } from '@/types/cleaning';
import { Check, Sparkles, Layers, Calendar, MapPin } from 'lucide-react';

interface BookingWizardProps {
  onBookingComplete?: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ onBookingComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const { submitNewBooking } = useBooking();

  const handleNext = () => {
    setCurrentStep(prev => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    const booking = submitNewBooking();
    setConfirmedBooking(booking);
  };

  const steps = [
    { num: 1, title: 'Service & Space', desc: 'Choose package & rooms', icon: Layers },
    { num: 2, title: 'Schedule & Frequency', desc: 'Date, time & discounts', icon: Calendar },
    { num: 3, title: 'Access & Details', desc: 'Key safe, pets & notes', icon: MapPin },
  ];

  return (
    <section id="booking-section" className="py-12 sm:py-16 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Clean Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Book Your Spotless Home in 60 Seconds
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Transparent pricing calculated in real time. Never any hidden agency fees or surprise minimums.
          </p>
        </div>

        {/* Step Indicator Header */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
            {steps.map((step) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              const Icon = step.icon;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className={`text-left p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : isPassed
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                      : 'bg-white/80 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isPassed ? <Check className="w-4 h-4 stroke-3" /> : step.num}
                  </div>
                  <div className="hidden sm:block overflow-hidden">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-slate-900' : isPassed ? 'text-emerald-900' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Form Steps on Left, Sticky Price Breakdown on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Active Step Content */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
            {currentStep === 1 && <StepService />}
            {currentStep === 2 && <StepSchedule />}
            {currentStep === 3 && <StepDetails />}
          </div>

          {/* Right Column: Sticky Live Price Breakdown */}
          <div className="lg:col-span-4">
            <PriceSummary
              currentStep={currentStep}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {confirmedBooking && (
        <BookingSuccessModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onGoToTracker={() => {
            setConfirmedBooking(null);
            if (onBookingComplete) onBookingComplete();
          }}
        />
      )}
    </section>
  );
};
