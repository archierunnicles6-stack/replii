import Link from "next/link";

export function CTA() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Sales AI that helps during the call, not after.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-zinc-400">
          Try Ghost on your next sales call today.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/download"
            className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[14px] font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Download for Mac
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center rounded-full border border-zinc-700 px-6 text-[14px] font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
