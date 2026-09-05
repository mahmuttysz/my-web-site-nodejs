# Personal portfolio & blog engine

Node.js, Express 5, TypeScript, EJS, and MariaDB. Server-side rendering plus Tailwind CSS v4 for SEO and a small footprint. Admin panel manages about, experiences, projects, articles, contact messages, and social links.

## Stack

- **Runtime:** Node.js 22+ (production has been run on Node 24)
- **HTTP:** Express 5, EJS, Tailwind CSS v4
- **Data:** MariaDB / MySQL (`mariadb` pool, parameterized SQL)
- **Redis:** admin sessions (`express-session`) and rate-limit counters — not a page cache
- **Process / CI:** PM2 reload, GitHub Actions SSH deploy to Rocky Linux 9

## What it does

- Public site: home, blog, contact form, `sitemap.xml`, `rss.xml`, `tr` (`/`) / `en` (`/en`)
- Admin CMS behind `ADMIN_PANEL_ENDPOINT` (default `/admin`)
- Contact form: Cloudflare Turnstile, Redis-backed limiter, HTML-escaped mail
- Blog Markdown rendered with `marked`, then `sanitize-html`
- Login: bcrypt, session regenerate, 5 failed attempts → 15 minute lock (`wrong_try`)
- Helmet CSP (nonce), `httpOnly` session cookie, `noindex` on the admin path
- Admin CSRF token on forms/AJAX; draft preview at `/blog/_preview/:token` (`noindex`)
- `GET /health` — MariaDB + Redis probe (`200` / `503`), checked after deploy

## Layout

```text
src/
  app.ts              Entry point
  config/             DB pool, Redis, session, upload, env, rate limits
  controllers/        Site and admin logic
  middlewares/        Auth, default locals, Turnstile, 404/500
  routes/             Public and admin routes
  styles/             Tailwind input.css
  types/              dbTables and view/response types
  utils/              Helpers, mailer, locales, Markdown sanitize, health
test/                 node:test unit tests (no live DB)
scripts/
  migrate.ts          Applies numbered SQL files
  create-admin.ts     Seeds the first admin user
migrations/
  001_init.sql        Baseline schema (CREATE IF NOT EXISTS)
views/                EJS (site, admin, errors, partials)
public/               Compiled CSS, JS, uploads
```

## Setup

### Prerequisites

- Node.js 22+
- Redis
- MariaDB or MySQL

### Install

```bash
npm install
cp .env.sample .env
```

Fill `.env`. At minimum: `DB_*`, `REDIS_URL`, `SESSION_SECRET`, SMTP, Turnstile keys.

**`SESSION_SECRET`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- Must be set. Empty or known placeholders (`very_secret_code`, `very_secret_key_must_be_change`) refuse to start.
- If `APP_ENV=prod`, the secret must be at least 32 characters.
- For local work, `APP_ENV=dev` is enough with any non-placeholder secret; the sample file still ships `APP_ENV=prod` — change it or use a long secret.

Do not commit `.env`.

### Schema and admin user

```bash
npm run db:migrate
npm run seed:admin
```

`db:migrate` runs `migrations/*.sql` in name order and records them in `schema_migrations`. Already-applied files are skipped. Existing tables are not dropped (`CREATE IF NOT EXISTS` in `001_init.sql`).

New schema change: add `migrations/002_short_name.sql` (usually `ALTER TABLE ...`). Deploy runs migrate automatically.

Do **not** run `DumpSQL.sql` against a live database. It drops tables. Backups are `mysqldump` (or equivalent), not that script.

Seed uses `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env` (or CLI args). Skip if that user already exists.

### Development

```bash
npm run dev
```

TypeScript and Tailwind both watch. Built CSS is gitignored (`public/css/style.css`); `npm run dev` or `npm run build` recreates it.

### Production (manual)

```bash
npm run build          # tsc + minified Tailwind
pm2 start dist/app.js --name "my-site"
# later:
pm2 reload my-site --update-env
```

## Deploy (GitHub Actions)

Push to **`master`** (not `main`). GitHub Actions first runs `tsc` and unit tests. Only if that job passes does it SSH into the VPS:

```text
git pull origin master
npm ci
npm run build
npm run db:migrate
pm2 reload my-site --update-env
curl -fsS http://127.0.0.1:3000/health
```

`npm ci` installs from `package-lock.json`, including new packages. You do not run `npm install` by hand on the server.

If migrate or the app exits on `SESSION_SECRET`, the production `.env` on the VPS is too short or still a placeholder. Fix that file, then migrate and reload again.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch TypeScript and Tailwind |
| `npm run build` | Compile TS and CSS |
| `npm start` | `node dist/app.js` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (`node:test` via tsx) |
| `npm run db:migrate` | Apply pending SQL migrations |
| `npm run seed:admin` | Create the first admin |
| `npm run build:css` / `watch:css` | Tailwind only |
