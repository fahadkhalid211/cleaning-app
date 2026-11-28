import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bed,
  Check,
  ChevronRight,
  Compass,
  CreditCard,
  Lock,
  Luggage,
  Moon,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';
import { BRAND, formatMoney } from '@/lib/config';
import { HOSTEL_ROOMS_SEED } from '@/lib/hostel-seed';
import { getDictionary, type Locale } from '@/lib/i18n';

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

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-wash/50 via-white to-white pt-12 pb-20 border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1 text-sm font-semibold text-brand-strong border border-brand/20">
                <Sparkles className="size-4" aria-hidden />
                <span>{h.hero.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink">
                {h.hero.title}
              </h1>

              <p className="text-lg sm:text-xl text-muted max-w-2xl leading-relaxed">
                {h.hero.desc}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/${validLocale}/hostel/book`}
                  className="inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-strong hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Bed className="size-5" aria-hidden />
                  <span>{h.hero.ctaLiveMap}</span>
                  <ChevronRight className="size-4" aria-hidden />
                </Link>

                <a
                  href="#rooms"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-4 text-base font-semibold text-ink shadow-sm hover:bg-soft transition"
                >
                  {h.hero.ctaExploreRooms}
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line/80">
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                    <Check className="size-4" />
                  </div>
                  <span>{h.hero.highlights.instantSelection}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
                    <CreditCard className="size-4" />
                  </div>
                  <span>{h.hero.highlights.depositOption}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 shrink-0">
                    <Wifi className="size-4" />
                  </div>
                  <span>{h.hero.highlights.gigabitWifi}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span>{h.hero.highlights.keycardEntry}</span>
                </div>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-line bg-white p-6 shadow-2xl transition hover:shadow-brand/10">
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">
                      {h.preview.tag}
                    </span>
                    <h3 className="font-semibold text-ink text-base">{h.preview.dormName}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    {h.preview.realtimeAvailability}
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="rounded-2xl border border-dashed border-line bg-soft/60 p-4">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      {h.preview.group1Title}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">{h.preview.bed1aTitle}</span>
                          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                            {h.preview.topBadge}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-1">{h.preview.upperWindow}</p>
                        <p className="text-sm font-extrabold text-emerald-800 mt-2">£28 {dict.common.perNight}</p>
                        <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700">
                          {h.preview.selectedBadge}
                        </span>
                      </div>

                      <div className="rounded-xl border border-line bg-white p-3 text-left opacity-60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">{h.preview.bed1bTitle}</span>
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                            {h.preview.bottomBadge}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-1">{h.preview.lowerStorage}</p>
                        <p className="text-sm font-semibold text-slate-500 mt-2">{h.preview.occupiedBadge}</p>
                        <span className="inline-block mt-2 text-[11px] text-slate-400">
                          {h.preview.reservedText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted px-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-emerald-500"></span> {h.preview.legendAvailable}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-brand"></span> {h.preview.legendSelected}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-slate-300"></span> {h.preview.legendOccupied}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-line">
                  <Link
                    href={`/${validLocale}/hostel/book`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <span>{h.preview.launchSelector}</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">
              {h.experience.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">{h.experience.title}</h2>
            <p className="text-muted text-base sm:text-lg">{h.experience.sub}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {h.experience.cards.map((card, idx) => {
              const Icon = experienceIcons[idx % experienceIcons.length];
              return (
                <div key={card.title} className="rounded-2xl border border-line p-6 hover:shadow-lg transition">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong mb-4">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">{card.title}</h3>
                  <p className="text-muted text-sm mt-2 leading-relaxed">{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rooms Showcase */}
      <section id="rooms" className="py-16 sm:py-24 bg-soft border-y border-line scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">
              {h.rooms.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">{h.rooms.title}</h2>
            <p className="text-muted text-base sm:text-lg">{h.rooms.sub}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {HOSTEL_ROOMS_SEED.map((room) => {
              const badgeColors = {
                mixed: 'bg-blue-100 text-blue-800 border-blue-200',
                female: 'bg-rose-100 text-rose-800 border-rose-200',
                male: 'bg-slate-200 text-slate-800 border-slate-300',
                deluxe: 'bg-amber-100 text-amber-900 border-amber-300',
              }[room.type];

              const typeLabel = h.rooms.types[room.type] || room.type;
              const roomTrans = h.rooms.items[room.id] || h.rooms.items[room.slug];
              const localizedRoom = roomTrans
                ? {
                    name: roomTrans.name,
                    description: roomTrans.description,
                    features: roomTrans.features,
                  }
                : room;

              return (
                <div
                  key={room.id}
                  className="rounded-3xl border border-line bg-white p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${badgeColors}`}
                      >
                        {typeLabel}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-ink">
                          {formatMoney(room.basePriceNight)}
                        </span>
                        <span className="text-xs text-muted block">{dict.common.perNightPerBed}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-ink">{localizedRoom.name}</h3>
                    <p className="text-muted text-sm mt-3 leading-relaxed">{localizedRoom.description}</p>

                    <div className="mt-6 pt-6 border-t border-line">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
                        {h.rooms.highlightsHeading}
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                        {localizedRoom.features.slice(0, 6).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="size-4 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-muted font-medium">
                      {h.rooms.floorPrefix} {room.floor} · {room.capacity} {h.rooms.bunkBedsCount}
                    </span>
                    <Link
                      href={`/${validLocale}/hostel/book?room=${room.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-strong transition"
                    >
                      <Bed className="size-4" />
                      <span>{h.rooms.selectBedBtn}</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">
              {h.faqs.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">{h.faqs.title}</h2>
            <p className="text-muted text-base">{h.faqs.sub}</p>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {h.faqs.list.map((faq, index) => (
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
            <h3 className="text-lg font-bold text-ink">{h.faqs.groupTitle}</h3>
            <p className="text-sm text-muted mt-1">{h.faqs.groupSub}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink border border-line shadow-sm hover:bg-soft"
              >
                {dict.common.callUs} {BRAND.phone}
              </a>
              <Link
                href={`/${validLocale}/hostel/book`}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-strong"
              >
                {h.faqs.bookOnlineBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating or Bottom Sticky Mobile Book Bar */}
      <div className="sticky bottom-0 z-30 lg:hidden border-t border-line bg-white/95 backdrop-blur p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-muted block">{h.mobileBar.label}</span>
            <span className="font-bold text-ink text-sm">£28 {dict.common.perNight}</span>
          </div>
          <Link
            href={`/${validLocale}/hostel/book`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-strong"
          >
            <Bed className="size-4" />
            <span>{h.mobileBar.chooseBed}</span>
          </Link>
        </div>
      </div>
    </>
  );
}
