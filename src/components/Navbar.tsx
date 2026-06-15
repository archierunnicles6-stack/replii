import Link from "next/link";
import { GhostLogo } from "./GhostLogo";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-[#f5f6f8]/70 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <GhostLogo />
          <span className="text-[15px] font-semibold tracking-tight text-[#0a0a0a]">
            Ghost
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-[#52525b] transition-colors hover:text-[#0a0a0a]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden text-[13px] font-medium text-[#52525b] transition-colors hover:text-[#0a0a0a] sm:inline-flex"
          >
            Try demo
          </Link>
          <Link
            href="/download"
            className="hidden h-8 items-center gap-1.5 rounded-full bg-[#3b82f6] px-4 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all hover:bg-[#2563eb] sm:inline-flex"
          >
            Get for Mac
          </Link>
        </div>
      </div>
    </header>
  );
}
