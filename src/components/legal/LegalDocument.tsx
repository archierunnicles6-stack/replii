import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL } from "@/content/legal/config";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export function LegalDocument({
  title,
  description,
  sections,
  relatedLinks,
}: {
  title: string;
  description: string;
  sections: LegalSection[];
  relatedLinks?: { href: string; label: string }[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="border-b border-zinc-200 pb-10">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-ghost-500">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
          {description}
        </p>
        <p className="mt-3 text-[13px] text-zinc-400">
          Effective date: {LEGAL.effectiveDate} · Last updated: {LEGAL.lastUpdated}
        </p>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
          These documents are provided for operational use. Have qualified legal
          counsel review and customize them for your entity, jurisdiction, and
          business model before relying on them.
        </p>
      </header>

      <nav
        aria-label="Table of contents"
        className="my-10 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6"
      >
        <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          Contents
        </p>
        <ol className="mt-4 columns-1 gap-x-8 space-y-2 text-[13px] sm:columns-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {index + 1}. {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="legal-prose space-y-12">
        {sections.map((section, index) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              {index + 1}. {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-[14px] leading-[1.75] text-zinc-600">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      {relatedLinks && relatedLinks.length > 0 && (
        <footer className="mt-16 border-t border-zinc-200 pt-10">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
            Related policies
          </p>
          <ul className="mt-4 flex flex-wrap gap-4">
            {relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] font-medium text-ghost-600 hover:text-ghost-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function LegalUl({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export function LegalOl({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-5">{children}</ol>;
}

export function LegalLi({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function LegalStrong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-zinc-800">{children}</strong>;
}
