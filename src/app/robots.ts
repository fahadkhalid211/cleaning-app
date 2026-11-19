import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BRAND.url.replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/cleaner/login', '/cleaner/signup'],
      disallow: ['/admin/', '/api/', '/account', '/cleaner/jobs'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

