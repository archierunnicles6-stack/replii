"use client";

import { useState } from "react";
import Link from "next/link";
import { SUPPORT_ROUTES } from "@/content/legal/config";
import { priceForInterval, type BillingInterval } from "@/lib/pricing";

const STARTER_FEATURES = [
  "Limited AI responses",
  "Unlimited real-time meeting notetaking",
  "Customize instructions & upload files",
  "Ask AI about all your past meetings",
];

const PRO_FEATURES = [
  "Unlimited AI responses",
  "Unlimited access to latest AI models",
  "Priority support",
  "Undetectable on screen share",
];

const CARD_CLASS =
  "flex h-full min-h-[460px] w-full flex-col rounded-[24px] border border-white/80 bg-white p-8 shadow-[0_8px_40px_rgba(15,23,42,0.08)]";

const PRIMARY_BUTTON_CLASS =
  "mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#1a1a1a] text-[14px] font-medium text-white transition-colors hover:bg-[#2a2a2a]";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-[#4A90E2]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function FeatureList({
  features,
  includesLabel,
}: {
  features: string[];
  includesLabel?: string;
}) {
  return (
    <>
      <div className="my-5 h-px bg-zinc-100" />
      <ul className="space-y-2.5">
        {includesLabel ? (
          <li className="text-[13px] font-semibold text-zinc-900">{includesLabel}</li>
        ) : null}
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-[13px] leading-snug text-zinc-700">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function BillingToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}) {
  const isMonthly = interval === "monthly";

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`text-[14px] transition-colors ${
          isMonthly ? "font-semibold text-zinc-900" : "font-medium text-zinc-400"
        }`}
      >
        Monthly
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={!isMonthly}
        aria-label="Toggle annual billing"
        onClick={() => onChange(isMonthly ? "annual" : "monthly")}
        className="relative h-7 w-12 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-[#3f3f46] shadow-sm transition-transform ${
            isMonthly ? "left-1" : "left-6"
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => onChange("annual")}
        className={`text-[14px] transition-colors ${
          !isMonthly ? "font-semibold text-zinc-900" : "font-medium text-zinc-400"
        }`}
      >
        Annually
      </button>
    </div>
  );
}

function PlaceholderPlanButton({
  children,
  splitChevron = false,
}: {
  children: React.ReactNode;
  splitChevron?: boolean;
}) {
  const className = splitChevron
    ? "mt-5 flex h-11 w-full items-center overflow-hidden rounded-xl bg-[#1a1a1a] text-[14px] font-medium text-white cursor-default"
    : `${PRIMARY_BUTTON_CLASS} cursor-default hover:bg-[#1a1a1a]`;

  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title="Subscriptions are available in the Ghost desktop app"
      className={className}
    >
      <span className="flex flex-1 items-center justify-center">{children}</span>
      {splitChevron ? (
        <>
          <span className="h-5 w-px bg-white/20" />
          <span className="flex w-10 items-center justify-center">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </>
      ) : null}
    </button>
  );
}

export function PricingContent() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const { current, original } = priceForInterval("pro", interval);

  return (
    <div className="flex w-full flex-col items-center">
      <BillingToggle interval={interval} onChange={setInterval} />

      <p className="mt-6 max-w-[520px] text-center text-[13px] leading-relaxed text-zinc-500">
        Pro subscriptions are purchased in the Ghost desktop app. Plan buttons here are for
        preview only.
      </p>

      <div className="mt-10 flex w-full max-w-[1080px] items-stretch gap-5">
        <div className="flex min-w-0 flex-1">
          <div className={CARD_CLASS}>
            <h3 className="text-[15px] font-semibold text-zinc-900">Starter</h3>
            <div className="mt-3">
              <span className="text-[36px] font-semibold leading-none tracking-[-0.03em] text-zinc-900">
                Free
              </span>
            </div>
            <PlaceholderPlanButton splitChevron>Get for Mac</PlaceholderPlanButton>
            <p className="mt-4 text-[13px] text-zinc-500">All essential features.</p>
            <FeatureList features={STARTER_FEATURES} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1">
          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-zinc-900">Pro</h3>
              <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                Most popular
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              {original ? (
                <span className="text-[15px] text-zinc-400 line-through">{original}</span>
              ) : null}
              <span className="text-[36px] font-semibold leading-none tracking-[-0.03em] text-zinc-900">
                {current}
              </span>
              <span className="text-[14px] text-zinc-500">/ month</span>
            </div>
            <PlaceholderPlanButton>Subscribe</PlaceholderPlanButton>
            <p className="mt-4 text-[13px] text-zinc-500">Unlimited access.</p>
            <FeatureList
              features={PRO_FEATURES}
              includesLabel="Everything in Starter, plus..."
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1">
          <div className={CARD_CLASS}>
            <h3 className="text-[15px] font-semibold text-zinc-900">Enterprise</h3>
            <div className="mt-3">
              <span className="text-[36px] font-semibold leading-none tracking-[-0.03em] text-zinc-900">
                Custom
              </span>
            </div>
            <p className="mt-4 text-[13px] text-zinc-500">Custom knowledge for teams.</p>
            <div className="mt-auto">
              <Link href={SUPPORT_ROUTES.contact} className={PRIMARY_BUTTON_CLASS}>
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
