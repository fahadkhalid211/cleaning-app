import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bed,
  Check,
  Compass,
  CreditCard,
  Lock,
  Luggage,
  Moon,
  ShieldCheck,
  Wifi,
  Zap,
} from 'lucide-react';
import { BRAND, formatMoney } from '@/lib/config';
import { HOSTEL_ROOMS_SEED } from '@/lib/hostel-seed';
import { getDictionary, type Locale } from '@/lib/i18n';
import { HostelSearchBar } from '@/components/hostel/HostelSearchBar';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.hostel.metaTitle,
    description: dict.hostel.metaDesc,
    robots: { index: false, follow: false },
  };
}

// Big black label on a yellow/white surface, like a hand-stuck sticker.
function Tag({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block bg-ink px-2 py-0.5 text-sm font-bold text-white leading-snug ${className}`}>
      {children}
    </span>
  );
}

const ROOM_SURFACE: Record<string, string> = {
  mixed: 'bg-hostel',
  female: 'bg-[#ffb8c9]',
  male: 'bg-[#b9d7ff]',
  deluxe: 'bg-ink text-white',
};

export default async function HostelLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = locale === 'cn' ? 'cn' : 'en';
  const dict = getDictionary(validLocale);
  const h = dict.hostel;

  const experienceIcons = [Compass, Moon, Zap, Lock, Luggage, CreditCard];
  const highlights = [
    { icon: Check, text: h.hero.highlights.instantSelection },
    { icon: CreditCard, text: h.hero.highlights.depositOption },
    { icon: Wifi, text: h.hero.highlights.gigabitWifi },
    { icon: ShieldCheck, text: h.hero.highlights.keycardEntry },
  ];
  const fromPrice = Math.min(...HOSTEL_ROOMS_SEED.map((r) => r.basePriceNight));

  return (
    <div className="bg-white">
      {/* Hero: black stage, yellow highlight, one booking bar */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full bg-hostel/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16 lg:pt-24 lg:pb-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-hostel/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-hostel">
            <Bed className="size-4" aria-hidden /> {h.hero.badge}
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold leading-[0.95]">
            {h.hero.title}{' '}
            <span className="inline-block -rotate-2 rounded-xl bg-hostel px-3 text-ink">
              {validLocale === 'cn' ? '伦敦' : 'in London'}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/75 leading-relaxed">{h.hero.desc}</p>

          <div className="mt-10">
            <HostelSearchBar
              ctaLabel={validLocale === 'cn' ? '立即预订' : 'Book now'}
              locationLabel={validLocale === 'cn' ? '伦敦市中心' : 'Central London'}
            />
          </div>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {highlights.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
              >
                <Icon className="size-4 text-hostel" aria-hidden /> {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Rooms: chunky cards */}
      <section id="rooms" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/60">{h.rooms.eyebrow}</p>
              <h2 className="mt-3 text-4xl sm:text-6xl font-extrabold">{h.rooms.title}</h2>
              <p className="mt-4 text-lg text-muted">{h.rooms.sub}</p>
            </div>
            <p className="rounded-2xl bg-hostel-soft px-5 py-3 font-bold">
              {dict.common.from} <span className="text-2xl">{formatMoney(fromPrice)}</span> {dict.common.perNight}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {HOSTEL_ROOMS_SEED.map((room) => {
              const typeLabel = h.rooms.types[room.type] || room.type;
              const roomTrans = h.rooms.items[room.id] || h.rooms.items[room.slug];
              const r = roomTrans
                ? { name: roomTrans.name, description: roomTrans.description, features: roomTrans.features }
                : room;
              const surface = ROOM_SURFACE[room.type] || 'bg-hostel';

              return (
                <article
                  key={room.id}
                  className="group flex flex-col rounded-[2rem] bg-white p-4 shadow-[0_10px_40px_rgb(0_0_0/0.08)] ring-1 ring-black/5 transition hover:-translate-y-1"
                >
                  {/* Colour "photo" panel */}
                  <div className={`relative overflow-hidden rounded-[1.5rem] ${surface} p-6 sm:p-7 min-h-56 flex flex-col justify-between`}>
                    <Bed
                      className="absolute -right-6 -bottom-8 size-48 opacity-15 transition-transform group-hover:scale-110"
                      aria-hidden
                    />
                    <div className="flex items-start justify-between gap-3">
                      <Tag>{typeLabel}</Tag>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-ink">
                        {formatMoney(room.basePriceNight)}
                        <span className="font-semibold text-ink/60"> {dict.common.perNight}</span>
                      </span>
                    </div>
                    <div className="relative">
                      <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight">{r.name}</h3>
                      <div className="mt-2">
                        <Tag>
                          {h.rooms.floorPrefix} {room.floor} · {room.capacity} {h.rooms.bunkBedsCount}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 px-3 pt-6 pb-2">
                    <p className="text-muted leading-relaxed">{r.description}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {r.features.slice(0, 6).map((feat) => (
                        <li key={feat} className="rounded-full bg-soft px-3 py-1.5 text-sm font-medium">
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-3 pt-4 pb-2">
                    <Link
                      href={`/${validLocale}/hostel/book?room=${room.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-extrabold italic uppercase tracking-tight text-hostel transition hover:bg-black"
                    >
                      {h.rooms.selectBedBtn} <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience: black story panel */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-ink text-white px-6 py-16 sm:px-12 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-hostel">{h.experience.eyebrow}</p>
            <h2 className="mt-3 text-4xl sm:text-6xl font-extrabold">{h.experience.title}</h2>
            <p className="mt-4 text-lg text-white/70">{h.experience.sub}</p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {h.experience.cards.map((card, idx) => {
              const Icon = experienceIcons[idx % experienceIcons.length];
              return (
                <li key={card.title} className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-hostel text-ink">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{card.title}</h3>
                  <p className="mt-2 text-white/65 leading-relaxed">{card.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* FAQ: pill accordions next to a giant heading */}
      <section id="faq" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-3 order-2 lg:order-1">
            {h.faqs.list.map((faq) => (
              <details key={faq.q} className="group rounded-[2rem] border-2 border-ink bg-white open:bg-hostel-soft">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-lg font-bold">
                  {faq.q}
                  <span className="text-3xl leading-none transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 -mt-1 text-ink/75 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-[1.02]">
              <span className="text-ink/15">{h.faqs.eyebrow}</span>
              <br />
              {h.faqs.title}
            </h2>
            <p className="mt-5 text-lg text-muted">{h.faqs.sub}</p>
            <div className="mt-8 rounded-3xl bg-hostel p-6">
              <h3 className="text-xl font-extrabold">{h.faqs.groupTitle}</h3>
              <p className="mt-1 text-ink/75">{h.faqs.groupSub}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/${validLocale}/hostel/book`}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-extrabold italic uppercase tracking-tight text-hostel hover:bg-black"
                >
                  {h.faqs.bookOnlineBtn}
                </Link>
                <a
                  href={BRAND.phoneHref}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-3 font-bold hover:bg-white/40"
                >
                  {dict.common.callUs} {BRAND.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile book bar */}
      <div className="sticky bottom-0 z-30 lg:hidden bg-hostel p-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70 block">{h.mobileBar.label}</span>
            <span className="font-extrabold">
              {formatMoney(fromPrice)} {dict.common.perNight}
            </span>
          </div>
          <Link
            href={`/${validLocale}/hostel/book`}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-extrabold italic uppercase text-hostel"
          >
            {h.mobileBar.chooseBed}
          </Link>
        </div>
      </div>
    </div>
  );
}
