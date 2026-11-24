import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bed,
  Check,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  KeyRound,
  Lock,
  Luggage,
  MapPin,
  Moon,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { BRAND, formatMoney } from '@/lib/config';
import { HOSTEL_ROOMS_SEED } from '@/lib/hostel-seed';

export const metadata: Metadata = {
  title: 'Hostel & Bunk Bed Stays in Central London | Interactive Bed Selection',
  description:
    'Book modern designer bunk beds and capsule pods in Central London from £28/night. Choose your exact upper or lower bed on our live airline-style graphical floorplan.',
  openGraph: {
    title: 'London Hostel & Bunk Bed Booking | Choose Your Bed on Live Map',
    description:
      'Stay in Central London from £28/night. Interactive bed selection, acoustic privacy curtains, USB-C power, electronic lockers, and flexible PayPal deposit.',
    url: `${BRAND.url}/hostel`,
    siteName: BRAND.name,
    locale: 'en_GB',
    type: 'website',
  },
  alternates: {
    canonical: `${BRAND.url}/hostel`,
  },
};

const HOSTEL_FAQS = [
  {
    q: 'How does the interactive bunk bed selection work?',
    a: 'Just like choosing a seat on an airline, our interactive graphical floorplan lets you browse every available bunk in each dormitory. You can inspect upper vs. lower bunks, window locations, quiet corners, and bedside amenities, then click to reserve your exact bed in real time.',
  },
  {
    q: 'What is the check-in and check-out time?',
    a: 'Check-in begins at 15:00 (3:00 PM) and check-out is by 11:00 AM. We offer early check-in and late check-out add-ons, plus secure complimentary luggage storage if you arrive early or wish to explore the city after checking out.',
  },
  {
    q: 'Are linens, duvets, and pillows provided?',
    a: 'Yes! Every bed comes freshly made with hotel-grade 100% Egyptian cotton sheets, an anti-allergy duvet, and two pillows. Fluffy bath towels can be rented during checkout or on arrival.',
  },
  {
    q: 'Can I pay a small deposit to secure my stay?',
    a: 'Yes. You can reserve your exact bed immediately with a flexible 20% deposit via PayPal, debit card, or credit card. The remaining balance can be settled prior to or upon arrival.',
  },
  {
    q: 'Are the dormitories secure?',
    a: 'Safety is our top priority. Access to each dormitory floor and room requires an electronic RFID keycard. Each bed comes with an assigned lockable under-bed trunk or electronic pod locker, and our team is on site 24/7.',
  },
  {
    q: 'Is there a female-only dormitory available?',
    a: 'Yes! We offer our Covent Garden Female Dorm (4 Beds) with restricted keycard access, ensuite marble bathroom, full-length vanity mirrors, and premium amenities exclusively for female travellers.',
  },
];

