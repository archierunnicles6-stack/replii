import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { SettingsModal } from "./SettingsModal";
import { UserAvatar } from "../ui/UserAvatar";
import { useAppStore } from "../../store/useAppStore";

export function DashboardTopBar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const user = useAppStore((s) => s.user);

  const canGoBack = location.pathname !== "/";

  return (
    <header className="drag-region relative flex h-[52px] shrink-0 items-center border-b border-zinc-200/70 bg-[#f7f8fa] px-4 pl-[72px] pr-4">
      <button
        type="button"
        onClick={() => (canGoBack ? navigate(-1) : undefined)}
        disabled={!canGoBack}
        className={`no-drag absolute left-[72px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-colors ${
          canGoBack
            ? "text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700"
            : "cursor-default text-zinc-300"
        }`}
        aria-label="Go back"
      >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
      </button>

      <div className="no-drag mx-auto flex w-full max-w-[520px] items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or ask anything..."
            className="h-9 w-full rounded-full border border-zinc-200/80 bg-white pl-10 pr-4 text-[13px] text-zinc-800 outline-none transition-shadow placeholder:text-zinc-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="shrink-0 overflow-hidden rounded-lg shadow-sm"
            aria-label="Open settings"
          >
            <UserAvatar
              avatar={user?.avatar}
              name={user?.name}
              email={user?.email}
              className="h-8 w-8 rounded-lg text-[13px]"
            />
          </button>
          {settingsOpen && (
            <SettingsModal onClose={() => setSettingsOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
}
