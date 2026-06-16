import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MacDownloadLink } from "@/components/MacDownloadLink";

const SCREENS = [
  "Login & signup (email + Google)",
  "Interactive onboarding tutorial",
  "Dashboard — Activity (past call notes & deal scores)",
  "Upcoming — pre-call briefs with prospect intel",
  "Meeting detail — summary, transcript, next steps",
  "Customize Ghost — sales modes & playbooks",
  "Settings — invisibility, languages, shortcuts",
  "Billing — Free, Pro, Undetectable plans",
  "Live overlay — Listen, Assist, Smart mode",
];

export default function DownloadPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <div className="mx-auto max-w-2xl px-6 py-24 md:py-32">
          <p className="text-[13px] font-medium text-ghost-600">
            Desktop app · Sales calls
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Run Ghost on your Mac
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
            The full native app — invisible overlay during calls, dashboard, meeting
            notes, and custom playbooks. Or use the web app in your browser with live mic
            and tab audio.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <MacDownloadLink className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-[14px] font-medium text-white transition-colors hover:bg-zinc-800">
              Download Ghost for Mac
            </MacDownloadLink>
            <Link
              href="/app"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-[14px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Open web app
            </Link>
          </div>

          <div className="mt-10 space-y-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-[13px] font-semibold text-amber-900">
                macOS blocked Ghost?
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-amber-900/80">
                Unsigned apps show &quot;Apple could not verify&quot; or &quot;damaged&quot;. After
                installing to Applications, run this once in Terminal:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[12px] text-zinc-100">
{`xattr -cr /Applications/Ghost.app
codesign --force --deep --sign - /Applications/Ghost.app
open /Applications/Ghost.app`}
              </pre>
              <p className="mt-2 text-[13px] text-amber-900/70">
                Fastest fix: use <strong>Open Ghost.command</strong> on your Desktop (or inside
                the DMG). Or right-click Ghost in Applications → <strong>Open</strong> →{" "}
                <strong>Open</strong> again.
              </p>
            </div>

            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
                Mac install
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-zinc-600">
                <li>Download and open <strong>Ghost.dmg</strong></li>
                <li>Drag Ghost into Applications (or run Install Ghost.command)</li>
                <li>If blocked, use the Terminal fix above</li>
                <li>Open Ghost — allow mic when prompted</li>
                <li>Click <strong>Start Ghost</strong> on your next sales call</li>
              </ol>
            </div>

            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
                Build from source
              </h2>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-[13px] leading-relaxed text-zinc-100">
{`cd desktop
npm install
npm run dev          # dev
npm run package:mac  # build Ghost.dmg`}
              </pre>
            </div>

            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
                Included screens
              </h2>
              <ul className="mt-3 space-y-1.5">
                {SCREENS.map((s) => (
                  <li key={s} className="flex gap-2 text-[13px] text-zinc-600">
                    <span className="text-emerald-500">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link
            href="/"
            className="mt-10 inline-flex text-[14px] font-medium text-ghost-600 hover:text-ghost-700"
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
