# Deploying to Hostinger (auto-deploy from GitHub)

The app is a standard Next.js 16 Node.js server with its own built-in SQLite
database (Node's `node:sqlite`, no separate database server needed).

## What you need

- A Hostinger plan that runs **Node.js web apps** (Business Web Hosting, Cloud, or a VPS).
  Plain "Single/Premium" shared hosting can only serve static files and will not work.
- Node.js **22.13 or newer** (24.x recommended).
- This project pushed to a GitHub repository.

## 1. Push to GitHub

```bash
git add -A
git commit -m "Rebuild: secure booking backend, new design, three login areas"
git push origin main
```

`.env.local` and `/data` (your local database) are git-ignored, so secrets and test data never reach GitHub.

## 2. Create the app in hPanel

1. hPanel → **Websites → Add website → Node.js app** (wording may differ slightly).
2. Choose **Import from GitHub**, authorise Hostinger, pick the repository and the `main` branch.
3. Settings:
   - Framework: **Next.js** (auto-detected)
   - Node version: **24.x** (or 22.x ≥ 22.13)
   - Build command: `npm run build`
   - Start command: `npm start`
4. Turn on **automatic deployment** so every push to `main` redeploys.

## 3. Environment variables (hPanel → app → Environment variables)

| Name | Value | Notes |
|---|---|---|
| `ADMIN_EMAIL` | your email | First admin account, created on first start |
| `ADMIN_PASSWORD` | 16+ random characters | Remove both after first login if you like |
| `DATABASE_PATH` | `/home/<your-user>/purespace-data/purespace.db` | **Must be outside the app folder** |
| `TRUSTED_PROXY_HOPS` | `1` | Use `2` if you add Cloudflare / Hostinger CDN in front |

Why `DATABASE_PATH` matters: a GitHub redeploy replaces the app folder. If the database
lived inside it, every deploy would wipe your bookings. If you don't set it, production
defaults to `~/purespace-data/purespace.db` in the hosting account's home folder.
After the first deploy, check the app log for the line `[db] Using …` to confirm the path.

## 4. After the first deploy

1. Visit `https://yourdomain/admin/login` and log in with the admin email/password.
2. **Cleaners tab → Add cleaner** for each real cleaner. Customers cannot book until at
   least one cleaner is active. The number of active cleaners is how many jobs can run at once.
3. **Prices tab**: set your real hourly rates and extras.
4. Edit `src/lib/config.ts` (phone, email, opening hours) and the `AREAS` list and sample
   reviews in `src/app/(site)/page.tsx`, then push. It redeploys automatically.
5. Make sure HTTPS is on (hPanel → SSL). Login cookies are HTTPS-only in production.

## Backups

All data is in the one database file. Back it up regularly (e.g. weekly), ideally while
the app is stopped, by downloading `purespace.db` (plus any `-wal` file next to it) from
the File Manager or via SSH:

```bash
sqlite3 ~/purespace-data/purespace.db ".backup ~/purespace-backup-$(date +%F).db"
```

## Running the security / double-booking tests

Against a **local or staging** copy (never production, it creates test data):

```bash
npm run build && npm start
```

```bash
node --env-file=.env.local scripts/security-test.mjs
```
