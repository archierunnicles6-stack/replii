import { MAC_DOWNLOAD_GITHUB_URL } from "@/lib/download";

export function MacInstallHint({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-left text-[13px] leading-relaxed text-amber-950/90 ${className}`}
    >
      <p className="font-medium text-amber-950">After the DMG downloads</p>
      <ol className="mt-2 list-decimal space-y-1 pl-4">
        <li>Open <strong>Replii.dmg</strong> from Downloads</li>
        <li>
          Double-click <strong>Install Replii.command</strong> (not the Replii icon)
        </li>
        <li>
          If macOS says it can&apos;t verify Replii: right-click Replii in Applications →{" "}
          <strong>Open</strong> → <strong>Open</strong>
        </li>
      </ol>
      <p className="mt-2 text-[12px] text-amber-900/70">
        Download didn&apos;t start?{" "}
        <a
          href={MAC_DOWNLOAD_GITHUB_URL}
          className="font-medium underline underline-offset-2 hover:text-amber-950"
        >
          Direct download from GitHub
        </a>
      </p>
    </div>
  );
}
