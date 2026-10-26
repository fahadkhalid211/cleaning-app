import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import {
  ArrowRight,
  BadgeCheck,
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

// Sample reviews for layout. Replace with real, verifiable customer reviews before launch.
const REVIEWS = [
  { name: 'Margaret', title: 'So easy, even for me', text: 'I booked over the phone the first time and online the second. The cleaner was punctual, polite and left the kitchen sparkling.' },
  { name: 'David', title: 'Got our full deposit back', text: 'End of tenancy clean before we moved out. The letting agent had nothing to flag. Worth every penny.' },
  { name: 'Priya', title: 'Same lovely cleaner every fortnight', text: 'Moving a booking takes ten seconds in my account. I know exactly who is coming and what it costs.' },
];

const FAQS = [
  { q: 'Do I need to pay when I book?', a: 'No. You do not enter any card details to book. You pay once the clean is finished.' },
  { q: 'Can I change or cancel my booking?', a: 'Yes, free of charge, up to 24 hours before your clean. Log in to your account and press "Change date or time" or "Cancel booking". Or simply call us.' },
  { q: 'Do I need to be at home?', a: 'Not at all. Many customers leave a key in a key safe or with a neighbour or concierge. Tell us how to get in when you book. Only your cleaner and our team can see it.' },
  { q: 'Are your cleaners vetted and insured?', a: 'Every cleaner is interviewed in person, reference-checked and covered by our insurance while working in your home.' },
  { q: 'Do I need to provide cleaning products?', a: 'Please leave out your usual products, a hoover and a mop. If you prefer, add our eco-friendly products when you book.' },
  { q: 'What if I am not happy with the clean?', a: 'Tell us within 72 hours and we will come back and re-clean the areas you are not happy with, free of charge.' },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <section id="prices" className="scroll-mt-28 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Our services" title="What can we clean for you?" sub="Choose a service to see your exact price. No hidden fees, ever." />
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesGrid />
          </Suspense>
        </div>
      </section>
      <HowItWorks />
      <WhyUs />
      <Reviews />
      <Faq />
      <ClosingCta />
      <MobileBookBar />
    </>
  );
}

function SectionHeading({ eyebrow, title, sub, center = true }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center max-w-2xl mx-auto mb-12' : 'mb-8'}>
      <p className="font-semibold text-brand-strong uppercase tracking-wider text-[0.85rem] mb-3">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-semibold">{title}</h2>
      {sub && <p className="mt-4 text-lg text-muted">{sub}</p>}
    </div>
  );
}

