function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 4.2L17.4 7.4 13.2 8.6 12 12.8 10.8 8.6 6.6 7.4l4.2-1.2L12 2Z"
        fill="#9CA3AF"
      />
      <path
        d="M5 14l.7 2.4L8.1 17l-2.4.7L5 20.1l-.7-2.4L2 17l2.4-.6L5 14Z"
        fill="#9CA3AF"
      />
    </svg>
  );
}

const features = [
  {
    title: "Screen monitoring:",
    body: "Ghost can see what's on your screen and understand the context",
  },
  {
    title: "Audio listening:",
    body: "It processes your calls and conversations",
  },
  {
    title: "Proactive assistance:",
    body: "Rather than waiting for questions, it anticipates what you might need",
  },
  {
    title: "Completely undetectable:",
    body: "Ghost is invisible to screen-share, follows your eyes, and doesn't show up in recordings",
  },
];

export function HeroAppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[740px]">
      <div className="relative overflow-hidden rounded-[16px] border border-white/50 bg-white/55 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="border-b border-white/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <span className="text-[13px] font-medium text-[#9ca3af]">AI Response</span>
          </div>
        </div>

        <div
          className="relative space-y-4 px-5 py-4 pb-8 text-left text-[13px] leading-[1.65] text-[#4b5563]"
          style={{
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        >
          <p>
            I can see you&apos;re currently viewing the Ghost website homepage. The AI
            assistant that monitors your screen and audio to provide contextual help before
            you even ask for it.
          </p>
          <p className="font-semibold text-[#111827]">What is Ghost?</p>
          <p>
            Ghost is a proactive AI assistant. Unlike traditional AI chatbots where you need
            to actively ask questions, Ghost runs in the background, continuously observing
            your screen content and listening to your audio to provide relevant assistance
            in real-time.
          </p>
          <p className="font-semibold text-[#111827]">Features:</p>
          <ol className="list-none space-y-2.5 pl-0">
            {features.map((feature, index) => (
              <li key={feature.title}>
                <span className="font-semibold text-[#111827]">
                  {index + 1}. {feature.title}
                </span>{" "}
                {feature.body}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
