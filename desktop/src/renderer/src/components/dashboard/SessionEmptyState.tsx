export function SessionEmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-8 py-16">
      <p className="text-[14px] text-zinc-500">
        No sessions yet. Start Ghost to capture your first conversation.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 rounded-full border border-zinc-200 bg-white px-5 py-2 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        Start Ghost
      </button>
    </div>
  );
}
