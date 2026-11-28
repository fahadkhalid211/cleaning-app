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
  Quote,
  RefreshCw,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react';
import { BRAND, formatMoney } from '@/lib/config';
import { getCatalog } from '@/lib/server/catalog';
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
      <section id="prices" className="scroll-mt-28 py-20">
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
    <div className={center ? 'text-center max-w-2xl mx-auto mb-12' : 'mb-8'}>
      <p className="font-semibold text-brand-strong uppercase tracking-wider text-[0.85rem] mb-3">
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl font-semibold">{title}</h2>
      {sub && <p className="mt-4 text-lg text-muted">{sub}</p>}
    </div>
  );
}

function Hero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  const h = dict.home.hero;
  return (
    <section className="relative overflow-hidden bg-cream/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-medium shadow-card">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-brand text-brand" aria-hidden />
              ))}
            </span>
            {h.lovedByFamilies}
          </p>
          <h1 className="mt-6 text-[2.6rem] sm:text-5xl lg:text-[3.6rem] font-semibold leading-[1.05]">
            {h.title} <span className="text-brand-strong">{h.titleHighlight}</span>
          </h1>
          <ul className="mt-7 space-y-3 text-lg">
            {h.bullets.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-white">
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link href={`/${locale}/book`} className={buttonClass('primary', 'lg', 'shadow-pop')}>
              {h.ctaBook} <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
          <p className="mt-4 text-muted">
            {dict.common.preferToTalk}{' '}
            <a href={BRAND.phoneHref} className="font-semibold text-ink underline underline-offset-4">
              {BRAND.phone}
            </a>
          </p>
        </div>

        <HeroVisual dict={dict} />
      </div>
    </section>
  );
}

function HeroVisual({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const h = dict.home.hero;
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hoodie.jpg"
        width={5818}
        height={3879}
        alt={h.imgAlt}
        fetchPriority="high"
        className="relative w-full aspect-[4/3] object-cover rounded-3xl shadow-pop"
      />
      <div className="absolute -left-3 sm:-left-6 -bottom-6 rounded-2xl bg-white px-5 py-4 shadow-pop flex items-center gap-3">
        <CircleCheck className="size-7 text-success" aria-hidden />
        <div>
          <p className="font-semibold">{h.noCardNeeded}</p>
          <p className="text-sm text-muted">{h.payAfter}</p>
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
    <section className="border-b border-line bg-white">
      <ul className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon className="size-7 shrink-0 text-brand-strong" aria-hidden />
            <div>
              <p className="font-semibold">{title}</p>
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
    <>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => {
          const trans = serviceTranslations[s.id] || { title: s.title, desc: s.description, short: s.short };
          return (
            <li key={s.id}>
              <Link
                href={`/${locale}/book?service=${s.id}`}
                className="group flex h-full flex-col rounded-card border border-line bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-pop"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand-strong group-hover:bg-brand group-hover:text-white transition-colors">
                    <ServiceIcon name={s.icon} className="size-7" />
                  </span>
                  {i === 0 && (
                    <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-brand-deep">
                      {dict.common.mostPopular}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{trans.title}</h3>
                <p className="mt-1.5 text-muted flex-1">{trans.description || s.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <p>
                    <span className="text-muted">{dict.common.from} </span>
                    <span className="text-xl font-semibold">{formatMoney(s.hourlyRate)}</span>
                    <span className="text-muted">{dict.common.perHour}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-strong">
                    {dict.home.servicesSection.bookService}{' '}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        <li className="rounded-card bg-ink text-white p-6 flex flex-col">
          <h3 className="text-xl font-semibold">{dict.home.servicesSection.popularExtras}</h3>
          <ul className="mt-4 space-y-2.5 flex-1">
            {addons.slice(0, 5).map((a) => {
              const name = addonTranslations[a.id]?.name || a.name;
              return (
                <li key={a.id} className="flex justify-between gap-4">
                  <span className="text-white/85">{name}</span>
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
    </>
  );
}

function ServicesSkeleton() {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="h-72 rounded-card bg-soft animate-pulse" />
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
    <section id="how-it-works" className="scroll-mt-28 py-20 bg-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={hw.eyebrow} title={hw.title} />
        <ol className="grid md:grid-cols-3 gap-6">
          {hw.steps.map((s, i) => (
            <li key={s.title} className="rounded-card bg-white p-7 shadow-card">
              <span className="flex size-12 items-center justify-center rounded-full bg-brand text-white text-xl font-semibold">
                {i + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted text-base leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
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
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeading eyebrow={w.eyebrow} title={w.title} center={false} />
          <ul className="space-y-4">
            {w.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-lg">
                <BadgeCheck className="size-6 shrink-0 text-success mt-0.5" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-cream/70 p-8 sm:p-10">
          <div className="grid grid-cols-2 gap-4">
            {w.badges.map(({ label }, idx) => {
              const Icon = icons[idx % icons.length];
              return (
                <div key={label} className="rounded-2xl bg-white p-6 shadow-card">
                  <Icon className="size-8 text-brand-strong" aria-hidden />
                  <p className="mt-4 font-semibold text-lg leading-snug">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const rSection = dict.home.reviewsSection;
  return (
    <section className="py-20 bg-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={rSection.eyebrow} title={rSection.title} />
        <ul className="grid md:grid-cols-3 gap-6">
          {rSection.reviews.map((r) => (
            <li key={r.name} className="rounded-card bg-white p-7 shadow-card flex flex-col">
              <Quote className="size-8 text-brand" aria-hidden />
              <div className="mt-3 flex" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-5 fill-brand text-brand" aria-hidden />
                ))}
              </div>
              <h3 className="mt-3 text-xl font-semibold">{r.title}</h3>
              <p className="mt-2 text-muted text-base leading-relaxed flex-1">{r.text}</p>
              <p className="mt-5 font-semibold text-ink">{r.name}</p>
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
    <section id="faq" className="scroll-mt-28 py-20 bg-soft">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow={fSection.eyebrow} title={fSection.title} />
        <div className="space-y-3">
          {fSection.faqs.map((f) => (
            <details key={f.q} className="group rounded-card bg-white shadow-card open:shadow-pop">
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-lg font-semibold">
                {f.q}
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-xl transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 -mt-1 text-base text-muted leading-relaxed">{f.a}</p>
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
