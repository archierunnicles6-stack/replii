import { GhostLogo } from "./GhostLogo";

export function OverlayMockup({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-black/10 bg-zinc-950 shadow-2xl shadow-zinc-900/20 ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#1e1e22] px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="overflow-hidden bg-[#1a1a1f]">
        {/* Fake meeting background */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-zinc-800 to-zinc-900 p-6">
          <div className="absolute inset-0 opacity-30">
            <div className="grid h-full grid-cols-2 gap-3 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-zinc-700/50"
                  style={{ height: i <= 2 ? "60%" : "40%" }}
                />
              ))}
            </div>
          </div>

          {/* Ghost overlay pill */}
          <div className="absolute left-4 top-4 z-10">
            <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-[#1C1C24] px-1 py-1 shadow-lg">
              <div className="px-1.5">
                <GhostLogo variant="mark" className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                Live · 12:34
              </div>
              <div className="mx-0.5 h-4 w-px bg-white/10" />
              <button className="px-2 text-[11px] text-white/40">⌃</button>
            </div>

            {/* Suggestion panel */}
            <div className="mt-1.5 w-[220px] rounded-[14px] border border-white/10 bg-[#1C1C24] p-3">
              <div className="rounded-[10px] border border-ghost-500/25 bg-ghost-500/10 p-2.5">
                <p className="text-[9px] font-medium uppercase tracking-wider text-ghost-400">
                  Say this
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/85">
                  &ldquo;What would need to be true for you to move forward this
                  quarter?&rdquo;
                </p>
              </div>
              <div className="mt-2.5">
                <div className="mb-1 flex justify-between text-[10px] text-white/35">
                  <span>Deal health</span>
                  <span className="font-medium text-white/60">72</span>
                </div>
                <div className="h-1 rounded-full bg-white/8">
                  <div className="h-full w-[72%] rounded-full bg-ghost-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OverlayMockupCompact() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white px-1 py-1 shadow-sm">
        <div className="px-1.5">
          <GhostLogo className="h-4 w-4" />
        </div>
        <div className="rounded-full border border-ghost-200 bg-ghost-50 px-3 py-1 text-[11px] font-medium text-ghost-600">
          ▶ Start
        </div>
        <div className="mx-0.5 h-4 w-px bg-zinc-200" />
        <button className="px-2 text-[11px] text-zinc-400">⌃</button>
      </div>
    </div>
  );
}
