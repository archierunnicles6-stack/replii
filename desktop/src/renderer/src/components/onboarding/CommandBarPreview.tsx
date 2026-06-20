import { RepliiLogo } from "../ui";

export function CommandBarPreview({
  visible = true,
}: {
  visible?: boolean;
}) {
  return (
    <div
      className={`w-full max-w-[520px] transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-[22px] border border-zinc-200/80 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="flex items-center text-[15px] text-zinc-400">
            <span className="mr-0.5 inline-block h-[17px] w-[2px] animate-pulse bg-zinc-400" />
            Ask anything
          </span>
          <span className="flex h-7 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-[13px] text-zinc-400">
            ↵
          </span>
        </div>

        <div className="border-t border-zinc-100" />

        <div className="flex items-center gap-3 px-4 py-3">
          <RepliiLogo className="h-6 w-6" />

          <div className="flex flex-1 items-center justify-center gap-5 text-zinc-400">
            <ToolbarIcon>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </ToolbarIcon>
            <ToolbarIcon>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </ToolbarIcon>
            <ToolbarIcon>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </ToolbarIcon>
          </div>

          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-[11px] text-zinc-400">
            ↓
          </span>
        </div>
      </div>
    </div>
  );
}

function ToolbarIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      {children}
    </svg>
  );
}
