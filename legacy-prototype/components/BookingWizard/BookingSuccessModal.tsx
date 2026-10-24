'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Booking } from '@/types/cleaning';
import { CheckCircle2, Calendar, MapPin, Sparkles, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';

interface BookingSuccessModalProps {
  booking: Booking;
  onClose: () => void;
  onGoToTracker: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  onClose,
  onGoToTracker
}) => {
  const { formatPrice } = useBooking();

  useEffect(() => {
    // Trigger celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-center animate-scaleUp">
        {/* Celebration Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9 stroke-2" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
            Booking Confirmed
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your Home is Scheduled!</h3>
          <p className="text-xs text-slate-500">
            Booking reference <strong className="text-slate-800 font-mono">#{booking.id}</strong>
          </p>
        </div>

        {/* Cleaner Assigned Card */}
        {booking.cleaner && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left flex items-center gap-3.5">
            <img
              src={booking.cleaner.avatar}
              alt={booking.cleaner.name}
              className="w-13 h-13 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-900">{booking.cleaner.name}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                <span className="flex items-center text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  {booking.cleaner.rating}
                </span>
                <span>•</span>
                <span>{booking.cleaner.totalCleans} verified cleans</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Assigned Pro • Background Checked
              </p>
            </div>
          </div>
        )}

        {/* Schedule & Location Quick Summary */}
        <div className="grid grid-cols-2 gap-3 text-left text-xs bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-600" /> Date & Time
            </span>
            <p className="font-bold text-slate-800">{booking.date}</p>
            <p className="text-[11px] text-slate-500">{booking.timeSlot}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Address
            </span>
            <p className="font-bold text-slate-800 truncate">{booking.address.street}</p>
            <p className="text-[11px] text-slate-500">{booking.address.postcode}</p>
          </div>
        </div>

        {/* Total Price Charged on Completion */}
        <div className="flex items-center justify-between px-3 text-xs">
          <span className="text-slate-500 font-medium">Estimated Total ({booking.estimatedHours} hrs):</span>
          <span className="text-base font-bold text-emerald-700">{formatPrice(booking.totalPrice)}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onGoToTracker}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Track Cleaner Live & View Checklist</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Close & Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
