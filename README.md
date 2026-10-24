# PureSpace: home cleaning booking

Next.js 16 app with a built-in SQLite database. Customers book online, cleaners see their
jobs, and admins manage bookings, cleaners and prices.

| Area | URL |
|---|---|
| Website + booking | `/`, `/book` |
| Customer login / account | `/login`, `/account` |
| Cleaner login / jobs | `/cleaner/login`, `/cleaner` |
| Admin login / dashboard | `/admin/login`, `/admin` |

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env.local`, set an admin email/password (and optionally the demo cleaners), then:

```bash
npm run dev
```

The local database is created at `data/purespace.db`.

## Where things live

- `src/lib/server/scheduling.ts`: availability and the no-double-booking rules
- `src/lib/server/bookings.ts`: create, reschedule, cancel, status changes
- `src/lib/server/auth.ts`: sessions and role checks
- `src/lib/config.ts`: phone, email, currency, timezone, opening hours, booking rules
- `src/app/(site)/page.tsx`: landing page content (areas, reviews, FAQ)

## Docs

- [DEPLOYMENT.md](DEPLOYMENT.md): Hostinger + GitHub auto-deploy
- [QA_REPORT.md](QA_REPORT.md): security audit, attack test results, usability review
- `scripts/security-test.mjs`: 50+ automated attack and double-booking tests
