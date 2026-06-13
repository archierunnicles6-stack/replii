import { PageHeader, Button } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 sessions",
      "Basic sales coaching",
      "Meeting summaries",
      "Screen-share invisibility",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$25",
    period: "/month",
    popular: true,
    features: [
      "Unlimited sessions",
      "All sales modes",
      "Custom playbooks",
      "Pre-call briefs",
      "CRM export",
    ],
  },
  {
    id: "undetectable" as const,
    name: "Undetectable",
    price: "$75",
    period: "/month",
    features: [
      "Everything in Pro",
      "Enhanced invisibility safeguards",
      "Priority stability updates",
      "Confirmed screen-share testing",
      "Dedicated support",
    ],
  },
];

export function BillingPage() {
  const { plan, setPlan } = useAppStore();

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage your Ghost plan. Upgrade for unlimited sales sessions and custom playbooks."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-2xl border p-6 ${
              p.popular
                ? "border-ghost-400 bg-ghost-50/50 ring-2 ring-ghost-200"
                : "border-zinc-200 bg-white"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-2.5 left-4 rounded-full bg-ghost-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                Popular
              </span>
            )}
            <h3 className="text-[15px] font-semibold text-zinc-900">{p.name}</h3>
            <p className="mt-2">
              <span className="text-3xl font-semibold text-zinc-900">
                {p.price}
              </span>
              <span className="text-[13px] text-zinc-500">{p.period}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li
                  key={f}
                  className="flex gap-2 text-[12px] text-zinc-600"
                >
                  <span className="text-emerald-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {plan === p.id ? (
              <div className="mt-6 rounded-full border border-zinc-200 py-2 text-center text-[12px] font-medium text-zinc-500">
                Current plan
              </div>
            ) : (
              <Button
                className="mt-6 w-full h-9 text-[12px]"
                variant={p.id === "free" ? "secondary" : "primary"}
                onClick={() => setPlan(p.id)}
              >
                {p.id === "free" ? "Downgrade" : "Upgrade"}
              </Button>
            )}
          </div>
        ))}
      </div>

      {plan !== "free" && (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-[13px] font-semibold text-zinc-900">
            Manage subscription
          </p>
          <p className="mt-1 text-[12px] text-zinc-500">
            Billing is simulated in this build. Connect Stripe for production.
          </p>
          <button
            type="button"
            onClick={() => setPlan("free")}
            className="mt-3 text-[12px] font-medium text-red-600 hover:text-red-700"
          >
            Cancel plan
          </button>
        </div>
      )}
    </div>
  );
}
