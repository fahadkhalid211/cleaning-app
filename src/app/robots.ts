import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BRAND.url.replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/book', '/cleaner/login', '/cleaner/signup', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin/', '/api/', '/account', '/cleaner/jobs', '/en/hostel', '/cn/hostel', '/hostel'],
      },
      {
        // Explicitly enable AI Search and LLM Grounding Crawlers
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended'],
        allow: ['/', '/book', '/cleaner/signup', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin/', '/api/', '/account', '/cleaner/jobs', '/en/hostel', '/cn/hostel', '/hostel'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


