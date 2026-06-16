import { MacDownloadLink } from "./MacDownloadLink";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fa]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(191, 219, 254, 0.45) 0%, rgba(247, 248, 250, 0) 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-12 px-6 py-24 md:py-32">
        <div className="max-w-[560px]">
          <h2 className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.5rem]">
            Sales AI that helps during the call, not after.
          </h2>
          <p className="mt-4 text-[16px] text-[#6b7c93] md:text-[17px]">
            Try Ghost on your next call today.
          </p>
          <div className="mt-8">
            <MacDownloadLink />
          </div>
        </div>

        <div className="relative hidden h-[200px] w-[240px] shrink-0 md:block" aria-hidden>
          <CommandKey />
          <EnterKey />
        </div>
      </div>
    </section>
  );
}

function CommandKey() {
  return (
    <div className="absolute bottom-2 left-0">
      <div
        className="flex h-[88px] w-[88px] items-center justify-center rounded-[18px] bg-[#f8fafc]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.9), 0 0 0 2px rgba(255,255,255,0.65), 0 0 24px rgba(255,255,255,0.95), 0 0 48px rgba(255,255,255,0.55), 0 18px 40px rgba(15,23,42,0.12)",
        }}
      >
        <span className="text-[2rem] font-medium leading-none text-[#334155]">⌘</span>
      </div>
    </div>
  );
}

function EnterKey() {
  return (
    <div className="absolute right-0 top-0">
      <div
        className="flex h-[92px] w-[112px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#ffffff] to-[#eef2f7]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 0 rgba(255,255,255,0.8), 0 16px 36px rgba(15,23,42,0.14)",
        }}
      >
        <svg
          className="h-9 w-9 text-[#64748b]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 14l-4 4 4 4" />
          <path d="M20 4v7a4 4 0 0 1-4 4H5" />
        </svg>
      </div>
    </div>
  );
}
