import Link from "next/link";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ghost-500 text-xs font-bold text-white">
            ◉
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Ghost</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:inline-flex"
          >
            Try demo
          </Link>
          <Link
            href="/download"
            className="hidden rounded-full bg-zinc-900 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800 sm:inline-flex"
          >
            Download
          </Link>
        </div>
      </div>
    </header>
  );
}
