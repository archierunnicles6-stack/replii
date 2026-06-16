const features = [
  {
    title: "Listen",
    description:
      "Ghost hears every word on your sales call — objections, questions, and buying signals — in real time.",
    icon: MicIcon,
  },
  {
    title: "Answers",
    description:
      "Get the exact words to say next. One sharp suggestion, surfaced the moment your prospect stops talking.",
    icon: SparkleIcon,
  },
  {
    title: "Onboarding",
    description:
      "New reps ramp faster with live coaching during calls instead of memorizing scripts.",
    icon: BookIcon,
  },
  {
    title: "Objection handling",
    description:
      "Price, timing, and competitor objections handled in the moment — not after the call ends.",
    icon: ShieldIcon,
  },
];

export function InTheMoment() {
  return (
    <section id="product" className="bg-white">
      <div className="mx-auto max-w-[720px] px-6 py-24 md:py-32">
        <h2 className="text-center text-[2rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.5rem]">
          Ghost helps in the moment — when it matters most.
        </h2>

        <ul className="mt-16 space-y-10">
          {features.map((feature) => (
            <li key={feature.title} className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f0fe]">
                <feature.icon className="h-[18px] w-[18px] text-[#4b8bf5]" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#0a0a0a]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-[1.6] text-[#52525b]">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.09 3.36L16.5 6.5l-3.36 1.09L12 11l-1.09-3.41L7.5 6.5l3.41-1.14L12 2z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
