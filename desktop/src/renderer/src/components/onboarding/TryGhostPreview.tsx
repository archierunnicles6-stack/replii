export function TryGhostPreview({
  overlayVisible = true,
}: {
  overlayVisible?: boolean;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-none">
      {/* Grid background */}
      <div
        className="absolute inset-0 bg-[#e9edf2]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Blurred video call */}
      <div className="absolute inset-6 overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
        <div className="absolute inset-0 bg-[#1a1a1a]" />
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#4a5d6e] to-[#2a3540]">
            <div className="absolute inset-0 flex items-center justify-center blur-md">
              <div className="h-24 w-24 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#5a4a5e] to-[#322a38]">
            <div className="absolute inset-0 flex items-center justify-center blur-md">
              <div className="h-24 w-24 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        <div className="absolute bottom-4 right-4">
          <span className="rounded-lg bg-[#e53935] px-4 py-1.5 text-[11px] font-medium text-white opacity-60 blur-[1px]">
            End
          </span>
        </div>
      </div>

      {/* Floating Ghost overlay — light theme */}
      <div
        className={`relative z-10 flex w-full max-w-[400px] flex-col items-center px-4 transition-all duration-200 ${
          overlayVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center gap-0.5 rounded-full border border-black/[0.08] bg-white/90 px-1.5 py-1 shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.07]">
            <svg className="h-3.5 w-3.5 text-gray-700" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 6v12M12 12l5.5 3.5M12 12l-5.5 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-medium text-gray-600">Hide</span>
          <span className="mr-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.05]">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-gray-600" />
          </span>
        </div>

        <div className="mt-2 w-full overflow-hidden rounded-[20px] border border-black/[0.07] bg-white/90 shadow-[0_12px_48px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-x-1 px-3 py-2.5 text-[10px] font-medium text-gray-400">
            <span className="text-gray-800">✦ Assist</span>
            <span className="text-gray-300">·</span>
            <span>What should I say?</span>
            <span className="text-gray-300">·</span>
            <span>Follow-up questions</span>
            <span className="text-gray-300">·</span>
            <span>Recap</span>
          </div>

          <div className="space-y-2 px-3 pb-2">
            <div className="flex justify-end">
              <div className="max-w-[240px] rounded-2xl rounded-br-md bg-[#1e3a5f] px-3.5 py-2.5 text-[12px] leading-snug text-white">
                Is it secure? We handle pretty sensitive info.
              </div>
            </div>
            <p className="px-1 text-[12px] leading-[1.6] text-gray-700">
              We&apos;re SOC2 compliant, use end-to-end encryption, and your
              data is private to your org. Plus, you control what&apos;s stored
              and can request deletion anytime.
            </p>
          </div>

          <div className="px-3 pb-3">
            <div className="rounded-[14px] bg-gray-50 border border-black/[0.05] px-3.5 py-2.5">
              <p className="text-[11px] leading-relaxed text-gray-400">
                Suggestions appear automatically — or type to override
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-black/[0.07] px-2.5 py-0.5 text-[10px] font-medium text-gray-600">
                    Smart
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center text-gray-400">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </span>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6] text-white shadow-[0_2px_12px_rgba(59,130,246,0.35)]">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M13 6l6 6-6 6"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
