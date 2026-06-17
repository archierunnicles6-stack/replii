import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DownloadPageHero } from "@/components/DownloadPageHero";
import { DownloadInstallGuide } from "@/components/DownloadInstallGuide";

const SCREENS = [
  "Login & signup (email + Google)",
  "Interactive onboarding tutorial",
  "Dashboard — Activity (past call notes & deal scores)",
  "Upcoming — pre-call briefs with prospect intel",
  "Meeting detail — summary, transcript, next steps",
  "Customize Ghost — sales modes & playbooks",
  "Settings — overlay display, languages, shortcuts",
  "Billing — Free and Pro plans",
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
          <Suspense fallback={null}>
            <DownloadPageHero />
            <DownloadInstallGuide />
          </Suspense>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
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
