import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import {
  ArrowRight,
  BadgeCheck,
  Bed,
  CalendarClock,
  Check,
  CircleCheck,
  Leaf,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react';
import { BRAND, formatMoney } from '@/lib/config';
import { getCatalog } from '@/lib/server/catalog';
import { SERVICE_SEED } from '@/lib/catalog-seed';
import { ServiceIcon } from '@/components/ServiceIcon';
import { buttonClass } from '@/components/styles';
import { getDictionary, type Locale } from '@/lib/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.home.metaTitle,
    description: dict.home.metaDesc,
    alternates: {
      canonical: `${BRAND.url}/${locale === 'cn' ? 'cn' : 'en'}`,
      languages: {
        en: `${BRAND.url}/en`,
        zh: `${BRAND.url}/cn`,
        'zh-CN': `${BRAND.url}/cn`,
      },
    },
    openGraph: {
      title: dict.home.metaTitle,
      description: dict.home.metaDesc,
      url: `${BRAND.url}/${locale === 'cn' ? 'cn' : 'en'}`,
      locale: locale === 'cn' ? 'zh_CN' : 'en_GB',
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = locale === 'cn' ? 'cn' : 'en';
  const dict = getDictionary(validLocale);

  return (
    <>
      <Hero locale={validLocale} dict={dict} />
      <TrustStrip dict={dict} />
      <section id="prices" className="scroll-mt-28 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={dict.home.servicesSection.eyebrow}
            title={dict.home.servicesSection.title}
            sub={dict.home.servicesSection.sub}
          />
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesGrid locale={validLocale} dict={dict} />
          </Suspense>
        </div>
      </section>
      <HowItWorks locale={validLocale} dict={dict} />
      <WhyUs dict={dict} />
      <Reviews dict={dict} />
      <Faq dict={dict} />
      <ClosingCta locale={validLocale} dict={dict} />
      <MobileBookBar locale={validLocale} dict={dict} />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  center = true,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'text-center max-w-2xl mx-auto mb-14' : 'mb-10'}>
      <p className="font-bold text-brand-strong uppercase tracking-[0.14em] text-xs mb-4">{eyebrow}</p>
      <h2 className="text-4xl sm:text-5xl font-bold">{title}</h2>
      {sub && <p className="mt-5 text-lg text-muted">{sub}</p>}
    </div>
  );
}

const MIN_RATE = Math.min(...SERVICE_SEED.map((s) => s.hourlyRate));

function Hero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  const h = dict.home.hero;
  const stats = [
    { value: formatMoney(MIN_RATE), label: h.statFrom },
    { value: '2', label: h.statBook },
    { value: '72', label: h.statGuarantee },
  ];
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--color-brand-tint),transparent_60%),linear-gradient(180deg,#fff,var(--color-soft))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            {h.eyebrow}
          </p>
          <h1 className="mt-6 text-[2.8rem] sm:text-6xl lg:text-[4.4rem] font-bold leading-[1.02]">
            {h.title} <span className="text-brand-strong">{h.titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-xl text-xl text-muted leading-relaxed">{h.sub}</p>

          <p className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-card">
            <span className="flex" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              ))}
            </span>
            <span className="text-sm font-semibold">{h.lovedByFamilies}</span>
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href={`/${locale}/book`} className={buttonClass('primary', 'lg')}>
              {h.ctaBook} <ArrowRight className="size-5" aria-hidden />
            </Link>
            <a href={BRAND.phoneHref} className={buttonClass('secondary', 'lg', 'border-transparent shadow-card')}>
              <Phone className="size-5" aria-hidden /> {BRAND.phone}
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] text-muted">
            {h.bullets.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-4 text-brand-strong" strokeWidth={3} aria-hidden />
                {t}
              </li>
            ))}
          </ul>

          <dl className="mt-10 pt-8 border-t border-line grid grid-cols-3 gap-4 max-w-lg">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-3xl sm:text-4xl font-bold tracking-tight">{s.value}</dd>
                <dd className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroVisual dict={dict} />
      </div>
    </section>
  );
}

