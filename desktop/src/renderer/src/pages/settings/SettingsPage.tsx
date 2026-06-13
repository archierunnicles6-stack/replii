import { useEffect, useState } from "react";
import { PageHeader, SelectRow, Toggle } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Chinese",
  "Japanese",
];

export function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [displays, setDisplays] = useState<
    Array<{ id: number; label: string }>
  >([]);

  useEffect(() => {
    window.ghost?.getDisplays().then(setDisplays);
  }, []);

  useEffect(() => {
    window.ghost?.setContentProtection(settings.invisible);
  }, [settings.invisible]);

  useEffect(() => {
    if (settings.displayId != null) {
      window.ghost?.moveToDisplay(settings.displayId);
    }
  }, [settings.displayId]);

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Settings"
        description="Configure Ghost for your sales workflow — shortcuts, languages, and invisibility."
      />

      <section className="space-y-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          Invisibility
        </h2>
        <Toggle
          label="Invisible to screen share"
          checked={settings.invisible}
          onChange={(v) => updateSettings({ invisible: v })}
        />
        <Toggle
          label="Hide from taskbar during sessions"
          checked={settings.hideFromTaskbar}
          onChange={(v) => updateSettings({ hideFromTaskbar: v })}
        />
        <Toggle
          label="Screenshot capture for context"
          checked={settings.screenshotCapture}
          onChange={(v) => updateSettings({ screenshotCapture: v })}
        />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          Language
        </h2>
        <SelectRow
          label="Output language"
          value={settings.outputLanguage}
          options={LANGUAGES}
          onChange={(v) => updateSettings({ outputLanguage: v })}
        />
        <SelectRow
          label="Meeting audio language"
          value={settings.meetingLanguage}
          options={LANGUAGES}
          onChange={(v) => updateSettings({ meetingLanguage: v })}
        />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          Display
        </h2>
        {displays.length > 0 && (
          <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <span className="text-[14px] text-zinc-800">Monitor</span>
            <select
              value={settings.displayId ?? displays[0]?.id ?? ""}
              onChange={(e) =>
                updateSettings({ displayId: Number(e.target.value) })
              }
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[13px]"
            >
              {displays.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <Toggle
          label="Disable auto launch on login"
          checked={!settings.autoLaunch}
          onChange={(v) => updateSettings({ autoLaunch: !v })}
        />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          Keyboard shortcuts
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {[
            ["⌘ Enter", "Ask AI / Assist"],
            ["⌘ R", "Clear session context"],
            ["⌘ ← →", "Move overlay"],
            ["⌘ \\", "Hide / show overlay"],
          ].map(([key, desc]) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-[13px] text-zinc-700">{desc}</span>
              <kbd className="rounded bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          App
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[13px] text-zinc-600">
          Ghost v0.1.0
        </div>
        <button
          type="button"
          onClick={() => window.ghost?.quit()}
          className="w-full rounded-xl border border-zinc-200 py-3 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Quit Ghost
        </button>
      </section>
    </div>
  );
}