function Hero() {
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
            Loved by families
          </p>
          <h1 className="mt-6 text-[2.6rem] sm:text-5xl lg:text-[3.6rem] font-semibold leading-[1.05]">
            A spotless home, <span className="text-brand-strong">without the hassle.</span>
          </h1>
          <ul className="mt-7 space-y-3 text-lg">
            {['Trusted, vetted and insured cleaners', 'Fixed price shown before you book', 'Book in 2 minutes. Pay after the clean'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-white">
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link href="/book" className={buttonClass('primary', 'lg', 'shadow-pop')}>
              Book a clean <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
          <p className="mt-4 text-muted">
            Prefer to talk?{' '}
            <a href={BRAND.phoneHref} className="font-semibold text-ink underline underline-offset-4">
              Call {BRAND.phone}
            </a>
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hoodie.jpg"
        width={5818}
        height={3879}
        alt="Professional cleaner ready for home cleaning"
        fetchPriority="high"
        className="relative w-full aspect-[4/3] object-cover rounded-3xl shadow-pop"
      />
      <div className="absolute -left-3 sm:-left-6 -bottom-6 rounded-2xl bg-white px-5 py-4 shadow-pop flex items-center gap-3">
        <CircleCheck className="size-7 text-success" aria-hidden />
        <div>
          <p className="font-semibold">No card needed</p>
          <p className="text-sm text-muted">Pay after the clean</p>
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, title: 'Vetted & insured', text: 'Interviewed and reference-checked' },
    { icon: Wallet, title: 'Fixed prices', text: 'You see the total before booking' },
    { icon: RefreshCw, title: 'Free re-clean', text: 'Not happy? We come back' },
    { icon: CalendarClock, title: 'Easy changes', text: 'Move or cancel up to 24h before' },
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

async function ServicesGrid() {
  await connection();
  const { services, addons } = getCatalog();
  return (
    <>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <li key={s.id}>
            <Link
              href={`/book?service=${s.id}`}
              className="group flex h-full flex-col rounded-card border border-line bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-pop"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand-strong group-hover:bg-brand group-hover:text-white transition-colors">
                  <ServiceIcon name={s.icon} className="size-7" />
                </span>
                {i === 0 && <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-brand-deep">Most popular</span>}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-muted flex-1">{s.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <p>
                  <span className="text-muted">From </span>
                  <span className="text-xl font-semibold">{formatMoney(s.hourlyRate)}</span>
                  <span className="text-muted"> / hour</span>
                </p>
                <span className="inline-flex items-center gap-1 font-semibold text-brand-strong">
                  Book <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        ))}
        <li className="rounded-card bg-ink text-white p-6 flex flex-col">
          <h3 className="text-xl font-semibold">Popular extras</h3>
          <ul className="mt-4 space-y-2.5 flex-1">
            {addons.slice(0, 5).map((a) => (
              <li key={a.id} className="flex justify-between gap-4">
                <span className="text-white/85">{a.name}</span>
                <span className="font-semibold">{formatMoney(a.price)}</span>
              </li>
            ))}
          </ul>
          <Link href="/book" className={buttonClass('primary', 'md', 'mt-6')}>
            Get a price
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

function HowItWorks() {
  const steps = [
    { title: 'Tell us about your home', text: 'Pick a service and the number of rooms. Your price updates as you go.' },
    { title: 'Choose a day and time', text: 'Only times we can really cover are shown, so there are no surprises.' },
    { title: 'Relax, we do the rest', text: 'A vetted cleaner arrives on time. Pay once the job is done.' },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-28 py-20 bg-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="How it works" title="Booked in three simple steps" />
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-card bg-white p-7 shadow-card">
              <span className="flex size-12 items-center justify-center rounded-full bg-brand text-white text-xl font-semibold">{i + 1}</span>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted text-lg">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href="/book" className={buttonClass('primary', 'lg')}>
            Book a clean <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const points = [
    'The same trusted cleaner for regular bookings, where possible',
    'Every cleaner interviewed in person and reference-checked',
    'Insured while working in your home',
    'Clear prices: what you see is what you pay',
    'No card details needed to book',
    'Free re-clean within 72 hours if anything is missed',
    'Real people on the phone if you need us',
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeading eyebrow="Why choose us" title="Peace of mind, built in" center={false} />
          <ul className="space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-lg">
                <BadgeCheck className="size-6 shrink-0 text-success mt-0.5" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-cream/70 p-8 sm:p-10">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, label: 'Insured cleaners' },
              { icon: Leaf, label: 'Eco products available' },
              { icon: Wallet, label: 'Pay after the clean' },
              { icon: RefreshCw, label: '72h re-clean promise' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl bg-white p-6 shadow-card">
                <Icon className="size-8 text-brand-strong" aria-hidden />
                <p className="mt-4 font-semibold text-lg leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="py-20 bg-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Reviews" title="What our customers say" />
        <ul className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <li key={r.name} className="rounded-card bg-white p-7 shadow-card flex flex-col">
              <Quote className="size-8 text-brand" aria-hidden />
              <div className="mt-3 flex" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-5 fill-brand text-brand" aria-hidden />
                ))}
              </div>
              <h3 className="mt-3 text-xl font-semibold">{r.title}</h3>
              <p className="mt-2 text-muted text-lg flex-1">{r.text}</p>
              <p className="mt-5 font-semibold">{r.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-28 py-20 bg-soft">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Help" title="Common questions" />
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-card bg-white shadow-card open:shadow-pop">
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-lg font-semibold">
                {f.q}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-xl transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 -mt-1 text-lg text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section id="contact" className="scroll-mt-28 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
        <div className="rounded-3xl bg-brand-strong px-6 py-14 sm:px-14 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-semibold">Ready for a cleaner home?</h2>
          <p className="mt-4 text-lg text-white/90">See your price in under a minute. No card needed.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/book" className={buttonClass('dark', 'lg')}>
              Book a clean
            </Link>
            <a href={BRAND.phoneHref} className={buttonClass('secondary', 'lg', 'border-white/0')}>
              <Phone className="size-5" aria-hidden /> Call {BRAND.phone}
            </a>
          </div>
        </div>

        {/* Commercial & Cleaner Opportunity Section */}
        <div id="business" className="scroll-mt-28 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-line bg-white p-8 shadow-card flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
                Commercial & Offices
              </span>
              <h3 className="mt-4 text-2xl font-semibold">For businesses & workspaces</h3>
              <p className="mt-2 text-muted">
                Need regular office, retail, or commercial premises cleaning? We offer vetted cleaners, flexible invoicing, and dedicated account support.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={BRAND.phoneHref} className={buttonClass('secondary', 'md')}>
                <Phone className="size-4" aria-hidden /> Speak to our team
              </a>
              <a href={`mailto:${BRAND.email}?subject=Commercial%20Cleaning%20Enquiry`} className={buttonClass('ghost', 'md')}>
                Email enquiry
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-8 shadow-card flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-deep">
                Careers & Cleaners
              </span>
              <h3 className="mt-4 text-2xl font-semibold">Work with us as a cleaner</h3>
              <p className="mt-2 text-muted">
                Looking for reliable, well-paid cleaning jobs in your local area? Choose your own hours, manage your jobs online, and get paid weekly.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cleaner/signup" className={buttonClass('primary', 'md')}>
                Sign up as cleaner
              </Link>
              <Link href="/cleaner/login" className={buttonClass('secondary', 'md')}>
                Cleaner portal log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileBookBar() {
  return (
    <div className="sm:hidden sticky bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur p-3">
      <Link href="/book" className={buttonClass('primary', 'lg', 'w-full')}>
        Book a clean
      </Link>
    </div>
  );
}
