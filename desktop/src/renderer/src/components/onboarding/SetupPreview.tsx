import { assetUrl } from "../../lib/asset-url";

export function SetupPreview() {
  return (
    <div className="relative h-full w-full min-h-0">
      <img
        src={assetUrl("onboarding/klavio-5.png")}
        alt=""
        aria-hidden
        className="absolute bottom-0 right-0 h-[min(42vh,320px)] w-auto max-w-[min(52%,360px)] select-none object-contain object-right-bottom"
        draggable={false}
      />
    </div>
  );
}
