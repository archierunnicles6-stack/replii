import { OverlayMockupCompact } from "./OverlayMockup";

const steps = [
  {
    number: "01",
    title: "Ghost listens to the conversation",
    description:
      "It picks up what your prospect says in real time — objections, questions, buying signals — so it can coach you when you need it.",
    visual: "listening",
  },
  {
    number: "02",
    title: "You get the exact words to say",
    description:
      "When your prospect finishes speaking, Ghost surfaces one sharp response suggestion. No scripts. No rambling. Just what to say next.",
    visual: "suggestion",
  },
  {
    number: "03",
    title: "Completely invisible on screen share",
    description:
      "The overlay never appears in Zoom, Meet, or Teams recordings. Only you see the coaching. Your prospect sees nothing.",
    visual: "invisible",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-zinc-200 bg-zinc-50/50">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            How Ghost helps during a call
          </h2>
          <div className="mx-auto my-5 h-px w-12 bg-zinc-300" />
        </div>

        <div className="mt-16 space-y-24 md:space-y-32">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`grid items-center gap-12 md:grid-cols-2 md:gap-16 ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-ghost-500">
                  {step.number}
                </span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                  {step.description}
                </p>
              </div>

              <div className="flex justify-center">
                {step.visual === "listening" && <ListeningVisual />}
                {step.visual === "suggestion" && <SuggestionVisual />}
                {step.visual === "invisible" && <InvisibleVisual />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ListeningVisual() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-400">00:00</span>
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-red-500">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-500" />
          Recording
        </span>
      </div>
      <div className="mt-6 space-y-3">
        {[
          { speaker: "Prospect", text: "We're already using a competitor..." },
          { speaker: "You", text: "Tell me more about what's working." },
          { speaker: "Prospect", text: "Price is the main concern right now." },
        ].map((line, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-[13px] ${
              line.speaker === "Prospect"
                ? "bg-ghost-50 text-ghost-800"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
              {line.speaker}
            </span>
            <p className="mt-0.5">{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestionVisual() {
  return (
    <div className="w-full max-w-sm">
      <OverlayMockupCompact />
      <div className="mt-3 rounded-[14px] border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="rounded-[10px] border border-ghost-200 bg-ghost-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ghost-600">
            Say this
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-800">
            &ldquo;If budget weren&apos;t a factor, would this solve the problem
            you described?&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function InvisibleVisual() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
        <p className="text-[11px] font-medium text-zinc-500">
          What your prospect sees
        </p>
      </div>
      <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 p-4">
        <div className="grid h-full grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-zinc-300/60" />
          ))}
        </div>
      </div>
      <div className="border-t border-zinc-100 px-4 py-2.5">
        <p className="text-[11px] font-medium text-emerald-600">
          ✓ No overlay visible in screen share
        </p>
      </div>
    </div>
  );
}
