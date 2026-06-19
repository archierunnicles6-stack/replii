export function SessionEmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-8 py-16">
      <p className="text-[15px] font-medium text-zinc-800">
        Ready for your first call?
      </p>
      <p className="mt-2 max-w-sm text-center text-[14px] text-zinc-500">
        Start Ghost on your next meeting — you&apos;ll see live suggestions within minutes.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 rounded-full bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] px-6 py-2.5 text-[14px] font-medium text-white shadow-[0_2px_12px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-90"
      >
        Start Ghost
      </button>
    </div>
  );
}
