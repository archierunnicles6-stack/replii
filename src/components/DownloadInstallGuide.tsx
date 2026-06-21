"use client";

import { getDownloadInfo } from "@/lib/download";
import { useDownloadPlatform } from "@/hooks/useDownloadPlatform";

export function DownloadInstallGuide() {
  const platform = useDownloadPlatform();
  const { filename } = getDownloadInfo(platform);

  if (platform === "windows") {
    return (
      <div className="mt-10 space-y-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-[13px] font-semibold text-amber-900">
            Windows blocked or warned about Replii?
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-amber-900/80">
            New apps may show SmartScreen (&quot;Windows protected your PC&quot;) or Defender
            warnings until the installer is widely distributed. Click <strong>More info</strong>{" "}
            → <strong>Run anyway</strong>, or choose <strong>Keep</strong> if your browser
            flags the download.
          </p>
        </div>

        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
            Windows install
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-zinc-600">
            <li>
              Download and run <strong>{filename}</strong>
            </li>
            <li>Follow the installer prompts (choose install location if asked)</li>
            <li>Launch Replii from the Start menu or desktop shortcut</li>
            <li>Allow microphone access when prompted</li>
            <li>
              Click <strong>Start Replii</strong> on your next sales call
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
            Build from source
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-[13px] leading-relaxed text-zinc-100">
{`cd desktop
npm install
npm run dev            # dev
npm run package:win    # build Replii-Setup.exe`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-[13px] font-semibold text-amber-900">macOS blocked Replii?</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-amber-900/80">
          Unsigned apps show &quot;Apple could not verify&quot; or &quot;damaged&quot;. After installing to
          Applications, run this once in Terminal:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[12px] text-zinc-100">
{`xattr -cr /Applications/Replii.app
codesign --force --deep --sign - /Applications/Replii.app
open /Applications/Replii.app`}
        </pre>
        <p className="mt-2 text-[13px] text-amber-900/70">
          Fastest fix: in the DMG, double-click <strong>Install Replii.command</strong> (installs +
          opens), or <strong>Open Replii.command</strong> to try without installing. If you already
          dragged Replii to Applications, right-click it → <strong>Open</strong> →{" "}
          <strong>Open</strong> again (do not double-click the app icon).
        </p>
      </div>

      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
          Mac install
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-zinc-600">
          <li>
            Download and open <strong>{filename}</strong>
          </li>
          <li>Drag Replii into Applications (or run Install Replii.command)</li>
          <li>If blocked, use the Terminal fix above</li>
          <li>Open Replii — allow mic when prompted</li>
          <li>
            Click <strong>Start Replii</strong> on your next sales call
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
          Build from source
        </h2>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-[13px] leading-relaxed text-zinc-100">
{`cd desktop
npm install
npm run dev          # dev
npm run package:mac  # build Replii.dmg`}
        </pre>
      </div>
    </div>
  );
}
