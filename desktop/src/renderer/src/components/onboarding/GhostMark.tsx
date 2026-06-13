export function GhostMark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-zinc-900">
      <svg
        className="h-4 w-4 text-zinc-900"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
        />
      </svg>
    </span>
  );
}