function HeroVisual({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const h = dict.home.hero;
  const service = dict.servicesCatalog?.regular?.title || SERVICE_SEED[0].title;
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none pb-44 sm:pb-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hoodie.jpg"
        width={5818}
        height={3879}
        alt={h.imgAlt}
        fetchPriority="high"
        className="w-full aspect-[4/3] sm:aspect-[5/4] object-cover rounded-[2rem]"
      />

      {/* Booking preview card */}
      <div className="absolute bottom-0 sm:bottom-8 left-3 right-3 sm:left-auto sm:-right-4 sm:w-80 rounded-3xl bg-white p-5 shadow-pop border-l-4 border-success">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 font-semibold text-success">
            <CircleCheck className="size-4" aria-hidden /> {h.previewConfirmed}
          </span>
          <span className="text-muted">{h.previewWhen}</span>
        </div>
        <p className="mt-3 text-lg font-bold">{service}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="text-muted uppercase text-xs font-semibold tracking-wider">{h.previewCleaner}</dt>
            <dd className="font-semibold inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-brand-strong" aria-hidden /> {h.previewCleanerName}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="text-muted uppercase text-xs font-semibold tracking-wider">{h.previewIncludes}</dt>
            <dd className="font-semibold text-right">{h.previewIncludesValue}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="text-muted uppercase text-xs font-semibold tracking-wider">{h.previewTotal}</dt>
            <dd className="font-bold text-brand-strong">{h.noCardNeeded}</dd>
          </div>
        </dl>
      </div>

      {/* Small floating badge */}
      <div className="hidden sm:flex absolute top-6 -left-6 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-pop">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand-strong">
          <RefreshCw className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-semibold leading-tight">{dict.home.trust.guarantee}</p>
          <p className="text-xs text-muted">{dict.home.trust.guaranteeDesc}</p>
        </div>
      </div>
    </div>
  );
}

function TrustStrip({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const t = dict.home.trust;
  const items = [
    { icon: ShieldCheck, title: t.vetted, text: t.vettedDesc },
    { icon: Wallet, title: t.fixed, text: t.fixedDesc },
    { icon: RefreshCw, title: t.guarantee, text: t.guaranteeDesc },
    { icon: CalendarClock, title: t.flexible, text: t.flexibleDesc },
  ];
  return (
    <section className="bg-white">
      <ul className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand-strong">
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="text-[0.95rem] text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function ServicesGrid({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  await connection();
  const { services, addons } = getCatalog();

  const serviceTranslations = dict.servicesCatalog;
  const addonTranslations = dict.addonsCatalog;

  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((s, i) => {
        const trans = serviceTranslations[s.id] || { title: s.title, description: s.description, short: s.short };
        return (
          <li key={s.id}>
            <Link
              href={`/${locale}/book?service=${s.id}`}
              className="group flex h-full flex-col rounded-card border border-line bg-white p-7 transition hover:-translate-y-1 hover:shadow-pop"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand-strong transition-colors group-hover:bg-brand-strong group-hover:text-white">
                  <ServiceIcon name={s.icon} className="size-7" />
                </span>
                {i === 0 && (
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {dict.common.mostPopular}
                  </span>
                )}
              </div>
              <h3 className="mt-6 text-2xl font-bold">{trans.title}</h3>
              <p className="mt-2 text-muted flex-1 leading-relaxed">{trans.description || s.description}</p>
              <div className="mt-6 flex items-end justify-between gap-3">
                <p>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">{dict.common.from}</span>
                  <span className="text-3xl font-bold">{formatMoney(s.hourlyRate)}</span>
                  <span className="text-muted">{dict.common.perHour}</span>
                </p>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-soft px-4 py-2 font-semibold transition group-hover:bg-ink group-hover:text-white"
                >
                  {dict.home.servicesSection.bookService} <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
      <li className="rounded-card bg-ink text-white p-7 flex flex-col">
        <h3 className="text-2xl font-bold">{dict.home.servicesSection.popularExtras}</h3>
        <ul className="mt-5 divide-y divide-white/10 flex-1">
          {addons.slice(0, 5).map((a) => {
            const name = addonTranslations[a.id]?.name || a.name;
            return (
              <li key={a.id} className="flex justify-between gap-4 py-2.5">
                <span className="text-white/80">{name}</span>
                <span className="font-semibold">{formatMoney(a.price)}</span>
              </li>
            );
          })}
        </ul>
        <Link href={`/${locale}/book`} className={buttonClass('primary', 'md', 'mt-6')}>
          {dict.home.servicesSection.getPrice}
        </Link>
      </li>
    </ul>
  );
}

function ServicesSkeleton() {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="h-80 rounded-card bg-soft animate-pulse" />
      ))}
    </ul>
  );
}

