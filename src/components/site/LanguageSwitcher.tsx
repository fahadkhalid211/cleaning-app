'use client';

import { useId } from 'react';
import { useI18n } from '@/lib/i18n';

// Clean SVG flag icons for consistent cross-browser & cross-platform visual crispness
export function FlagUK({ className = 'size-4' }: { className?: string }) {
  const clipId = useId();
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden="true" fill="none">
      <clipPath id={clipId}>
        <rect width="60" height="30" rx="3" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#FFF" strokeWidth="6" />
        <path d="M0 0l30 15m0 0L60 30M60 0L30 15m0 0L0 30" stroke="#C8102E" strokeWidth="2" />
        <path d="M30 0v30M0 15h60" stroke="#FFF" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function FlagChina({ className = 'size-4' }: { className?: string }) {
  const clipId = useId();
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
      <clipPath id={clipId}>
        <rect width="60" height="30" rx="3" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="30" fill="#DE2910" />
        {/* Main Big Star */}
        <polygon
          fill="#FFDE00"
          points="10,4.5 11.2,8.2 15.1,8.2 12,10.5 13.2,14.2 10,11.9 6.8,14.2 8,10.5 4.9,8.2 8.8,8.2"
        />
        {/* Small stars */}
        <polygon
          fill="#FFDE00"
          points="20,2 20.4,3.2 21.7,3.2 20.7,4 21.1,5.2 20,4.4 18.9,5.2 19.3,4 18.3,3.2 19.6,3.2"
          transform="rotate(23 20 3.5)"
        />
        <polygon
          fill="#FFDE00"
          points="24,5 24.4,6.2 25.7,6.2 24.7,7 25.1,8.2 24,7.4 22.9,8.2 23.3,7 22.3,6.2 23.6,6.2"
          transform="rotate(45 24 6.5)"
        />
        <polygon
          fill="#FFDE00"
          points="24,11 24.4,12.2 25.7,12.2 24.7,13 25.1,14.2 24,13.4 22.9,14.2 23.3,13 22.3,12.2 23.6,12.2"
          transform="rotate(0 24 12.5)"
        />
        <polygon
          fill="#FFDE00"
          points="20,15 20.4,16.2 21.7,16.2 20.7,17 21.1,18.2 20,17.4 18.9,18.2 19.3,17 18.3,16.2 19.6,16.2"
          transform="rotate(-20 20 16.5)"
        />
      </g>
    </svg>
  );
}

export function LanguageSwitcher({
  variant = 'compact',
  className = '',
}: {
  variant?: 'compact' | 'full';
  className?: string;
}) {
  const { locale, switchLocale } = useI18n();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center rounded-full border border-line bg-white/90 p-0.5 shadow-sm backdrop-blur ${className}`}
    >
      <button
        type="button"
        onClick={() => switchLocale('en')}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
          locale === 'en'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:text-ink hover:bg-soft'
        }`}
        aria-pressed={locale === 'en'}
        title="Switch to English version"
      >
        <FlagUK className="size-3.5 sm:size-4 rounded-sm shadow-xs" />
        <span>{variant === 'full' ? 'English' : 'EN'}</span>
      </button>

      <button
        type="button"
        onClick={() => switchLocale('cn')}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
          locale === 'cn'
            ? 'bg-brand text-white shadow-sm'
            : 'text-slate-600 hover:text-ink hover:bg-soft'
        }`}
        aria-pressed={locale === 'cn'}
        title="切换至中文版本"
      >
        <FlagChina className="size-3.5 sm:size-4 rounded-sm shadow-xs" />
        <span>{variant === 'full' ? '简体中文' : '中文'}</span>
      </button>
    </div>
  );
}
