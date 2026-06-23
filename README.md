# Replii

Live AI sales coach — desktop app + marketing site.

## What it does

Replii is a **desktop application** for sales calls:

- **Live overlay** — real-time coaching during calls, logged for manager review
- **Dashboard** — Activity, upcoming pre-call briefs, meeting notes
- **Sales modes** — Discovery, Demo, Negotiation, Enterprise
- **Customize** — system prompts, playbooks, knowledge base
- **Settings & billing** — overlay display, languages, plans

## Marketing site

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Deploy production:

```bash
npm run deploy:prod
```

## Desktop app

```bash
cd desktop
cp .env.example .env   # fill in keys
npm install
npm run dev
```

Or from the repo root: `npm run desktop:dev`

### Onboarding flow

| Step | Screen |
|------|--------|
| 1 | Welcome |
| 2 | Auth (email or Google via Supabase) |
| 3 | Profile setup |
| 4 | Role setup |
| 5 | Shortcut tutorial (`/try`) |
| 6 | Paywall (Stripe checkout) |
| 7 | Dashboard |

### Overlay shortcuts

- `⌘ Enter` — Assist
- `⌘ R` — Clear session
- `⌘ ← →` — Move overlay
- `⌘ \` — Hide / show

## Environment

Copy `.env.example` → `.env` at the repo root and `desktop/.env.example` → `desktop/.env`.

Required for production:

- **OpenAI** — `OPENAI_API_KEY` (site) and `VITE_OPENAI_API_KEY` (desktop, baked in at build time)
- **Supabase** — URL, anon key, service role; run `supabase db push`
- **Stripe** — live secret key, webhook secret, and price IDs on Vercel
- **Google OAuth** — see comments in `.env.example`

## Release

```bash
# Build + install locally (Mac)
npm run local:setup

# Publish installers to GitHub Releases (Mac DMG + Windows Replii-Setup.exe)
git tag v0.1.1 && git push origin v0.1.1
```

Signed Mac builds: `desktop/build-release.command` (requires `desktop/.release-secrets.local`).

**Windows installer** (`Replii-Setup.exe`) must be built on Windows — NSIS does not run on macOS. Push `.github/workflows/desktop-release.yml`, then either tag a release or run **Actions → Desktop Release → Run workflow** with platform `windows` to replace an old zip with the NSIS installer.

### GitHub Actions secrets (desktop release)

Configure these in **Settings → Secrets and variables → Actions** before tagging a release:

| Secret | Purpose |
|--------|---------|
| `VITE_OPENAI_API_KEY` | Baked into desktop builds |
| `VITE_SUPABASE_URL` | Auth |
| `VITE_SUPABASE_ANON_KEY` | Auth |
| `VITE_GOOGLE_CLIENT_ID` | Google sign-in |
| `VITE_API_BASE_URL` | Billing API (default: `https://replii-lac.vercel.app`) |
| `VITE_LEGAL_BASE_URL` | Legal pages (default: `https://replii.ai`) |
| `VITE_ADMIN_EMAIL` | Optional admin panel access |

### Launch checklist

**Vercel (site + API)**

- [ ] Set all root `.env` vars on Vercel (OpenAI, Supabase, Stripe live keys + price IDs, `ADMIN_EMAIL`)
- [ ] `NEXT_PUBLIC_SITE_URL=https://replii.ai` and custom domain `replii.ai` on the project
- [ ] Stripe webhook → `https://replii-lac.vercel.app/api/webhooks/stripe` (live mode)
- [ ] `npm run deploy:prod` or push to `main` if connected to Vercel
- [ ] Verify `/download`, `/pricing`, `/app`, and legal pages load on `replii.ai`

**Supabase**

- [ ] `supabase db push` — migrations applied
- [ ] Google OAuth redirect: `https://<project>.supabase.co/auth/v1/callback`
- [ ] Redirect URLs include `http://127.0.0.1:42817/auth/callback` (desktop) and `https://replii.ai/auth/callback`

**Desktop**

- [ ] Fill `desktop/.env` with production `VITE_*` keys (match Vercel/Supabase)
- [ ] Tag `v0.1.1` (or current `package.json` version) to trigger **Desktop Release** workflow
- [ ] Confirm GitHub Release has `Replii.dmg` and `Replii-Setup.exe`
- [ ] Test download buttons on the marketing site

**Smoke test**

- [ ] Sign up (email + Google) → profile → role → try shortcuts → paywall → dashboard
- [ ] Start a session, overlay assist works, meeting saves to Activity
- [ ] Pro checkout + billing portal

## Stack

- **Site:** Next.js 15, React 19, Tailwind CSS, Supabase, Stripe
- **Desktop:** Electron, React, Vite, Zustand, Tailwind CSS