function HowItWorks({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  const hw = dict.home.howItWorksSection;
  return (
    <section id="how-it-works" className="scroll-mt-28 py-24 bg-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={hw.eyebrow} title={hw.title} />
        <ol className="grid md:grid-cols-3 gap-6">
          {hw.steps.map((s, i) => (
            <li key={s.title} className="rounded-card bg-white p-8">
              <span className="block text-6xl font-bold text-brand-strong/20 leading-none" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 text-2xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <Link href={`/${locale}/book`} className={buttonClass('primary', 'lg')}>
            {hw.ctaBook} <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhyUs({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const w = dict.home.whyUsSection;
  const icons = [ShieldCheck, Leaf, Wallet, RefreshCw];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={w.eyebrow} title={w.title} />
        <ul className="grid sm:grid-cols-2 gap-6">
          {w.badges.map(({ label }, idx) => {
            const Icon = icons[idx % icons.length];
            const point = w.points[idx];
            return (
              <li key={label} className="relative overflow-hidden rounded-card border border-line bg-white p-8">
                <span
                  className="pointer-events-none absolute -top-3 right-5 text-[7rem] font-bold leading-none text-brand/[0.08]"
                  aria-hidden
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="relative flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),#c2365f)] text-white shadow-[0_8px_20px_rgb(201_74_36/0.25)]">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="relative mt-6 text-2xl font-bold">{label}</h3>
                {point && <p className="relative mt-2 text-muted leading-relaxed">{point}</p>}
              </li>
            );
          })}
        </ul>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {w.points.slice(w.badges.length).map((p) => (
            <li key={p} className="inline-flex items-center gap-2 rounded-full bg-soft px-4 py-2 text-[0.95rem]">
              <BadgeCheck className="size-4 text-success" aria-hidden /> {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const rSection = dict.home.reviewsSection;
  return (
    <section className="py-24 bg-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={rSection.eyebrow} title={rSection.title} />
        <ul className="grid md:grid-cols-3 gap-6">
          {rSection.reviews.map((r) => (
            <li key={r.name} className="rounded-card bg-white p-8 flex flex-col">
              <div className="flex" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-5 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <h3 className="mt-4 text-xl font-bold">{r.title}</h3>
              <p className="mt-2 text-muted leading-relaxed flex-1">{r.text}</p>
              <p className="mt-6 flex items-center gap-3 font-semibold">
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-brand-strong font-bold">
                  {r.name.charAt(0)}
                </span>
                {r.name}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const fSection = dict.home.faqSection;
  return (
    <section id="faq" className="scroll-mt-28 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow={fSection.eyebrow} title={fSection.title} />
        <div className="space-y-3">
          {fSection.faqs.map((f) => (
            <details key={f.q} className="group rounded-3xl border-2 border-line bg-white transition-colors open:border-ink">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-lg font-bold">
                {f.q}
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-xl transition group-open:rotate-45 group-open:bg-ink group-open:text-white"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 -mt-1 text-muted leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  const c = dict.home.commercialSection;
  return (
    <section id="contact" className="scroll-mt-28 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
        <div className="rounded-3xl bg-brand-strong px-6 py-14 sm:px-14 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-semibold">{c.readyTitle}</h2>
          <p className="mt-4 text-lg text-white/90">{c.readySub}</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link href={`/${locale}/book`} className={buttonClass('dark', 'lg')}>
              {dict.home.hero.ctaBook}
            </Link>
            <a href={BRAND.phoneHref} className={buttonClass('secondary', 'lg', 'border-white/0')}>
              <Phone className="size-5" aria-hidden /> {dict.common.callUs} {BRAND.phone}
            </a>
          </div>
        </div>

        {/* Commercial & Cleaner Opportunity Section */}
        <div id="business" className="scroll-mt-28 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-line bg-white p-8 shadow-card flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
                {c.businessBadge}
              </span>
              <h3 className="mt-4 text-2xl font-semibold">{c.businessTitle}</h3>
              <p className="mt-2 text-muted leading-relaxed">{c.businessDesc}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={BRAND.phoneHref} className={buttonClass('secondary', 'md')}>
                <Phone className="size-4" aria-hidden /> {c.businessCall}
              </a>
              <a
                href={`mailto:${BRAND.email}?subject=Commercial%20Cleaning%20Enquiry`}
                className={buttonClass('ghost', 'md')}
              >
                {c.businessEmail}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-8 shadow-card flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-deep">
                {c.cleanerBadge}
              </span>
              <h3 className="mt-4 text-2xl font-semibold">{c.cleanerTitle}</h3>
              <p className="mt-2 text-muted leading-relaxed">{c.cleanerDesc}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cleaner/signup" className={buttonClass('primary', 'md')}>
                {c.cleanerSignUp}
              </Link>
              <Link href="/cleaner/login" className={buttonClass('secondary', 'md')}>
                {c.cleanerLoginBtn}
              </Link>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-line bg-white p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <Bed className="size-3.5" aria-hidden /> {c.staffStayBadge}
              </span>
              <h3 className="mt-4 text-2xl font-semibold">{c.staffStayTitle}</h3>
              <p className="mt-2 text-muted leading-relaxed">{c.staffStayDesc}</p>
            </div>
            <Link
              href={`/cleaner/login?next=${encodeURIComponent(`/${locale}/hostel/book`)}`}
              className={buttonClass('primary', 'md', 'shrink-0')}
            >
              {c.staffStayBtn}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileBookBar({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  return (
    <div className="sm:hidden sticky bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur p-3">
      <Link href={`/${locale}/book`} className={buttonClass('primary', 'lg', 'w-full')}>
        {dict.home.mobileBar.bookAClean}
      </Link>
    </div>
  );
}
