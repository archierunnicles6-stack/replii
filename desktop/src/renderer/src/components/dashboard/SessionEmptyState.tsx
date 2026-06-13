export function SessionEmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center px-8 py-16">
      <div className="mb-5 flex h-12 w-12 items-center justify-center text-zinc-400">
        <svg
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900">
        Start your first session
      </h2>
      <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-zinc-500">
        Ghost provides live AI help during your conversation and generates
        searchable summaries afterwards.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 rounded-full border border-zinc-200/80 bg-white/60 px-6 py-2.5 text-[13px] font-medium text-zinc-700 backdrop-blur-sm transition-colors hover:bg-white/80"
      >
        Start Ghost
      </button>
    </div>
  );
}
