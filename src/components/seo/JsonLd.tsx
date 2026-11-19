import { BRAND } from '@/lib/config';
import { SERVICE_SEED } from '@/lib/catalog-seed';

export function JsonLd() {
  const baseUrl = BRAND.url.replace(/\/+$/, '');

  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': ['CleaningService', 'LocalBusiness', 'ProfessionalService'],
    '@id': `${baseUrl}/#business`,
    name: 'Hoodie Cleaning Services',
    alternateName: ['Hoodie', 'Hoodie Services', 'Hoodie Cleaners'],
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    image: `${baseUrl}/images/hero.jpg`,
    description:
      'Professional, vetted and fully insured home and commercial cleaning services across London and the UK. Instant online booking, fixed transparent pricing, and 72-hour free re-clean guarantee.',
    telephone: BRAND.phone,
    email: BRAND.email,
    priceRange: '£24 - £120',
    currenciesAccepted: 'GBP',
    paymentAccepted: 'Credit Card, Debit Card, PayPal, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressRegion: 'Greater London',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '51.5074',
      longitude: '-0.1278',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'London',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Greater London',
      },
      {
        '@type': 'Country',
        name: 'United Kingdom',
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Cleaning Services Catalogue',
      itemListElement: SERVICE_SEED.map((s, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.description,
        },
        price: s.hourlyRate,
        priceCurrency: 'GBP',
        unitCode: 'HUR',
        position: index + 1,
      })),
    },
    makesOffer: [
      {
        '@type': 'Offer',
        name: '72-Hour Free Re-clean Guarantee',
        description: 'If you are not 100% satisfied with your clean, report within 72 hours and we will re-clean for free.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does house cleaning cost with Hoodie?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Regular house cleaning starts from £24 per hour with a 2.5-hour minimum. Deep cleaning starts from £29 per hour, end of tenancy cleaning starts from £32 per hour, and Airbnb turnovers start from £27 per hour. Prices are transparent with no hidden booking fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to pay when I book with Hoodie?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No upfront payment is required to reserve your slot. You review your quote before booking and pay safely after the cleaning is finished.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are Hoodie cleaners vetted and insured?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every cleaner on the Hoodie platform is interviewed in person, background-checked, identity and reference-verified, and fully covered by comprehensive public liability insurance while working in your property.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I change or cancel my cleaning booking for free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, cancellations and rescheduling are free of charge up to 24 hours before your clean starts. You can manage your booking directly online in your customer account or by phone.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to be at home during the cleaning?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Many customers provide access via a key safe, neighbour, building concierge, or leave keys out. Access instructions can be securely submitted during booking and are only shared with your assigned cleaner.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Hoodie satisfaction guarantee?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hoodie offers a 72-hour re-clean guarantee. If any area was not cleaned to your expectations, notify our team within 72 hours and a cleaner will return to re-clean the areas free of charge.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do cleaners bring their own cleaning products and supplies?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cleaners use your preferred vacuum, mop, and everyday supplies by default so your home smells exactly the way you like. You can also opt to have eco-friendly cleaning supplies provided when booking.',
        },
      },
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Hoodie Services',
    description: 'Trusted, vetted and insured home and apartment cleaners.',
    publisher: {
      '@id': `${baseUrl}/#business`,
    },
    inLanguage: 'en-GB',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
