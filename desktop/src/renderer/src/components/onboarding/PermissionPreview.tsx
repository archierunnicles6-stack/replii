function MacToggle({ on, highlight }: { on: boolean; highlight?: boolean }) {
  return (
    <span
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
        on ? "bg-[#007AFF]" : "bg-[#E5E5EA]"
      } ${highlight ? "ring-2 ring-[#007AFF]/30 ring-offset-1" : ""}`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform ${
          on ? "translate-x-[17px]" : "translate-x-[2px]"
        }`}
      />
    </span>
  );
}

function AccessibilitySettingsMock() {
  const apps = [
    { name: "Passwords", on: false, blurred: true },
    { name: "Slack", on: true },
    { name: "Ghost", on: true, highlight: true },
    { name: "zoom", on: true },
  ];

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
      <div className="border-b border-[#E5E5EA] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F2F2F7]">
            <svg className="h-3 w-3 text-[#8E8E93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-black">Accessibility</h3>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-[#8E8E93]">
          Allow the applications below to control your computer.
        </p>
      </div>

      <div className="divide-y divide-[#E5E5EA]">
        {apps.map((app) => (
          <div
            key={app.name}
            className={`relative flex items-center justify-between px-4 py-2.5 ${
              app.highlight ? "bg-[#007AFF]/[0.04]" : ""
            }`}
          >
            <span
              className={`text-[13px] text-black ${app.blurred ? "select-none blur-[3px]" : ""}`}
            >
              {app.name}
            </span>
            <MacToggle on={app.on} highlight={app.highlight} />
            {app.highlight && (
              <svg
                className="pointer-events-none absolute right-11 top-[calc(50%+4px)] h-[18px] w-[14px] -translate-y-1/2 drop-shadow-sm"
                viewBox="0 0 14 18"
                fill="none"
              >
                <path
                  d="M1 1l10.5 7.5L7 9.5l2.5 7.5L1 1z"
                  fill="white"
                  stroke="#1C1C1E"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AccessibilityDialogMock() {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-[#FEFEFE] shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
      <div className="px-5 pb-4 pt-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-200 shadow-inner">
          <svg className="h-6 w-6 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.5 2 6 4.5 6 8c0 2.2 1.2 4.1 3 5.2V18l3-2 3 2v-4.8c1.8-1.1 3-3 3-5.2 0-3.5-2.5-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold leading-snug text-black">
          &ldquo;Ghost&rdquo; would like to control this computer using accessibility features.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-[#8E8E93]">
          Grant access in System Settings → Privacy &amp; Security → Accessibility.
        </p>
      </div>
      <div className="flex border-t border-[#E5E5EA]">
        <button
          type="button"
          className="flex-1 border-r border-[#E5E5EA] py-2.5 text-[13px] text-[#007AFF]"
        >
          Deny
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 text-[13px] font-semibold text-[#007AFF]"
        >
          Open System Settings
        </button>
      </div>
    </div>
  );
}

export function PermissionPreview() {
  return (
    <div className="flex w-full max-w-[340px] shrink-0 flex-col items-stretch gap-5">
      <AccessibilityDialogMock />
      <AccessibilitySettingsMock />
    </div>
  );
}
