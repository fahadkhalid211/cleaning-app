# QA & Security Report

Scope: the app as it was before this rebuild (now in `legacy-prototype/`), and the rebuilt app.
Method: code review, live attacks against a production build (`scripts/security-test.mjs`,
51 automated checks), and a usability walk-through as an older, non-technical customer.

## 1. Critical problems found in the original app

The original was a front-end-only prototype. Everything ran in the visitor's browser and
nothing was saved: refreshing the page wiped all bookings.

| # | Severity | What a hacker could do | Status |
|---|---|---|---|
| 1 | Critical | Open the **admin panel with no login** (footer "Superadmin Access" / navbar button) and change prices, cancel jobs, read every customer's details | Fixed: server-side sessions + role checks on every API |
| 2 | Critical | **Log in as any customer** by typing their email ("passwordless" with no email check), then see their address and key-safe code | Fixed: hashed passwords (scrypt), rate-limited login |
| 3 | Critical | **Stored XSS**: a booking with name `<img src=x onerror=…>` ran script in the admin's browser (email preview used `dangerouslySetInnerHTML`) | Fixed: no raw HTML rendering anywhere + Content-Security-Policy |
| 4 | Critical | **No double-booking protection**: every booking went to the same cleaner whatever the time; unlimited bookings per slot | Fixed: atomic allocation, see section 3 |
| 5 | High | **Price tampering**: price computed and trusted in the browser | Fixed: server recalculates from database prices |
| 6 | High | Lock-box codes put into emails in plain text | Fixed: access notes only visible to the assigned cleaner and admin |
| 7 | High | No data persistence at all (in-memory React state) | Fixed: SQLite database |
| 8 | Medium | Booking IDs `PS-1000…9999` random: collisions and guessable | Fixed: 6-char random refs + ownership checks |
| 9 | Medium | No security headers, `X-Powered-By` exposed | Fixed: CSP, frame blocking, HSTS, nosniff, etc. |

## 2. Attack tests run against the rebuilt app (51/51 pass)

Access control: logged-out users and wrong roles blocked from all admin/cleaner/customer APIs;
customers can't log in to cleaner/admin areas; `role: "admin"` sneaked into sign-up is ignored;
forged session cookies rejected; sessions die on logout (a stolen cookie stops working).

Tampering and injection: fake prices ignored; negative/huge room counts, past dates, impossible
dates (31 Feb), Sundays, 3am starts, unknown services/extras, objects instead of text, 100 KB
payloads and malformed JSON all rejected with friendly messages. SQL injection and XSS
payloads are stored as harmless text, and the admin search can't be injected.

Privacy (IDOR): customers can't view, cancel or probe other customers' bookings; cleaners can't
touch other cleaners' jobs and never see customer email addresses.

CSRF: requests from other websites are refused. Brute force: 6 wrong passwords per account per
15 minutes, even when spread across many IP addresses; identical error for "no such email"
and "wrong password" so attackers can't discover who has an account.

## 3. Booking integrity (no double bookings)

- A cleaner is busy from a job's start to its end **plus a 30-minute travel gap**.
- Availability and booking both run inside one `BEGIN IMMEDIATE` database transaction, so two
  people pressing "Confirm" at the same moment are processed one after the other.
- Database unique indexes reject any duplicate as a final safety net.
- Each booking form carries a one-time key, so a double-click or network retry never creates two bookings.
- A customer can't hold two overlapping cleans; rescheduling and admin re-assignment go through the same checks.
- Deactivating a cleaner who still has upcoming jobs is blocked until those jobs are re-assigned.

Tested: **10 customers grabbing the same slot at the same instant with 2 cleaners → exactly 2
bookings, 8 clear "that time was just taken" messages, zero overlaps.**

## 4. "Older customer" usability review

Issues in the original: tiny 11px labels, jargon ("pre-authorization", "magic link"), 30+
choices on one screen, dates as free text, no clear way to cancel, emerald-on-white text below
readable contrast.

What the rebuild does:
- 17px base text; buttons and tap targets at least 48px tall; clear focus outlines for keyboard users.
- All text colours pass WCAG AA (Wecasa's coral `#ea663f` is only 3.25:1 on white, so buttons and
  links use a deeper `#c94a24`, 4.7:1).
- Booking split into 4 named steps ("Step 2 of 4: Date & time") with a Back button on every step.
- Large −/+ buttons for room counts instead of typing numbers; days and times are big buttons;
  full times are crossed out and labelled for screen readers.
- Price always visible and updated live; "No card needed. Pay after the clean" repeated where it matters.
- Plain-English errors next to the field ("Please enter your postcode"), and the form jumps to
  the step with the problem.
- Phone number in the header, menu, footer, login and account pages for people who'd rather call.
- Password fields have a **Show** button. "Change date or time" and "Cancel booking" are
  plain buttons with a confirmation dialog that says "No, keep it" / "Yes, cancel".
- Progress is saved if they leave to log in mid-booking.

## 5. Not done yet / your decisions

- **Emails**: no confirmation emails are sent yet (needs SMTP details, e.g. Hostinger email).
- **Password reset**: customers and cleaners currently reset via phone/admin; self-service reset needs email.
- **Payments**: "pay after the clean" model; no card processing integrated.
- **Repeat visits**: weekly/fortnightly bookings get the discount, but only the first visit is booked.
- **Placeholder content** to replace before launch: phone/email in `src/lib/config.ts`, the
  sample reviews and the areas list in `src/app/(site)/page.tsx`.
- Rate limiting is in memory, fine for one server process; it resets when the app restarts.
