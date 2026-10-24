'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useBooking } from '@/context/BookingContext';
import { Star, Heart, X, Sparkles, Check } from 'lucide-react';

interface TipAndReviewModalProps {
  onClose: () => void;
}

export const TipAndReviewModal: React.FC<TipAndReviewModalProps> = ({ onClose }) => {
  const { activeBooking, tipCleaner, submitReview, formatPrice } = useBooking();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [selectedTip, setSelectedTip] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [comment, setComment] = useState<string>('Maria did a sensational job! The kitchen and bathrooms look brand new.');
  const [selectedBadges, setSelectedBadges] = useState<string[]>(['Super Thorough', 'Sparkling Bathrooms', 'Pet Friendly']);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const cleaner = activeBooking?.cleaner;

  const tipOptions = [5, 10, 15, 20];
  const badges = [
    'Super Thorough',
    'Sparkling Bathrooms',
    'Spotless Oven',
    '100% Punctual',
    'Great with Pets',
    'Delightful Eco Scent',
  ];

  const toggleBadge = (b: string) => {
    setSelectedBadges(prev => 
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTip = customTip ? parseFloat(customTip) || 0 : selectedTip;
    if (finalTip > 0) tipCleaner(finalTip);
    submitReview(rating, comment);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="text-base font-bold text-slate-900">Review & Tip {cleaner?.name || 'Cleaner'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-3" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Thank You!</h4>
            <p className="text-xs text-slate-500">Your review and tip have been sent to {cleaner?.name}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-slate-500 block">How clean was your home?</span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(rating)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {rating === 5 ? 'Exceptional! 5 Stars' : `${rating} Stars`}
              </span>
            </div>

            {/* Compliment Badges */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 block">Select compliments</span>
              <div className="flex flex-wrap gap-1.5">
                {badges.map((b) => {
                  const isSelected = selectedBadges.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? `✓ ${b}` : b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tip Cleaner Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Add a Tip for {cleaner?.name}</span>
                <span className="text-[11px] text-emerald-700 font-semibold">100% goes directly to cleaner</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {tipOptions.map((tip) => {
                  const isSelected = selectedTip === tip && !customTip;
                  return (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => {
                        setSelectedTip(tip);
                        setCustomTip('');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {formatPrice(tip)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Share your experience</label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a brief comment..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Rating & Tip</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
