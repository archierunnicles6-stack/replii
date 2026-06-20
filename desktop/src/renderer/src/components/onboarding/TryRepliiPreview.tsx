import { RepliiLogo } from "../ui";

export function TryRepliiPreview({
  overlayVisible = true,
}: {
  overlayVisible?: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-10">
        <div
          className={`w-full max-w-[520px] transition-all duration-300 ease-out ${
            overlayVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-1 scale-[0.98] opacity-0"
          }`}
        >
          <ListeningPillPreview />
        </div>
      </div>
    </div>
  );
}

function ListeningPillPreview() {
  const transcript = "Can you walk me through the pricing tiers?";

  return (
    <div className="flex w-full max-w-[520px] items-center gap-2.5 rounded-full border border-black/[0.08] bg-white/92 px-4 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: "rgba(0,0,0,0.86)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 10px rgba(0,0,0,0.22)",
        }}
      >
        <RepliiLogo className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-[14px] font-semibold leading-none tracking-[-0.01em] text-zinc-800">
          Listening…
        </span>
        <span aria-hidden className="shrink-0 select-none text-[14px] leading-none text-zinc-300">
          ·
        </span>
        <p className="min-w-0 flex-1 truncate whitespace-nowrap text-[14px] leading-none text-zinc-500">
          {transcript}
          <span className="ml-0.5 inline-block h-[13px] w-[2px] animate-pulse bg-zinc-400/70" />
        </p>
      </div>
    </div>
  );
}
