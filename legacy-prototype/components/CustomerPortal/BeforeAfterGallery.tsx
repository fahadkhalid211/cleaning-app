'use client';

import React, { useState } from 'react';
import { BeforeAfterPhoto } from '@/types/cleaning';
import { Sparkles, Eye, CheckCircle2 } from 'lucide-react';

interface BeforeAfterGalleryProps {
  photos: BeforeAfterPhoto[];
}

export const BeforeAfterGallery: React.FC<BeforeAfterGalleryProps> = ({ photos }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'after' | 'before' | 'split'>('split');

  if (!photos || photos.length === 0) return null;

  const current = photos[selectedPhotoIndex];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Before & After Photo Proof</h3>
          </div>
          <p className="text-[11px] text-slate-500">Cleaner verified quality check photos</p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'split' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Side-by-Side
          </button>
          <button
            type="button"
            onClick={() => setViewMode('before')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'before' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Before
          </button>
          <button
            type="button"
            onClick={() => setViewMode('after')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'after' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Sparkling After
          </button>
        </div>
      </div>

      {/* Area Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {photos.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPhotoIndex(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedPhotoIndex === idx
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {p.area}
          </button>
        ))}
      </div>

      {/* Main Image Display */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video sm:aspect-21/9 max-h-[380px] flex items-center justify-center">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-2 w-full h-full">
            {/* Before half */}
            <div className="relative h-full border-r border-white/20">
              <img
                src={current.beforeUrl}
                alt={`Before: ${current.area}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                BEFORE CLEAN
              </span>
            </div>

            {/* After half */}
            <div className="relative h-full">
              <img
                src={current.afterUrl}
                alt={`After: ${current.area}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
                SPARKLING AFTER
              </span>
            </div>
          </div>
        ) : viewMode === 'before' ? (
          <div className="relative w-full h-full">
            <img
              src={current.beforeUrl}
              alt={`Before: ${current.area}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
              BEFORE CLEAN
            </span>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={current.afterUrl}
              alt={`After: ${current.area}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SPARKLING AFTER
            </span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
        <span className="font-medium">
          <strong className="text-slate-800">{current.area}:</strong> {current.caption}
        </span>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Verified by PureSpace Inspector</span>
      </div>
    </div>
  );
};
