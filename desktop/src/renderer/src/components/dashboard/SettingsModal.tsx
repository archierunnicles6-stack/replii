import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";
import { removeProfileAvatar, isAvatarImage, uploadProfileAvatar } from "../../lib/avatar";
import { useAppStore } from "../../store/useAppStore";
import {
  canUseDetectabilityToggle,
  effectiveContentProtection,
  normalizedInvisibleSetting,
} from "../../store/types";
import { BillingPanel } from "../settings/BillingPanel";
import { UpgradeModal } from "../pricing/UpgradeModal";
import { UserAvatar } from "../ui/UserAvatar";

export type SettingsSection =
  | "general"
  | "billing"
  | "keybinds"
  | "profile"
  | "language"
  | "release-notes"
  | "help"
  | "contact";

const MAIN_NAV: { id: SettingsSection; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "settings" },
  { id: "billing", label: "Billing", icon: "billing" },
  { id: "keybinds", label: "Keybinds", icon: "keyboard" },
  { id: "profile", label: "Profile", icon: "user" },
  { id: "language", label: "Language", icon: "language" },
];

const SUPPORT_NAV: { id: SettingsSection; label: string; icon: string }[] = [
  { id: "release-notes", label: "Release Notes", icon: "notes" },
  { id: "help", label: "Help Center", icon: "help" },
  { id: "contact", label: "Contact Support", icon: "contact" },
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Chinese",
  "Japanese",
];

const KEYBINDS = [
  ["⌘ Enter", "Ask AI / Assist"],
  ["⌘ R", "Clear session context"],
  ["⌘ ← →", "Move overlay"],
  ["⌘ \\", "Hide / show overlay"],
];

const FAQ = [
  {
    q: "How do I start Ghost on a sales call?",
    a: "Click Start Ghost from the dashboard. The overlay appears on your screen and begins listening automatically.",
  },
  {
    q: "Is Ghost visible on screen share?",
    a: "On Free, Solo, and Pro, Ghost is always detectable during screen share. Upgrade to Undetectable to hide the overlay from Zoom, Meet, Teams, and recordings.",
  },
  {
    q: "Does Ghost join my calls?",
    a: "Never. Ghost runs locally on your machine. No bots, no extra participants.",
  },
];

function NavIcon({ name }: { name: string }) {
  const cls = "h-4 w-4 shrink-0";
  switch (name) {
    case "settings":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "keyboard":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "billing":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case "user":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "language":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      );
    case "notes":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "help":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "contact":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "logout":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    case "quit":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function SettingsToggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-zinc-200"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function SettingsRow({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-zinc-900">{title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function OutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2 border-b border-zinc-100 pb-5">
      <h2 className="text-[15px] font-semibold text-zinc-900">{title}</h2>
      <p className="mt-1 text-[12px] text-zinc-500">{subtitle}</p>
    </div>
  );
}

function GeneralPanel({ onRequestUpgrade }: { onRequestUpgrade: () => void }) {
  const { settings, updateSettings, plan } = useAppStore();
  const detectabilityUnlocked = canUseDetectabilityToggle(plan);
  const invisible = normalizedInvisibleSetting(plan, settings.invisible);
  const detectable = !invisible;

  const handleDetectable = (value: boolean) => {
    if (value) {
      updateSettings({ invisible: false });
      void window.ghost?.setContentProtection(
        effectiveContentProtection(plan, false),
      );
      return;
    }

    if (!detectabilityUnlocked) {
      onRequestUpgrade();
      return;
    }

    updateSettings({ invisible: true });
    void window.ghost?.setContentProtection(
      effectiveContentProtection(plan, true),
    );
  };

  return (
    <div>
      <PanelHeader title="General" subtitle="Customize how Ghost works for you" />

      <div className="divide-y divide-zinc-100">
        <SettingsRow
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
          title="Ghost Version"
          description="You are currently using Ghost version 0.1.0"
          action={
            <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-[12px] font-medium text-zinc-500">
              v0.1.0
            </span>
          }
        />

        <SettingsRow
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          title="Detectable on screen share"
          description={
            detectabilityUnlocked
              ? detectable
                ? "Ghost is visible to screen-sharing software"
                : "Ghost is hidden from screen-sharing software"
              : "Turn off to hide Ghost from Zoom, Meet, and recordings — requires Pro + Undetectability"
          }
          action={
            <SettingsToggle checked={detectable} onChange={handleDetectable} />
          }
        />
      </div>
    </div>
  );
}

function BillingSettingsPanel() {
  return <BillingPanel />;
}

