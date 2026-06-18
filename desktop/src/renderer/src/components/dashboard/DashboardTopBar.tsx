import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SettingsModal, type SettingsSection } from "./SettingsModal";
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
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("general");
  const user = useAppStore((s) => s.user);
  const pendingSettingsSection = useAppStore((s) => s.pendingSettingsSection);
  const clearPendingSettingsOpen = useAppStore((s) => s.clearPendingSettingsOpen);

  useEffect(() => {
    if (!pendingSettingsSection) return;
    setSettingsSection(pendingSettingsSection as SettingsSection);
    setSettingsOpen(true);
    clearPendingSettingsOpen();
  }, [pendingSettingsSection, clearPendingSettingsOpen]);

  const canGoBack = location.pathname !== "/";

  return (
    <header className="no-drag relative flex h-[52px] shrink-0 items-center border-b border-zinc-100 bg-white px-4 pl-[72px] pr-4">
      {/* Draggable title-bar regions — keep interactive controls in no-drag layers */}
      <div
        className="drag-region absolute inset-y-0 left-0 w-[72px]"
        aria-hidden
      />

      <button
        type="button"
        onClick={() => (canGoBack ? navigate(-1) : undefined)}
        disabled={!canGoBack}
        className={`no-drag absolute left-[72px] top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-colors ${
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

      <div className="no-drag relative z-10 mx-auto flex w-full max-w-[520px] items-center gap-3">
        <div className="relative min-w-0 flex-1">
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
            role="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search meetings..."
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="h-9 w-full select-text rounded-full border border-zinc-200/80 bg-white pl-10 pr-4 text-[13px] text-zinc-900 caret-zinc-900 outline-none transition-shadow placeholder:text-zinc-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setSettingsSection("general");
              setSettingsOpen(true);
            }}
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
            <SettingsModal
              initialSection={settingsSection}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
