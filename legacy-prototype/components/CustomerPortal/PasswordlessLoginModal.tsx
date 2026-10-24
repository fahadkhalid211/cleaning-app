'use client';

import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { Mail, Sparkles, X, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PasswordlessLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordlessLoginModal: React.FC<PasswordlessLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginPasswordless } = useBooking();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [code, setCode] = useState('4829');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    loginPasswordless(email.trim());
    setIsSent(true);

    setTimeout(() => {
      onSuccess();
      onClose();
      setIsSent(false);
    }, 1200);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    loginPasswordless(demoEmail);
    setIsSent(true);
    setTimeout(() => {
      onSuccess();
      onClose();
      setIsSent(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-left relative animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSent ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Welcome Back!</h4>
            <p className="text-xs text-slate-500 font-normal">
              Verified email passwordless login. Loading your customer portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                Passwordless Access
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Log In to PureSpace
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                No passwords to remember. Enter the email you used when booking.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Quick Demo Login Option */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Quick Demo Account:</span>
              <button
                type="button"
                onClick={() => handleDemoLogin('emma@example.com')}
                className="w-full py-1.5 px-3 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 rounded-xl text-left font-medium text-slate-700 flex items-center justify-between transition-colors"
              >
                <span>emma@example.com (Active Clean)</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Log in</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-xs transition-all tracking-wide"
            >
              <Sparkles className="w-4 h-4" />
              <span>Instant Passwordless Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
