import Image from "next/image";
import Link from "next/link";
import { GhostLogo } from "./GhostLogo";
import { MacDownloadLink } from "./MacDownloadLink";

const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "FAQ", href: "/#faq" },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/download" },
];

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

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-[#5f6b7a] transition-colors hover:text-[#0a0a0a]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden text-[14px] font-medium text-[#5f6b7a] transition-colors hover:text-[#0a0a0a] sm:inline"
          >
            Log in
          </Link>
          <MacDownloadLink className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0a0a0a] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#1a1a1a] sm:px-5 sm:text-[14px]" />
        </div>
      </div>
    </header>
  );
}
