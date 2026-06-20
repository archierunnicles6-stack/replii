const stats = [
  {
    value: "12+",
    title: "Languages",
    description:
      "We support over 12 different languages, including English, Chinese, Spanish, and more.",
  },
  {
    value: "300ms",
    title: "Response time",
    description:
      "We have the fastest live transcription available. Test us against any other competitor.",
  },
  {
    value: "95%",
    title: "Transcription accuracy",
    description:
      "Trusted by many teams for reliable transcription. All processed with industry-leading accuracy.",
  },
];

const summary = [
  "Discovery call with enterprise prospect on Q4 pipeline expansion.",
  "Archie walked through Replii's real-time coaching and manager review workflow.",
  "Dylan asked about CRM integration, security, and team rollout timeline.",
  "Next step: send pricing proposal and schedule a technical demo for the buying committee.",
];

export function RealTimeTranscription() {
  return (
    <section id="transcription" className="border-t border-[#f0f0f2] bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <TranscriptMockup />

          <div>
            <h2 className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.5rem]">
              Real-time transcription
            </h2>

            <div className="mt-10 divide-y divide-[#ececef]">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="grid grid-cols-[88px_1fr] gap-6 py-7 first:pt-0 last:pb-0 md:grid-cols-[104px_1fr] md:gap-8"
                >
                  <p className="text-[2rem] font-semibold leading-none tracking-[-0.03em] text-[#0a0a0a] md:text-[2.25rem]">
                    {stat.value}
                  </p>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#0a0a0a] md:text-[16px]">
                      {stat.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.65] text-[#71717a] md:text-[15px]">
                      {stat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TranscriptMockup() {
  return (
    <div className="rounded-[28px] bg-[#eef2f7] p-5 md:p-7">
      <div className="overflow-hidden rounded-[22px] border border-[#e4e4e7] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-[#f0f0f2] px-5 py-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[12px] font-medium text-[#a1a1aa]">Thursday, Oct 24</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Avatar color="#4b8bf5" />
                <Avatar color="#7c3aed" />
                <Avatar color="#f59e0b" />
              </div>
              <span className="text-[12px] text-[#a1a1aa]">Archie and Dylan, +3 more</span>
            </div>
          </div>

          <h3 className="mt-4 max-w-[420px] text-[1.05rem] font-semibold leading-[1.35] tracking-[-0.02em] text-[#0a0a0a] md:text-[1.15rem]">
            Strategic Sales Growth and Client Relationship Management
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <Tab label="Summary" active />
            <Tab label="Transcript" />
            <Tab label="Chats" />
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 md:px-6 md:py-6">
          {summary.map((line, index) => (
            <p key={index} className="text-[13px] leading-[1.65] text-[#52525b]">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Avatar({ color }: { color: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 rounded-full border-2 border-white"
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
