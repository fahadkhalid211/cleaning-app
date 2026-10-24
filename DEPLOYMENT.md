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
git commit -m "Hoodie rebrand, Hostinger build fix"
git push
```

`.env.local` and `/data` (your local database) are git-ignored, so secrets and test data never reach GitHub.

## 2. Create the app in hPanel

1. hPanel → **Websites → Add website → Node.js app** (wording may differ slightly).
2. Choose **Import from GitHub**, authorise Hostinger, pick the repository and the `main` branch.
3. Settings:
   - Framework: **Next.js** (auto-detected)
   - Node version: **24.x** if offered, otherwise 22.x (must be 22.13 or newer for the built-in database)
   - Build command: `npm run build`
   - Start command: `npm start`
4. Turn on **automatic deployment** so every push to `main` redeploys.

## 3. Environment variables (hPanel → app → Environment variables)

| Name | Value | Notes |
|---|---|---|
| `ADMIN_EMAIL` | your email | First admin account, created on first start |
| `ADMIN_PASSWORD` | 16+ random characters | Remove both after first login if you like |
| `DATABASE_PATH` | `/home/<your-user>/hoodie-data/hoodie.db` | **Must be outside the app folder** |
| `TRUSTED_PROXY_HOPS` | `1` | Use `2` if you add Cloudflare / Hostinger CDN in front |

Why `DATABASE_PATH` matters: a GitHub redeploy replaces the app folder. If the database
lived inside it, every deploy would wipe your bookings. If you don't set it, production
defaults to `~/hoodie-data/hoodie.db` in the hosting account's home folder.
After the first deploy, check the app log for the line `[db] Using …` to confirm the path.

## 4. After the first deploy

1. Visit `https://yourdomain/admin/login` and log in with the admin email/password.
2. **Cleaners tab → Add cleaner** for each real cleaner. Customers cannot book until at
   least one cleaner is active. The number of active cleaners is how many jobs can run at once.
3. **Prices tab**: set your real hourly rates and extras.
4. Edit `src/lib/config.ts` (phone, email, opening hours) and the sample reviews in
   `src/app/(site)/page.tsx`, then push. It redeploys automatically.
5. Make sure HTTPS is on (hPanel → SSL). Login cookies are HTTPS-only in production.

## If a build fails

Hostinger's build servers run an older Linux (glibc older than 2.29). Next.js 16's native
compiler needs glibc 2.30, so it can't run there. The project is set up to work around this:

- `npm run build` runs `next build --webpack`, which works with Next's WebAssembly compiler.
  (Turbopack, the default, only works with the native compiler.)
- `@next/swc-wasm-nodejs` is a dev dependency, so that compiler is installed rather than downloaded mid-build.
- The config is `next.config.mjs` (plain JavaScript). A `next.config.ts` needs the native compiler to load.
- Tailwind uses the standard `@tailwindcss/postcss` plugin. Its native parts only need glibc 2.14.
- The hero photo is a plain `<img>`; `next/image` would need another native library (sharp) at runtime.

The warning `Attempted to load @next/swc-linux-x64-gnu ... GLIBC_2.29 not found` in the build log is
expected and harmless now. Builds take a little longer than on a modern machine.

## Backups

All data is in the one database file. Back it up regularly (e.g. weekly), ideally while
the app is stopped, by downloading `hoodie.db` (plus any `-wal` file next to it) from
the File Manager or via SSH:

```bash
sqlite3 ~/hoodie-data/hoodie.db ".backup ~/hoodie-backup-$(date +%F).db"
```

## Running the security / double-booking tests

Against a **local or staging** copy (never production, it creates test data):

```bash
npm run build && npm start
```

```bash
node --env-file=.env.local scripts/security-test.mjs
```
