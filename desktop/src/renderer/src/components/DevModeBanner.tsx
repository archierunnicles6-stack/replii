import { useAppStore } from "../store/useAppStore";
import { isMockAudioEnabled, shouldUseMockAudio } from "../services/mock-audio";

export function DevModeBanner() {
  const audioCaptureMode = useAppStore((s) => s.audioCaptureMode);
  const setAudioCaptureMode = useAppStore((s) => s.setAudioCaptureMode);

  if (!import.meta.env.DEV) return null;

  const mockActive = shouldUseMockAudio(audioCaptureMode);

  if (mockActive) {
    return (
      <div className="no-drag border-b border-violet-100 bg-violet-50 px-6 py-2.5">
        <p className="text-[12px] text-violet-900">
          <span className="font-semibold">Demo mode</span> — simulated call audio, no mic needed. Prospect
          lines auto-play every ~12s, or click 🎭 Mock in the overlay.
        </p>
        {isMockAudioEnabled() && (
          <button
            type="button"
            onClick={() => setAudioCaptureMode("mic")}
            className="mt-1.5 text-[11px] font-medium text-violet-700 underline"
          >
            Switch to live audio (dev only)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="no-drag border-b border-amber-100 bg-amber-50 px-6 py-2.5">
      <p className="text-[12px] text-amber-900">
        Live audio mode — microphone only. Allow Ghost under Privacy → Microphone.
      </p>
      <button
        type="button"
        onClick={() => setAudioCaptureMode("mock")}
        className="mt-1.5 text-[11px] font-medium text-amber-800 underline"
      >
        Back to demo mode
      </button>
    </div>
  );
}
