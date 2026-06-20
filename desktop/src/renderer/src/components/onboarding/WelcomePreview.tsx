import klavioPreview from "../../assets/onboarding/klavio.png";

export function WelcomePreview() {
  return (
    <div className="flex h-full w-full min-h-0 flex-col">
      <p className="shrink-0 w-full px-8 pt-10 text-center text-[15px] font-semibold tracking-[-0.01em] text-zinc-500">
        Real-time sales coach,
        <br />
        always ready to help
      </p>

      <div className="relative mt-6 flex min-h-0 flex-1 items-end justify-end overflow-hidden">
        <img
          src={klavioPreview}
          alt="Ghost providing live coaching during a sales call"
          className="h-full w-auto max-w-none select-none object-contain object-right-bottom"
          draggable={false}
        />
      </div>
    </div>
  );
}
