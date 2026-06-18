"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LEGAL, LEGAL_ROUTES, SUPPORT_ROUTES } from "@/content/legal/config";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    articles: [
      {
        q: "How do I download and install Ghost?",
        a: "Download Ghost for Mac or Windows from the homepage or visit our download page. On Mac, open the DMG and drag Ghost to Applications. On Windows, extract Ghost-Windows.zip and run Ghost.exe. Sign in with email or Google to get started.",
      },
      {
        q: "Who is Ghost for?",
        a: "Ghost is built for sales reps, account executives, and founders who run live calls and want sharper responses without sounding scripted.",
      },
      {
        q: "Is Ghost free?",
        a: "Ghost offers a free starter tier with limited AI responses. Pro unlocks unlimited coaching, custom playbooks, and priority support.",
      },
    ],
  },
  {
    id: "during-a-call",
    title: "During a Call",
    articles: [
      {
        q: "How do I start Ghost on a sales call?",
        a: "Click Start Ghost from the dashboard or Upcoming tab. The overlay appears on your screen and begins listening automatically.",
      },
      {
        q: "Why real-time vs. a regular AI notetaker?",
        a: "Most AI tools summarize calls after they end. Ghost coaches you during the call — when you actually need the words. It's the difference between a post-game recap and a coach in your ear.",
      },
      {
        q: "How do I get coaching suggestions?",
        a: "Press Cmd/Ctrl + Enter during a call to ask Ghost for help. Suggestions appear in the overlay based on what was just said.",
      },
      {
        q: "Does Ghost join my calls?",
        a: "Never. Ghost runs locally on your machine. No bots, no extra participants.",
      },
    ],
  },
  {
    id: "privacy-security",
    title: "Privacy & Security",
    articles: [
      {
        q: "Is my call history saved?",
        a: "Every call is saved with transcripts, coaching suggestions, and deal scores. Review past sessions in your dashboard to see what worked.",
      },
      {
        q: "Does Ghost sell or train on my data?",
        a: "No. Ghost does not sell your data or use your conversation content to train public third-party AI models.",
      },
      {
        q: "Where is my data stored?",
        a: "Much of your session data is stored locally on your device. Cloud services may process transcripts and AI requests as described in our Privacy Policy.",
      },
    ],
  },
  {
    id: "account-billing",
    title: "Account & Billing",
    articles: [
      {
        q: "How do I upgrade my plan?",
        a: "Open Settings → Billing in the desktop app to compare Free and Pro plans. Subscriptions can only be purchased in the app, not on the website.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel anytime from Settings → Billing or the Stripe customer portal linked from your account.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    articles: [
      {
        q: "What languages and apps are supported?",
        a: "Ghost works on macOS with Zoom, Google Meet, Microsoft Teams, Webex, and browser-based calling tools. Real-time transcription supports 12+ languages.",
      },
      {
        q: "Ghost isn't hearing my call audio",
        a: "Grant microphone and system audio permissions in macOS Settings → Privacy & Security. Restart Ghost after enabling permissions.",
      },
      {
        q: "The overlay isn't appearing",
        a: "Make sure Ghost has screen recording permission on macOS. Check that no other overlay apps are blocking the window.",
      },
    ],
  },
];

export function HelpCenterContent() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories
      .map((category) => ({
        ...category,
        articles: category.articles.filter(
          (article) =>
            article.q.toLowerCase().includes(q) ||
            article.a.toLowerCase().includes(q) ||
            category.title.toLowerCase().includes(q),
        ),
      }))
      .filter((category) => category.articles.length > 0);
  }, [query]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a1a1aa]">
          Support
        </p>
        <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.75rem]">
          Help Center
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[#71717a]">
          Find answers about setup, live coaching, billing, and troubleshooting.
        </p>

        <div className="mt-8">
          <label htmlFor="help-search" className="sr-only">
            Search help articles
          </label>
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help..."
            className="h-12 w-full rounded-2xl border border-[#ececef] bg-[#fafafa] px-4 text-[15px] text-[#0a0a0a] outline-none transition-colors placeholder:text-[#a1a1aa] focus:border-[#4b8bf5] focus:bg-white"
          />
        </div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <nav className="hidden lg:block">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
            Categories
          </p>
          <ul className="mt-4 space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#${category.id}`}
                  className="text-[14px] text-[#71717a] transition-colors hover:text-[#0a0a0a]"
                >
                  {category.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          {filtered.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-28">
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
                {category.title}
              </h2>
              <div className="mt-5 divide-y divide-[#ececef] rounded-2xl border border-[#ececef] bg-white">
                {category.articles.map((article) => {
                  const id = `${category.id}-${article.q}`;
                  const isOpen = openId === id;

                  return (
                    <div key={article.q}>
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : id)}
                        className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left md:px-6 md:py-5"
                      >
                        <span className="text-[15px] font-medium text-[#0a0a0a]">
                          {article.q}
                        </span>
                        <ChevronIcon
                          className={`h-4 w-4 shrink-0 text-[#a1a1aa] transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen ? (
                        <p className="px-5 pb-5 text-[14px] leading-[1.7] text-[#71717a] md:px-6 md:pb-6">
                          {article.a}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {filtered.length === 0 ? (
            <p className="text-[15px] text-[#71717a]">
              No articles matched your search. Try different keywords or{" "}
              <Link href={SUPPORT_ROUTES.contact} className="text-[#4b8bf5]">
                contact us
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-[#dbeafe] bg-[#eff6ff] px-6 py-8 md:flex md:items-center md:justify-between md:px-8">
        <div>
          <p className="text-[16px] font-semibold text-[#0a0a0a]">Still need help?</p>
          <p className="mt-1 text-[14px] text-[#52525b]">
            Our team typically responds within 24 hours.
          </p>
        </div>
        <Link
          href={SUPPORT_ROUTES.contact}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#4b8bf5] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#3d7de8] md:mt-0"
        >
          Contact Us
        </Link>
      </div>

      <p className="mt-8 text-[13px] text-[#a1a1aa]">
        For legal and privacy questions, see our{" "}
        <Link href={LEGAL_ROUTES.privacy} className="text-[#4b8bf5]">
          Privacy Policy
        </Link>{" "}
        or email {LEGAL.contact.privacy}.
      </p>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
