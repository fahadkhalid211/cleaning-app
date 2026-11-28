import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BRAND.url.replace(/\/+$/, '');
  const now = new Date();

  const locales = ['en', 'cn'] as const;

  const publicRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/book', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const localizedEntries = locales.flatMap((locale) =>
    publicRoutes.map((route) => {
      const url = `${baseUrl}/${locale}${route.path}`;
      return {
        url,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            en: `${baseUrl}/en${route.path}`,
            'zh-CN': `${baseUrl}/cn${route.path}`,
          },
        },
      };
    }),
  );

  return [
    ...localizedEntries,
    {
      url: `${baseUrl}/cleaner/signup`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cleaner/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
