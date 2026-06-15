import Link from "next/link";
import { OverlayMockup } from "./OverlayMockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14">
      <HeroBackground />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <h1 className="font-serif text-balance text-[2.75rem] leading-[1.08] tracking-[-0.02em] text-[#0a0a0a] sm:text-[3.5rem] md:text-[4.25rem]">
          It&apos;s like Googling Mid-Sentence
        </h1>

        <p className="mt-5 max-w-[560px] text-balance text-[17px] leading-[1.6] text-[#3f3f46] md:text-[18px]">
          Ghost gives you the answers you didn&apos;t study for in every
          conversation, without you even having to ask.
        </p>

        <Link
          href="/download"
          id="download"
          className="mt-8 inline-flex h-[48px] items-center gap-2.5 rounded-full bg-[#3b82f6] px-7 text-[15px] font-semibold text-white shadow-[0_0_32px_rgba(59,130,246,0.45)] transition-all hover:bg-[#2563eb] hover:shadow-[0_0_40px_rgba(59,130,246,0.55)] active:scale-[0.98]"
        >
          <AppleIcon />
          Get for Mac
        </Link>

        <div className="relative mt-14 w-full max-w-5xl md:mt-20">
          <ProductShowcase />
        </div>
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: "#f5f6f8" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 8% 42%, rgba(147, 197, 253, 0.55) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 92% 38%, rgba(167, 139, 250, 0.5) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.85) 1.5px, transparent 1.5px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

function ProductShowcase() {
  return (
    <div className="relative overflow-hidden rounded-[28px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] md:p-10 md:pb-12">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #fde68a 0%, #fdba74 35%, #fb923c 65%, #f97316 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.35) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255,255,255,0.35) 2px, transparent 2px)
          `,
          backgroundSize: "80px 80px",
          transform: "perspective(600px) rotateX(52deg) scale(1.4)",
          transformOrigin: "center 80%",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[55%] w-[140%] -translate-x-1/2 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 50% 100%, rgba(255,255,255,0.7) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <OverlayMockup className="shadow-[0_32px_64px_rgba(0,0,0,0.28)]" />
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
