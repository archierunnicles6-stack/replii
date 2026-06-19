import { CommandKeysGraphic } from "./CommandKeysGraphic";
import { DownloadLink } from "./DownloadLink";

export function CTA({
  className = "bg-[#f7f8fa]",
  showGlow = true,
}: {
  className?: string;
  showGlow?: boolean;
}) {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      {showGlow ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(191, 219, 254, 0.45) 0%, rgba(247, 248, 250, 0) 70%)",
          }}
          aria-hidden
        />
      ) : null}

      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-12 px-6 py-24 md:py-32">
        <div className="max-w-[560px]">
          <h2 className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0a0a0a] md:text-[2.5rem]">
            Sales AI that helps during the call, not after.
          </h2>
          <p className="mt-4 text-[16px] text-[#6b7c93] md:text-[17px]">
            Try Ghost on your next call today.
          </p>
          <div className="mt-8">
            <DownloadLink />
          </div>
        </div>

        <CommandKeysGraphic className="relative hidden h-[200px] w-[240px] shrink-0 md:block" />
      </div>
    </section>
  );
}
