export function MeetingHelp() {
  return (
    <section id="product" className="border-t border-[#f0f0f2] bg-white">
      <div className="mx-auto max-w-[1080px] px-6 pb-20 pt-14 md:pb-28 md:pt-20">
        <h2 className="text-[1.85rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.25rem]">
          How Ghost helps during a call
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <ListeningCard />
          <AssistingCard />
        </div>
      </div>
    </section>
  );
}

function ListeningCard() {
  return (
    <div className="relative flex min-h-[360px] flex-col overflow-hidden rounded-[22px] bg-[#4b8bf5] px-5 pb-7 pt-7 md:min-h-[380px] md:px-7 md:pt-8">
      <div>
        <h3 className="text-[1.1rem] font-medium leading-[1.35] tracking-[-0.02em] text-white md:text-[1.2rem]">
          Ghost{" "}
          <span className="mx-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 align-middle text-[0.9rem] font-medium backdrop-blur-sm md:text-[0.95rem]">
            <WaveformIcon className="h-3 w-3 text-white" />
            listens
          </span>{" "}
          in to the conversation
        </h3>
        <p className="mt-2.5 max-w-[340px] text-[13px] leading-[1.55] text-white/75">
          It picks up the context of your call in real time, so it can coach you
          when you need it.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-5">
        <p className="text-[2.5rem] font-semibold tabular-nums leading-none tracking-[-0.04em] text-white md:text-[2.75rem]">
          00:11
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
          <span className="text-[11px] font-medium text-white/80">Recording</span>
        </div>
        <WaveformGraphic className="mt-5 w-full max-w-[240px] text-white/90" />
      </div>
    </div>
  );
}

function AssistingCard() {
  return (
    <div className="relative flex min-h-[360px] flex-col overflow-hidden rounded-[22px] border border-[#ececef] bg-[#f7f8fa] px-5 pb-7 pt-7 md:min-h-[380px] md:px-7 md:pt-8">
      <div>
        <h3 className="text-[1.1rem] font-medium leading-[1.35] tracking-[-0.02em] text-[#0a0a0a] md:text-[1.2rem]">
          When you need help, Ghost{" "}
          <span className="mx-1 inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e7] bg-white px-2.5 py-0.5 align-middle text-[0.9rem] font-medium text-[#0a0a0a] shadow-sm md:text-[0.95rem]">
            <PlusIcon className="h-3 w-3 text-[#4b8bf5]" />
            assists
          </span>{" "}
          you instantly
        </h3>
        <p className="mt-2.5 max-w-[340px] text-[13px] leading-[1.55] text-[#71717a]">
          Hit Cmd/Ctrl + Enter and Ghost helps you with AI in the moment.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center py-5">
        <KeyboardShortcutGraphic />
      </div>
    </div>
  );
}

function KeyboardShortcutGraphic() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="flex h-[68px] w-[68px] items-center justify-center rounded-[14px] bg-gradient-to-b from-white to-[#eef2f7]"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 0 rgba(255,255,255,0.8), 0 12px 28px rgba(15,23,42,0.1)",
          }}
        >
          <span className="text-[1.6rem] font-medium leading-none text-[#334155]">⌘</span>
        </div>
        <span className="text-[10px] font-medium text-[#a1a1aa]">command</span>
      </div>

      <span className="mb-4 text-[16px] font-light text-[#d4d4d8]" aria-hidden>
        +
      </span>

      <div
        className="flex h-[68px] w-[84px] items-center justify-center rounded-[14px] bg-gradient-to-b from-white to-[#eef2f7]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 0 rgba(255,255,255,0.8), 0 12px 28px rgba(15,23,42,0.1)",
        }}
      >
        <EnterIcon className="h-7 w-7 text-[#64748b]" />
      </div>
    </div>
  );
}

function WaveformGraphic({ className = "" }: { className?: string }) {
  const bars = [16, 24, 20, 32, 26, 36, 22, 34, 18, 30, 22, 34, 16, 28, 20, 32, 20, 26];

  return (
    <div className={`flex h-8 items-end justify-center gap-[3px] ${className}`}>
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-current"
          style={{ height: `${height}px`, opacity: 0.35 + (i % 3) * 0.2 }}
        />
      ))}
    </div>
  );
}

function WaveformIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="6" width="2" height="4" rx="1" />
      <rect x="5" y="4" width="2" height="8" rx="1" />
      <rect x="9" y="2" width="2" height="12" rx="1" />
      <rect x="13" y="5" width="2" height="6" rx="1" />
    </svg>
  );
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  );
}

function EnterIcon({ className = "" }: { className?: string }) {
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
      <path d="M9 14l-4 4 4 4" />
      <path d="M20 4v7a4 4 0 0 1-4 4H5" />
    </svg>
  );
}
