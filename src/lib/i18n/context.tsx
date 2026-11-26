'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale, TranslationDictionary } from './types';
import { enDictionary } from './dictionaries/en';
import { cnDictionary } from './dictionaries/cn';

interface I18nContextValue {
  locale: Locale;
  t: TranslationDictionary;
  l: (path: string) => string;
  switchLocale: (target: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({
  initialLocale = 'en',
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const router = useRouter();

  // Determine locale from URL pathname prefix or initialLocale
  const currentLocale: Locale = useMemo(() => {
    if (pathname.startsWith('/cn/') || pathname === '/cn') return 'cn';
    if (pathname.startsWith('/en/') || pathname === '/en') return 'en';
    return initialLocale;
  }, [pathname, initialLocale]);

  const dictionary = currentLocale === 'cn' ? cnDictionary : enDictionary;

  // Localizes an internal path, e.g. '/hostel' -> '/en/hostel' or '/cn/hostel'
  const l = useMemo(() => {
    return (path: string): string => {
      if (!path) return `/${currentLocale}`;
      // External links, anchors, tel/mailto
      if (
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('mailto:') ||
        path.startsWith('tel:')
      ) {
        return path;
      }
      if (path.startsWith('#')) {
        return `/${currentLocale}${path}`;
      }

      // Strip existing /en or /cn if present
      const cleanPath = path.replace(/^\/(en|cn)(\/|$)/, '/');
      const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      return `/${currentLocale}${normalized === '/' ? '' : normalized}`;
    };
  }, [currentLocale]);

  // Switches between /en and /cn while keeping the current sub-path and search parameters
  const switchLocale = useCallback(
    (target: Locale) => {
      if (target === currentLocale) return;

      // Remove leading /en or /cn
      let cleanPath = pathname.replace(/^\/(en|cn)(\/|$)/, '/');
      if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;

      const newPath = `/${target}${cleanPath === '/' ? '' : cleanPath}`;
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const targetUrl = search ? `${newPath}${search}` : newPath;

      router.push(targetUrl);
    },
    [currentLocale, pathname, router],
  );

  const value = useMemo(
    () => ({
      locale: currentLocale,
      t: dictionary,
      l,
      switchLocale,
    }),
    [currentLocale, dictionary, l, switchLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback if rendered outside provider (e.g. error boundary)
    return {
      locale: 'en',
      t: enDictionary,
      l: (p: string) => `/en${p.startsWith('/') ? p : `/${p}`}`,
      switchLocale: () => {},
    };
  }
  return ctx;
}
