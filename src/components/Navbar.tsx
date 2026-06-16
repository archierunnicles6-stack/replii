import Image from "next/image";
import Link from "next/link";
import { GhostLogo } from "./GhostLogo";
import { MacDownloadLink } from "./MacDownloadLink";

export function Navbar({ variant = "solid" }: { variant?: "landing" | "solid" }) {
  const isLanding = variant === "landing";

  return (
    <header
      className={
        isLanding
          ? "relative z-50 w-full"
          : "fixed top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center">
          {isLanding ? (
            <Image
              src="/ghost-landing-logo.png"
              alt="Ghost"
              width={2047}
              height={1163}
              priority
              draggable={false}
              className="h-8 w-auto"
            />
          ) : (
            <>
              <GhostLogo className="h-7 w-7" />
              <span className="ml-2.5 text-[17px] font-semibold tracking-[-0.02em] text-black">
                Ghost
              </span>
            </>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden text-[14px] font-medium text-[#5f6b7a] transition-colors hover:text-[#0a0a0a] sm:inline"
          >
            Log in
          </Link>
          <MacDownloadLink size="sm" />
        </div>
      </div>
    </header>
  );
}
