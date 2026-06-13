const features = [
  {
    title: "Doesn't join meetings",
    description:
      "Ghost never joins your calls. No bots, no extra guests on the participant list.",
    icon: "👤",
  },
  {
    title: "Invisible to screen share",
    description:
      "The overlay is hidden from Zoom, Meet, Teams, and every recording tool.",
    icon: "👁",
  },
  {
    title: "Follows your eyes",
    description:
      "Drag the pill anywhere on screen. Position it exactly where you're looking.",
    icon: "↔",
  },
  {
    title: "Works with every tool",
    description:
      "Compatible with Zoom, Google Meet, Microsoft Teams, Webex, and more.",
    icon: "⚡",
  },
];

const integrations = ["Zoom", "Slack", "Webex", "Microsoft Teams", "Google Meet"];

export function Features() {
  return (
    <section id="features" className="border-t border-zinc-200">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Invisible in every way
          </h2>
          <div className="mx-auto my-5 h-px w-12 bg-zinc-300" />
          <p className="text-[15px] leading-relaxed text-zinc-500">
            A suite of features to use Ghost without a trace.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-md"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-[13px] font-medium text-zinc-400">
            Compatible with every tool
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {integrations.map((name) => (
              <span
                key={name}
                className="text-[14px] font-medium text-zinc-400 transition-colors hover:text-zinc-600"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: "12+", label: "Languages", detail: "English, Spanish, French, and more" },
  { value: "300ms", label: "Response time", detail: "Fastest live transcription available" },
  { value: "95%", label: "Accuracy", detail: "Industry-leading transcription quality" },
];

export function Stats() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/50">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Real-time transcription
          </h2>
          <div className="mx-auto my-5 h-px w-12 bg-zinc-300" />
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-5xl font-semibold tracking-tight text-zinc-900">
                {stat.value}
              </p>
              <p className="mt-2 text-[15px] font-semibold text-zinc-700">
                {stat.label}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
