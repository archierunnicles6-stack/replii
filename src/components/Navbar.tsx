import Image from "next/image";
import Link from "next/link";
import { GhostLogo } from "./GhostLogo";

export function Navbar({ variant = "solid" }: { variant?: "landing" | "solid" }) {
  const isLanding = variant === "landing";

  return (
    <header
      className={
        isLanding
          ? "relative z-50 w-full"
          : "fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center px-6">
        <Link href="/" className="flex items-center">
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
      </div>
    </header>
  );
}
