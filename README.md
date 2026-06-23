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
git tag v0.1.0 && git push origin v0.1.0
```

Signed Mac builds: `desktop/build-release.command` (requires `desktop/.release-secrets.local`).

**Windows installer** (`Replii-Setup.exe`) must be built on Windows — NSIS does not run on macOS. Push `.github/workflows/desktop-release.yml`, then either tag a release or run **Actions → Desktop Release → Run workflow** with platform `windows` to replace an old zip with the NSIS installer.

## Stack

- **Site:** Next.js 15, React 19, Tailwind CSS, Supabase, Stripe
- **Desktop:** Electron, React, Vite, Zustand, Tailwind CSS
