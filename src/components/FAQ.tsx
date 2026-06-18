"use client";

import { useState } from "react";

export type FaqItem = {
  q: string;
  a: string;
};

const defaultFaqs: FaqItem[] = [
  {
    q: "Why real-time vs. a regular AI notetaker?",
    a: "Most AI tools summarize calls after they end. Ghost coaches you during the call — when you actually need the words. It's the difference between a post-game recap and a coach in your ear.",
  },
  {
    q: "Who is Ghost for?",
    a: "Ghost is built for sales reps, account executives, and founders who run live calls and want sharper responses without sounding scripted.",
  },
  {
    q: "Is Ghost free?",
    a: "Ghost offers a free starter tier with limited AI responses. Pro unlocks unlimited coaching, custom playbooks, and priority support.",
  },
  {
    q: "Is my call history saved?",
    a: "Every call is saved with transcripts, coaching suggestions, and deal scores. Review past sessions in your dashboard to see what worked.",
  },
  {
    q: "What languages and apps are supported?",
    a: "Ghost works on macOS with Zoom, Google Meet, Microsoft Teams, Webex, and any browser-based calling tool. Real-time transcription is available across 12+ languages.",
  },
  {
    q: "Can I talk to customer support?",
    a: "Yes. Pro subscribers get priority support. Email us anytime at support@ghost.ai.",
  },
];

export function FAQ({
  faqs = defaultFaqs,
  id = "faq",
  className = "bg-white",
}: {
  faqs?: readonly FaqItem[];
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id={id} className={className}>
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#0a0a0a] md:text-[2.5rem]">
          Frequently asked questions
        </h2>

        <div className="mt-12 border-t border-[#ececef]">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="border-b border-[#ececef]">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left md:py-6"
              >
                <span className="text-[15px] font-normal text-[#0a0a0a] md:text-[16px]">
                  {faq.q}
                </span>
                <ChevronIcon
                  className={`h-4 w-4 shrink-0 text-[#a1a1aa] transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i ? (
                <p className="pb-5 pr-10 text-[14px] leading-[1.65] text-[#71717a] md:pb-6 md:text-[15px]">
                  {faq.a}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
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
