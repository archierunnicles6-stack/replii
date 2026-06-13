import Link from "next/link";
import { OverlayMockup } from "./OverlayMockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-[13px] font-medium text-ghost-600">
            Live AI sales coach
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
            #1 invisible AI for sales calls
          </h1>
          <div className="mx-auto my-6 h-px w-12 bg-zinc-300" />
          <p className="text-balance text-lg leading-relaxed text-zinc-500 md:text-xl">
            Ghost listens to your calls and gives you the exact words to say —
            in real time, completely invisible on screen share.
          </p>

          <div
            id="download"
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/download"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-zinc-900 px-6 text-[14px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <AppleIcon />
              Download for Mac
            </Link>
            <Link
              href="/download"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-[14px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <WindowsIcon />
              Get for Windows
            </Link>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <OverlayMockup className="mx-auto max-w-4xl animate-fade-up" />
        </div>
      </div>
    </section>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5.5L10.5 4.1V11.5H3V5.5M10.5 12.5H3V18.5L10.5 17.1V12.5M11.5 3.9L21 2V11.5H11.5V3.9M21 12.5H11.5V20.1L21 21V12.5Z" />
    </svg>
  );
}
