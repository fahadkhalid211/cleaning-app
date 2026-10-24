'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2, HeartHandshake } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Working Mother of Two',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      date: '3 days ago',
      cleanType: 'Bi-Weekly Regular Clean',
      text: 'I used to rely on traditional cleaning agencies and was constantly frustrated by hidden surcharges and having a different random cleaner each time. PureSpace matched me with an exceptional pro who comes every other Tuesday. My house has never looked or smelled cleaner!',
      highlight: 'Reliable same cleaner every time'
    },
    {
      id: 2,
      name: 'Marcus Vance',
      role: 'Architect & Tenant',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      date: '1 week ago',
      cleanType: 'End of Tenancy Guarantee Clean',
      text: 'Needed a guaranteed deposit-back clean for my 2-bed flat before moving out. The estate agent was notoriously strict, but the PureSpace checklist was so thorough that we got 100% of our deposit returned with zero deductions.',
      highlight: 'Full deposit returned without questions'
    },
    {
      id: 3,
      name: 'Chloe Lin',
      role: 'Airbnb Superhost (4 listings)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      date: '2 weeks ago',
      cleanType: 'Airbnb Turnover with Linens',
      text: 'The live checklist and before/after photos are pure genius for remote hosts. I can see the moment the cleaner arrives, finishes beds, and restocks amenities without having to visit the flat myself.',
      highlight: 'Live photo proof for hosts'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Real Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Loved by 18,500+ Busy Homes
          </h2>
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-600">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-slate-900 text-sm">4.96 out of 5</span>
            <span className="text-slate-400">•</span>
            <span>Based on verified booking completions</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Rating & Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                </div>

                <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                  {rev.cleanType}
                </span>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  &quot;{rev.text}&quot;
                </p>
              </div>

              {/* Author */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-400"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{rev.name}</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  </h4>
                  <p className="text-[10px] text-slate-400">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
