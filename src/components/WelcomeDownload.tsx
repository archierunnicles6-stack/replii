import { MAC_DOWNLOAD_FILENAME, MAC_DOWNLOAD_URL } from "@/lib/download";

export function WelcomeDownload() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-24 text-center md:py-32">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#a1a1aa]">
          Welcome to
        </p>
        <h2 className="mt-4 text-[2rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.5rem]">
          The Turning Point of Thought.
        </h2>

        <div className="mt-8">
          <a
            href={MAC_DOWNLOAD_URL}
            download={MAC_DOWNLOAD_FILENAME}
            className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[#0a0a0a] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#1a1a1a]"
          >
            <AppleIcon />
            Download for Mac
          </a>
        </div>

        <a
          href="/download"
          className="mt-4 text-[13px] text-[#a1a1aa] underline underline-offset-[3px] transition-colors hover:text-[#71717a]"
        >
          Download for Windows
        </a>
      </div>
    </section>
  );
}

function AppleIcon() {
  return (
    <svg className="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
