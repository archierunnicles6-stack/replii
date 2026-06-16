import Link from "next/link";
import { GhostLogo } from "./GhostLogo";

const columns = [
  {
    title: "Resources",
    links: [
      { label: "Desktop", href: "/download", badge: "New" },
      { label: "Manifesto", href: "/#about" },
      { label: "Press", href: "mailto:press@ghost.ai" },
      { label: "Bug Bounty", href: "mailto:security@ghost.ai" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/#faq" },
      { label: "Contact Us", href: "mailto:support@ghost.ai" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Subprocessors", href: "/legal/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#f7f8fa]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-14 md:flex-row md:items-start md:justify-between md:py-16">
        <Link href="/" className="flex items-center gap-2.5">
          <GhostLogo className="h-6 w-6" />
          <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
            Ghost
          </span>
        </Link>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[14px] font-semibold text-[#0a0a0a]">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="inline-flex items-center gap-2 text-[14px] text-[#5f6b7a] transition-colors hover:text-[#0a0a0a]"
                      >
                        {link.label}
                        {"badge" in link && link.badge ? (
                          <span className="rounded-full bg-[#4b8bf5] px-2 py-0.5 text-[10px] font-medium text-white">
                            {link.badge}
                          </span>
                        ) : null}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-2 text-[14px] text-[#5f6b7a] transition-colors hover:text-[#0a0a0a]"
                      >
                        {link.label}
                        {"badge" in link && link.badge ? (
                          <span className="rounded-full bg-[#4b8bf5] px-2 py-0.5 text-[10px] font-medium text-white">
                            {link.badge}
                          </span>
                        ) : null}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
