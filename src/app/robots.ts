import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/cleaner/', '/api/'],
    },
    sitemap: 'https://hoodie.services/sitemap.xml',
  };
}
