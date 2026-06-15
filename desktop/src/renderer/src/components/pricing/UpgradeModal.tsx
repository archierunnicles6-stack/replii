import { PaywallPricing } from "./PaywallPricing";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { loadingTier, error, handleSelect } = usePricingCheckout({
    onComplete: onClose,
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="no-drag relative flex max-h-[calc(100vh-48px)] w-full max-w-[900px] flex-col overflow-y-auto rounded-2xl border border-zinc-200 bg-[#f7f8fa] shadow-2xl">
        <div className="sticky top-0 z-10 flex justify-end bg-[#f7f8fa]/95 px-4 pt-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 pb-10 pt-2">
          {error ? (
            <p className="mb-6 text-center text-[13px] text-red-600">{error}</p>
          ) : null}

          <PaywallPricing
            loadingTier={loadingTier}
            onSelect={(id) => void handleSelect(id)}
            onStartFree={onClose}
            freeLinkLabel="Maybe later"
          />
        </div>
      </div>
    </div>
  );
}