export default function HostelLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Hostel', 'LodgingBusiness'],
        '@id': `${BRAND.url}/hostel#hostel`,
        name: `${BRAND.name} Central London Hostel & Pods`,
        url: `${BRAND.url}/hostel`,
        telephone: BRAND.phone,
        email: BRAND.email,
        description:
          'Boutique designer hostel in Central London featuring airline-style interactive bunk bed selection, capsule sleeping pods, gigabit Wi-Fi, and 24/7 security.',
        priceRange: '£28 - £45',
        currenciesAccepted: 'GBP',
        paymentAccepted: 'Credit Card, Debit Card, PayPal, Cash',
        checkinTime: '15:00',
        checkoutTime: '11:00',
        petsAllowed: false,
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Free High-Speed Gigabit Wi-Fi', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Electronic Keycard Lockers', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Ensuite Showers', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning & Climate Control', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Acoustic Privacy Curtains', value: true },
          { '@type': 'LocationFeatureSpecification', name: '24/7 Front Desk & Security', value: true },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${BRAND.url}/hostel#faq`,
        mainEntity: HOSTEL_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-wash/50 via-white to-white pt-12 pb-20 border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1 text-sm font-semibold text-brand-strong border border-brand/20">
                <Sparkles className="size-4" aria-hidden />
                <span>Central London Designer Hostel · From £28/night</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink">
                Book the Comfort
              </h1>

              <p className="text-lg sm:text-xl text-muted max-w-2xl leading-relaxed">
                Choose your exact bed before you arrive. Pick upper or lower tiers, window views, or cosy quiet corners
                on our real-time interactive floorplan. Complete with privacy curtains, bedside power hubs, and electronic lockers.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/hostel/book"
                  className="inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-strong hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Bed className="size-5" aria-hidden />
                  <span>Choose Your Bed on Live Map</span>
                  <ChevronRight className="size-4" aria-hidden />
                </Link>

                <a
                  href="#rooms"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-4 text-base font-semibold text-ink shadow-sm hover:bg-soft transition"
                >
                  Explore Dorm Rooms
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line/80">
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                    <Check className="size-4" />
                  </div>
                  <span>Instant Bed Selection</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
                    <CreditCard className="size-4" />
                  </div>
                  <span>20% Deposit Option</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 shrink-0">
                    <Wifi className="size-4" />
                  </div>
                  <span>Free Gigabit Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span>24/7 Keycard Entry</span>
                </div>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-line bg-white p-6 shadow-2xl transition hover:shadow-brand/10">
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">Live Interactive Bunk Selector</span>
                    <h3 className="font-semibold text-ink text-base">Thames Mixed Dorm (Floor 1)</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    ● Real-Time Availability
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="rounded-2xl border border-dashed border-line bg-soft/60 p-4">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Bunk Group 1 · Window Side</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">Bed 1A</span>
                          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Top</span>
                        </div>
                        <p className="text-xs text-muted mt-1">Upper Bunk · Window View</p>
                        <p className="text-sm font-extrabold text-emerald-800 mt-2">£27 / night</p>
                        <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700">✓ Selected</span>
                      </div>

                      <div className="rounded-xl border border-line bg-white p-3 text-left opacity-60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">Bed 1B</span>
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">Bottom</span>
                        </div>
                        <p className="text-xs text-muted mt-1">Lower Bunk · Extra Storage</p>
                        <p className="text-sm font-semibold text-slate-500 mt-2">Occupied</p>
                        <span className="inline-block mt-2 text-[11px] text-slate-400">Reserved</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted px-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-emerald-500"></span> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-brand"></span> Selected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-slate-300"></span> Occupied
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-line">
                  <Link
                    href="/hostel/book"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <span>Launch Live Interactive Selector</span>
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Hostel */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">The Modern Hostel Experience</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">Everything you need for a restful stay in London</h2>
            <p className="text-muted text-base sm:text-lg">
              Designed for digital nomads, solo travellers, and budget-conscious adventurers who value hygiene, privacy, and speed.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-line p-6 hover:shadow-lg transition">
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong mb-4">
                <Compass className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Interactive Airline-Style Booking</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Know exactly where you sleep before you arrive. Inspect the floorplan, select upper or lower tiers, and reserve your favourite bed in real time.
              </p>
            </div>

            <div className="rounded-2xl border border-line p-6 hover:shadow-lg transition">
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong mb-4">
                <Moon className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Acoustic Privacy Curtains & Pods</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Sleep undisturbed. All bunks feature thick blackout acoustic curtains or sliding shutter doors, giving you private hotel-grade seclusion.
              </p>
            </div>

            <div className="rounded-2xl border border-line p-6 hover:shadow-lg transition">
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong mb-4">
                <Zap className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Personal Power & Reading Hub</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Keep all your devices powered. Every bunk is equipped with USB-A, fast USB-C ports, standard UK 230V plugs, and a warm dimmable reading light.
              </p>
            </div>

            <div className="rounded-2xl border border-line p-6 hover:shadow-lg transition">
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong mb-4">
                <Lock className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Electronic Keycard Lockers</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Rest easy knowing your backpack, laptop, and passport are protected in private RFID keycard-secured lockers assigned directly to your bed.
              </p>
            </div>

            <div className="rounded-2xl border border-line p-6 hover:shadow-lg transition">
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong mb-4">
                <Luggage className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Luggage Storage & Early Drop-off</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Arriving in London before 15:00 or have an evening flight? Drop your bags securely in our monitored luggage storage room and explore hands-free.
              </p>
            </div>

            <div className="rounded-2xl border border-line p-6 hover:shadow-lg transition">
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong mb-4">
                <CreditCard className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Secure PayPal & Card Checkout</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Connect with the same secure customer dashboard and payment gateway you already trust. Instant confirmation and receipt sent to your email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Showcase */}
      <section id="rooms" className="py-16 sm:py-24 bg-soft border-y border-line scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">Choose Your Vibe</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">Our Dormitory Rooms & Capsule Pods</h2>
            <p className="text-muted text-base sm:text-lg">
              Whether you want social energy, female-only serenity, or maximum capsule privacy, pick the room that matches your journey.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {HOSTEL_ROOMS_SEED.map((room) => {
              const badgeColors = {
                mixed: 'bg-blue-100 text-blue-800 border-blue-200',
                female: 'bg-rose-100 text-rose-800 border-rose-200',
                male: 'bg-slate-200 text-slate-800 border-slate-300',
                deluxe: 'bg-amber-100 text-amber-900 border-amber-300',
              }[room.type];

              const typeLabel = {
                mixed: 'Mixed Dormitory',
                female: 'Female-Only Dorm',
                male: 'Male-Only Dorm',
                deluxe: 'Deluxe Capsule Pods',
              }[room.type];

              return (
                <div
                  key={room.id}
                  className="rounded-3xl border border-line bg-white p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${badgeColors}`}>
                        {typeLabel}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-ink">{formatMoney(room.basePriceNight)}</span>
                        <span className="text-xs text-muted block">/ night per bed</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-ink">{room.name}</h3>
                    <p className="text-muted text-sm mt-3 leading-relaxed">{room.description}</p>

                    <div className="mt-6 pt-6 border-t border-line">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Room Highlights</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                        {room.features.slice(0, 6).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="size-4 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-muted font-medium">Floor {room.floor} · {room.capacity} Bunk Beds</span>
                    <Link
                      href={`/hostel/book?room=${room.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-strong transition"
                    >
                      <Bed className="size-4" />
                      <span>Select Bed in this Room</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">Common Questions</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">Everything you need to know before booking</h2>
            <p className="text-muted text-base">Quick answers about check-in, beds, security, and payments.</p>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {HOSTEL_FAQS.map((faq, index) => (
              <div key={index} className="py-6 space-y-2">
                <h3 className="text-lg font-bold text-ink flex items-start gap-3">
                  <span className="text-brand-strong shrink-0">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-muted text-sm sm:text-base pl-7 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-brand-wash p-6 text-center border border-brand/20">
            <h3 className="text-lg font-bold text-ink">Have a specific question or booking for a large group?</h3>
            <p className="text-sm text-muted mt-1">Our front desk team is ready to assist you anytime.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink border border-line shadow-sm hover:bg-soft"
              >
                Call {BRAND.phone}
              </a>
              <Link
                href="/hostel/book"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-strong"
              >
                Book Bunks Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating or Bottom Sticky Mobile Book Bar */}
      <div className="sticky bottom-0 z-30 lg:hidden border-t border-line bg-white/95 backdrop-blur p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-muted block">London Bunk Beds</span>
            <span className="font-bold text-ink text-sm">From £28 / night</span>
          </div>
          <Link
            href="/hostel/book"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-strong"
          >
            <Bed className="size-4" />
            <span>Choose Bed</span>
          </Link>
        </div>
      </div>
    </>
  );
}
