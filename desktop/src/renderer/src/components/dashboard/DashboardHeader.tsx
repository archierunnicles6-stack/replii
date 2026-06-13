export function DashboardHeader({
  onRefresh,
  onStartSession,
  canStartSession = true,
  sessionsRemaining,
  isPaid = false,
}: {
  onRefresh: () => void;
  onStartSession: () => void;
  canStartSession?: boolean;
  sessionsRemaining?: number;
  isPaid?: boolean;
}) {
  return (
    <div className="no-drag border-b border-zinc-200/70 bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-800">
            Ghost
          </h1>
          <button
            type="button"
            onClick={onRefresh}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Refresh"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {!isPaid && sessionsRemaining !== undefined && (
            <span className="text-[11px] text-zinc-500">
              {canStartSession
                ? `${sessionsRemaining} free session${sessionsRemaining === 1 ? "" : "s"} left`
                : "Free limit reached"}
            </span>
          )}
          <button
            type="button"
            onClick={onStartSession}
            disabled={!canStartSession}
            title={
              canStartSession
                ? "Start Ghost"
                : "Upgrade to start more sessions on the free plan"
            }
            className="rounded-full bg-gradient-to-b from-[#4d9cf8] to-[#3b82f6] px-4 py-2 text-[12px] font-medium text-white shadow-[0_2px_8px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Ghost
          </button>
        </div>
      </div>
    </div>
  );
}
