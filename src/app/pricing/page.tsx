import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTA } from "@/components/CTA";

const plans = [
  {
    name: "Starter",
    tagline: "All essential features.",
    price: "Free",
    period: "",
    cta: "Get started",
    highlighted: false,
    features: [
      "Limited AI responses",
      "Limited call coaching",
      "Customize instructions",
      "Basic deal health tracking",
    ],
  },
  {
    name: "Pro",
    tagline: "Unlimited access.",
    price: "$29",
    period: "/ month",
    cta: "Subscribe",
    highlighted: true,
    features: [
      "Unlimited AI responses",
      "Unlimited call coaching",
      "Custom objection playbooks",
      "Priority support",
    ],
  },
  {
    name: "Pro + Invisibility",
    tagline: "Hidden during screen share.",
    price: "$99",
    period: "/ month",
    cta: "Subscribe",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Completely hidden from screen share",
      "Advanced diarization",
      "Post-call summaries",
    ],
  },
];

const comparison = [
  { feature: "AI suggestions per day", starter: "Limited", pro: "Unlimited", elite: "Unlimited" },
  { feature: "Call coaching", starter: "Limited", pro: "Unlimited", elite: "Unlimited" },
  { feature: "Custom playbooks", starter: "—", pro: "✓", elite: "✓" },
  { feature: "Screen share invisibility", starter: "—", pro: "—", elite: "✓" },
  { feature: "Post-call summaries", starter: "—", pro: "—", elite: "✓" },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
              Pricing
            </h1>
            <div className="mx-auto my-5 h-px w-12 bg-zinc-300" />
            <p className="text-[15px] leading-relaxed text-zinc-500">
              Start free. Upgrade when you&apos;re closing more deals.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-ghost-300 bg-ghost-50/50 shadow-lg shadow-ghost-500/5"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ghost-500 px-3 py-0.5 text-[11px] font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-zinc-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-[13px] text-zinc-500">{plan.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-zinc-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[14px] text-zinc-500">
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px] text-zinc-600"
                    >
                      <span className="mt-0.5 text-ghost-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/download"
                  className={`mt-8 inline-flex h-10 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-20 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-4 pr-4 font-medium text-zinc-400">
                    Features
                  </th>
                  <th className="pb-4 px-4 text-center font-medium text-zinc-900">
                    Starter
                  </th>
                  <th className="pb-4 px-4 text-center font-medium text-zinc-900">
                    Pro
                  </th>
                  <th className="pb-4 pl-4 text-center font-medium text-zinc-900">
                    Pro + Invisibility
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-zinc-100">
                    <td className="py-4 pr-4 text-zinc-600">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-zinc-500">
                      {row.starter}
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-500">
                      {row.pro}
                    </td>
                    <td className="py-4 pl-4 text-center text-zinc-500">
                      {row.elite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
