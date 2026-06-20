# Replii

Live AI sales coach — Cluely-style desktop app + marketing site.

## What it does

Replii is a **full desktop application** for sales calls:

- **Live overlay** — real-time coaching during calls, logged for manager review
- **Dashboard** — Activity, upcoming pre-call briefs, meeting notes
- **Sales modes** — Discovery, Demo, Negotiation, Enterprise
- **Customize** — system prompts, playbooks, knowledge base
- **Settings & billing** — overlay display, languages, plans

Same product shape as [Cluely](https://cluely.com), built specifically for **sales calls**.

## Marketing site

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Desktop app

```bash
cd desktop
npm install
npm run dev
```

Or: `npm run desktop:dev` from the repo root.

### App screens

| Screen | Description |
|--------|-------------|
| Login / Signup | Email or Google (demo auth) |
| Onboarding | 5-step interactive tutorial |
| Activity | Past calls, deal scores, objections |
| Upcoming | Pre-call briefs, participants, talking points |
| Meeting detail | Summary, transcript, next steps, follow-up |
| Customize Replii | Sales modes, system prompt, file uploads |
| Settings | Overlay display, languages, display, shortcuts |
| Billing | Free, Pro ($20) |
| Live overlay | Listen, Assist, Smart mode, quick actions |

### Overlay shortcuts

- `⌘ Enter` — Assist
- `⌘ R` — Clear session
- `⌘ ← →` — Move overlay
- `⌘ \` — Hide / show

### Live AI (optional)

Create `desktop/.env`:

```
VITE_OPENAI_API_KEY=sk-...
```

## Stack

- **Site:** Next.js 15, React 19, Tailwind CSS
- **Desktop:** Electron, React, Vite, Zustand, Tailwind CSS
