const actionItems = [
  {
    lead: "Send security one-pager",
    rest: "before end of week to the RevOps stakeholder.",
  },
  {
    lead: "Schedule technical demo",
    rest: "with the buying committee for next Tuesday.",
  },
  {
    lead: "Follow up on Gong comparison",
    rest: "with a differentiation doc focused on live coaching.",
  },
  {
    lead: "Confirm pilot scope",
    rest: "for a 5-rep rollout starting next month.",
  },
];

const terminology = [
  {
    term: "Live coaching",
    definition: "Real-time response suggestions surfaced during the call.",
  },
  {
    term: "Deal score",
    definition: "AI-generated health rating based on call signals.",
  },
];

export function InstantMeetingNotes() {
  return (
    <section id="meeting-notes" className="border-t border-[#f0f0f2] bg-white">
      <div className="mx-auto max-w-[1080px] px-6 pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-[1.85rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.25rem]">
            Instant meeting notes
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-[#71717a] md:text-[16px]">
            The easiest way to get beautiful, shareable meeting notes.
          </p>
        </div>

        <div className="mt-12 rounded-[28px] bg-[linear-gradient(180deg,#dbeafe_0%,#eef2f7_100%)] p-5 md:mt-14 md:p-8 lg:p-10">
          <MeetingNotesMockup />
        </div>
      </div>
    </section>
  );
}

function MeetingNotesMockup() {
  return (
    <div className="relative mx-auto max-w-[920px]">
      <div className="overflow-hidden rounded-[18px] border border-[#e4e4e7] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
        <div className="flex items-center gap-2 border-b border-[#f0f0f2] px-4 py-3 md:px-5">
          <WindowDot color="#ff5f57" />
          <WindowDot color="#febc2e" />
          <WindowDot color="#28c840" />
        </div>

        <div className="border-b border-[#f0f0f2] px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-[#ececef] bg-[#fafafa] px-3.5 py-2">
              <SearchIcon className="h-3.5 w-3.5 text-[#a1a1aa]" />
              <span className="text-[12px] text-[#a1a1aa]">Search or ask anything...</span>
            </div>
            <button
              type="button"
              className="hidden rounded-full bg-[#4b8bf5] px-3.5 py-1.5 text-[12px] font-medium text-white sm:block"
            >
              Start Replii
            </button>
            <Avatar color="#4b8bf5" />
          </div>
        </div>

        <div className="px-5 pb-24 pt-5 md:px-8 md:pt-6">
          <p className="text-[12px] font-medium text-[#a1a1aa]">Monday, Nov 3</p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="max-w-[480px] text-[1.15rem] font-semibold leading-[1.35] tracking-[-0.02em] text-[#0a0a0a] md:text-[1.35rem]">
              Enterprise Pipeline Review — Q4 Expansion
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <UtilityButton label="Follow-up email" />
              <UtilityButton label="Share" chevron />
              <UtilityButton label="General" chevron />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Tab label="Summary" active />
            <Tab label="Transcript" />
            <Tab label="Usage" />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-[15px] font-semibold text-[#0a0a0a]">Action Items</h4>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#71717a]"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                Copy full summary
              </button>
            </div>

            <ul className="mt-4 space-y-3">
              {actionItems.map((item) => (
                <li
                  key={item.lead}
                  className="flex gap-2.5 text-[13px] leading-[1.65] text-[#52525b] md:text-[14px]"
                >
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#a1a1aa]" />
                  <span>
                    <span className="font-semibold text-[#0a0a0a]">{item.lead}</span>{" "}
                    {item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h4 className="text-[15px] font-semibold text-[#0a0a0a]">Terminology</h4>
            <ul className="mt-4 space-y-3">
              {terminology.map((item) => (
                <li
                  key={item.term}
                  className="flex gap-2.5 text-[13px] leading-[1.65] text-[#52525b] md:text-[14px]"
                >
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#a1a1aa]" />
                  <span>
                    <span className="font-semibold text-[#0a0a0a]">{item.term}</span> —{" "}
                    {item.definition}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 w-[min(92%,520px)] -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-[#ececef] bg-white px-3 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#ececef] bg-[#fafafa] px-3 py-1.5 text-[12px] font-medium text-[#0a0a0a]"
          >
            <PlayIcon className="h-3 w-3 text-[#4b8bf5]" />
            Resume Session
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <span className="truncate text-[12px] text-[#a1a1aa]">
              Ask Replii about this meeting...
            </span>
            <ArrowUpIcon className="ml-auto h-4 w-4 shrink-0 text-[#a1a1aa]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowDot({ color }: { color: string }) {
  return (
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

function Avatar({ color }: { color: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 rounded-full border border-white"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

function Tab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-full bg-[#f4f4f5] px-3 py-1 text-[12px] font-medium text-[#0a0a0a]"
          : "rounded-full px-3 py-1 text-[12px] font-medium text-[#a1a1aa]"
      }
    >
      {label}
    </span>
  );
}

function UtilityButton({ label, chevron = false }: { label: string; chevron?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-3 py-1 text-[12px] font-medium text-[#52525b]">
      {label}
      {chevron && <ChevronDownIcon className="h-3 w-3 text-[#a1a1aa]" />}
    </span>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" />
      <path d="M4.5 10.5H3.5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1H9.5a1 1 0 0 1 1 1V4.5" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M5 3.5v9l7-4.5-7-4.5z" />
    </svg>
  );
}

function ArrowUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 12V4M8 4l-3.5 3.5M8 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
