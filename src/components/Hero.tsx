import { HeroAppPreview } from "./HeroAppPreview";
import { DownloadLink } from "./DownloadLink";

export function Hero() {
  return (
    <section id="download" className="relative overflow-hidden pb-16 pt-6 md:pb-24 md:pt-10">
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 text-center">
        <h1 className="max-w-[720px] text-balance text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1a1a1a] sm:text-[3.5rem] md:text-[4rem]">
          Everything You Need.
          <br />
          Before You Ask.
        </h1>

        <p className="mt-5 max-w-[560px] text-[16px] leading-[1.6] text-[#666666] md:text-[17px]">
          Replii coaches your reps in real time — surfacing the right words during live
          calls and logging every session for your review.
        </p>

        <div className="mt-8">
          <DownloadLink />
        </div>

        <div className="mt-14 w-full md:mt-16">
          <HeroAppPreview />
        </div>
      </div>
    </section>
  );
}
