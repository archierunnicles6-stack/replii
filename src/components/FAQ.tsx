"use client";

import { useState } from "react";

const faqs = [
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
    a: "Ghost offers a free starter tier with limited AI responses. Pro plans unlock unlimited coaching, custom playbooks, and screen-share invisibility.",
  },
  {
    q: "How is it invisible in meetings?",
    a: "Ghost uses native OS-level window protection so the overlay never appears in screen shares or recordings. Only you see the coaching panel.",
  },
  {
    q: "What platforms are supported?",
    a: "Ghost works on macOS and Windows with Zoom, Google Meet, Microsoft Teams, Webex, and any browser-based calling tool.",
  },
  {
    q: "Can I talk to customer support?",
    a: "Yes. Pro subscribers get priority support. Email us anytime at support@ghost.ai.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-zinc-200">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mx-auto my-5 h-px w-12 bg-zinc-300" />
        </div>

        <div className="mx-auto mt-12 max-w-2xl divide-y divide-zinc-200">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <span className="text-[15px] font-medium text-zinc-900">
                  {faq.q}
                </span>
                <span className="mt-0.5 shrink-0 text-zinc-400">
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <p className="mt-3 text-[14px] leading-relaxed text-zinc-500">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
