'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do I need to be home when the cleaner arrives?',
      a: 'Not at all! Many of our clients leave their key in a secure lockbox, with a concierge/doorman, or under a safe spot. Your lockbox code is encrypted and only revealed to your assigned cleaner 15 minutes before the booking.'
    },
    {
      q: 'What is included in the 100% Satisfaction Guarantee?',
      a: 'If any room or area does not meet our 45-point spotless standard, simply notify us through your Customer Portal within 72 hours, and we will send a cleaner back to re-clean the area free of charge.'
    },
    {
      q: 'Are cleaning products and vacuums provided?',
      a: 'Yes! All pros bring professional equipment. You can also select our 100% Eco-Friendly Non-Toxic Kit on the calculator if you prefer organic, plant-based formulas that are safe for infants and pets.'
    },
    {
      q: 'How does the passwordless login work?',
      a: 'When you confirm a booking, an account is automatically created for your email address. To check your booking status or reschedule, simply enter your email in the login box—no passwords to remember or reset!'
    },
    {
      q: 'Can I reschedule or cancel without penalties?',
      a: 'Yes, you can easily reschedule or cancel directly from your customer portal up to 2 hours before the appointment with zero cancellation fees.'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to know before booking your spotless home.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
