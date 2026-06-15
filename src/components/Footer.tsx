import Link from "next/link";
import { GhostLogo } from "./GhostLogo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <GhostLogo />
              <span className="text-[15px] font-semibold">Ghost</span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              Live AI coaching for sales calls. Real-time suggestions, invisible
              overlay, no bots in your meetings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
                Product
              </p>
              <ul className="mt-4 space-y-2.5">
                {["How it works", "Features", "Pricing", "Download"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href={
                          item === "Pricing"
                            ? "/pricing"
                            : item === "Download"
                              ? "#download"
                              : `#${item.toLowerCase().replace(/ /g, "-")}`
                        }
                        className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
                Company
              </p>
              <ul className="mt-4 space-y-2.5">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <span className="cursor-default text-[13px] text-zinc-400">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
                Legal
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="/legal/privacy"
                    className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/terms"
                    className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/acceptable-use"
                    className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    Acceptable Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-[12px] text-zinc-400">
            © {new Date().getFullYear()} Ghost. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
