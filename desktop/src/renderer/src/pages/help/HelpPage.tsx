import { PageHeader } from "../../components/ui";

const FAQ = [
  {
    q: "How do I start Ghost on a sales call?",
    a: "Click Start Ghost from the dashboard or Upcoming tab. The overlay appears on your screen and begins listening automatically.",
  },
  {
    q: "Is Ghost visible on screen share?",
    a: "No. With Invisibility enabled (default), Ghost is hidden from Zoom, Meet, Teams, and recordings. Only you see the overlay.",
  },
  {
    q: "Does Ghost join my calls?",
    a: "Never. Ghost runs locally on your machine. No bots, no extra participants.",
  },
  {
    q: "Which sales modes should I use?",
    a: "Use Discovery for first calls, Demo for product walkthroughs, Negotiation for pricing conversations, and Enterprise for multi-stakeholder deals.",
  },
  {
    q: "How do I customize coaching for my team?",
    a: "Go to Customize Ghost to switch modes, edit the system prompt, and upload playbooks or battlecards.",
  },
];

export function HelpPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Help Center"
        description="Everything you need to win more deals with Ghost."
      />

      <div className="space-y-4">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-zinc-200 bg-white"
          >
            <summary className="cursor-pointer px-5 py-4 text-[14px] font-medium text-zinc-900">
              {item.q}
            </summary>
            <p className="border-t border-zinc-100 px-5 pb-4 pt-3 text-[13px] leading-relaxed text-zinc-600">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
        <p className="text-[14px] font-medium text-zinc-800">Need more help?</p>
        <p className="mt-1 text-[13px] text-zinc-500">
          Email support@ghost.app — we respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