function KeybindsPanel() {
  return (
    <div>
      <PanelHeader title="Keybinds" subtitle="Keyboard shortcuts for Ghost overlay" />
      <div className="overflow-hidden rounded-xl border border-zinc-200">
        {KEYBINDS.map(([key, desc], i) => (
          <div
            key={key}
            className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-zinc-100" : ""}`}
          >
            <span className="text-[13px] text-zinc-700">{desc}</span>
            <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel() {
  const user = useAppStore((s) => s.user);
  const plan = useAppStore((s) => s.plan);
  const updateUser = useAppStore((s) => s.updateUser);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setError(null);
    try {
      const avatar = await uploadProfileAvatar(user.id, file);
      updateUser({ avatar });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    setUploading(true);
    setError(null);
    try {
      const avatar = await removeProfileAvatar(user.name, user.email);
      updateUser({ avatar });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PanelHeader title="Profile" subtitle="Your Ghost account details" />
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <UserAvatar
              avatar={user?.avatar}
              name={user?.name}
              email={user?.email}
              className="h-16 w-16 rounded-2xl text-xl"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50"
              aria-label="Change profile photo"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-zinc-900">{user?.name ?? "User"}</p>
            <p className="text-[12px] text-zinc-500">{user?.email ?? "—"}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              {plan} plan
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <OutlineButton onClick={() => inputRef.current?.click()}>
                {uploading ? "Saving…" : "Change photo"}
              </OutlineButton>
              {user?.avatar && isAvatarImage(user.avatar) && (
                <button
                  type="button"
                  onClick={() => void handleRemove()}
                  disabled={uploading}
                  className="rounded-lg px-3.5 py-1.5 text-[12px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            {error && (
              <p className="mt-2 text-[12px] text-red-600">{error}</p>
            )}
            <p className="mt-2 text-[11px] text-zinc-400">
              JPG, PNG, or WebP · max 2 MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguagePanel() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div>
      <PanelHeader title="Language" subtitle="Language for live meeting transcription" />
      <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 px-4 py-3">
        <span className="text-[13px] text-zinc-800">Meeting audio language</span>
        <select
          value={settings.meetingLanguage}
          onChange={(e) => updateSettings({ meetingLanguage: e.target.value })}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[12px]"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ReleaseNotesPanel() {
  return (
    <div>
      <PanelHeader title="Release Notes" subtitle="What's new in Ghost" />
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 p-4">
          <p className="text-[12px] font-semibold text-zinc-900">v0.1.0</p>
          <p className="mt-1 text-[12px] text-zinc-500">Initial release — live AI coaching, overlay, and meeting summaries.</p>
        </div>
      </div>
    </div>
  );
}

function HelpPanel() {
  return (
    <div>
      <PanelHeader title="Help Center" subtitle="Everything you need to win more deals" />
      <div className="space-y-2">
        {FAQ.map((item) => (
          <details key={item.q} className="rounded-xl border border-zinc-200 bg-white">
            <summary className="cursor-pointer px-4 py-3 text-[13px] font-medium text-zinc-900">
              {item.q}
            </summary>
            <p className="border-t border-zinc-100 px-4 pb-3 pt-2 text-[12px] leading-relaxed text-zinc-600">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

function ContactPanel() {
  return (
    <div>
      <PanelHeader title="Contact Support" subtitle="We're here to help" />
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-center">
        <p className="text-[13px] font-medium text-zinc-800">Email us anytime</p>
        <p className="mt-1 text-[12px] text-zinc-500">support@ghost.app — we respond within 24 hours.</p>
        <button
          type="button"
          onClick={() => void window.ghost?.openExternal?.("mailto:support@ghost.app")}
          className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Send email
        </button>
      </div>
    </div>
  );
}

function SettingsContent({
  section,
  onRequestUpgrade,
}: {
  section: SettingsSection;
  onRequestUpgrade: () => void;
}) {
  switch (section) {
    case "general":
      return <GeneralPanel onRequestUpgrade={onRequestUpgrade} />;
    case "billing":
      return <BillingSettingsPanel />;
    case "keybinds":
      return <KeybindsPanel />;
    case "profile":
      return <ProfilePanel />;
    case "language":
      return <LanguagePanel />;
    case "release-notes":
      return <ReleaseNotesPanel />;
    case "help":
      return <HelpPanel />;
    case "contact":
      return <ContactPanel />;
    default:
      return <GeneralPanel onRequestUpgrade={onRequestUpgrade} />;
  }
}

function SidebarNavItem({
  item,
  active,
  onClick,
}: {
  item: { id: SettingsSection; label: string; icon: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
        active
          ? "bg-zinc-100 font-medium text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`}
    >
      <NavIcon name={item.icon} />
      {item.label}
    </button>
  );
}

export function SettingsModal({
  onClose,
  initialSection = "general",
}: {
  onClose: () => void;
  initialSection?: SettingsSection;
}) {
  const navigate = useNavigate();
  const logout = useAppStore((s) => s.logout);
  const [section, setSection] = useState<SettingsSection>(initialSection);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const openBillingUpgrade = () => {
    setUpgradeOpen(true);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await getSupabase()?.auth.signOut();
    }
    logout();
    onClose();
    navigate("/auth");
  };

  const handleQuit = () => {
    void window.ghost?.quit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className={`no-drag relative flex w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl ${
          section === "billing"
            ? "h-[min(640px,calc(100vh-48px))] max-w-[min(900px,calc(100vw-48px))]"
            : "h-[min(560px,calc(100vh-48px))] max-w-[720px]"
        }`}
      >
        {/* Sidebar */}
        <aside className="flex w-[200px] shrink-0 flex-col border-r border-zinc-200 bg-[#fafafa]">
          <div className="flex items-center px-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700"
              aria-label="Close settings"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-2">
            {MAIN_NAV.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={section === item.id}
                onClick={() => setSection(item.id)}
              />
            ))}

            <p className="mb-1 mt-4 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Support
            </p>
            {SUPPORT_NAV.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={section === item.id}
                onClick={() => setSection(item.id)}
              />
            ))}
          </nav>

          <div className="border-t border-zinc-200 px-2 py-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <NavIcon name="logout" />
              Sign out
            </button>
            <button
              type="button"
              onClick={handleQuit}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <NavIcon name="quit" />
              Quit Ghost
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
          <SettingsContent
            section={section}
            onRequestUpgrade={openBillingUpgrade}
          />
        </div>
      </div>

      {upgradeOpen ? (
        <UpgradeModal onClose={() => setUpgradeOpen(false)} />
      ) : null}
    </div>
  );
}
