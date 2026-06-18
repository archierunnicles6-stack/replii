import Image from "next/image";
import Link from "next/link";
import { GhostLogo } from "./GhostLogo";
import { DownloadLink } from "./DownloadLink";
import { PRICING_PAGE_BG_CLASS } from "@/lib/brand";

const LANDING_LOGO = { width: 1746, height: 458 } as const;

export function Navbar({
  variant = "solid",
}: {
  variant?: "landing" | "solid" | "pricing";
}) {
  const isLanding = variant === "landing";
  const isPricing = variant === "pricing";

  return (
    <header
      className={
        isLanding
          ? "relative z-50 w-full"
          : isPricing
            ? `fixed top-0 z-50 w-full ${PRICING_PAGE_BG_CLASS}`
            : "fixed top-0 z-50 w-full bg-white"
      }
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center">
          {isLanding ? (
            <Image
              src="/ghost-landing-logo.png"
              alt="Ghost"
              width={LANDING_LOGO.width}
              height={LANDING_LOGO.height}
              priority
              draggable={false}
              className="h-8 w-auto"
            />
          ) : (
            <GhostLogo variant="wordmark" className="h-7 w-auto" />
          )}
        </Link>

        <DownloadLink size="sm" />
      </div>
    </header>
  );
}
