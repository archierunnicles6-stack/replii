import { useCallback, useEffect, useState } from "react";
import { detectRepliiAudioSetup, type RepliiAudioSetup } from "../services/audio-capture";
import { useAppStore } from "../store/useAppStore";

export function MicPermissionBanner() {
  const audioCaptureMode = useAppStore((s) => s.audioCaptureMode);
  const setAudioCaptureMode = useAppStore((s) => s.setAudioCaptureMode);
  const [setup, setSetup] = useState<RepliiAudioSetup | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setSetup(await detectRepliiAudioSetup());
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(id);
  }, [refresh]);

  if (!setup || setup.microphoneGranted) return null;

  const enableMic = async () => {
    setBusy(true);
    setAudioCaptureMode("mic");
    await window.replii?.ensureMicrophone?.();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getTracks().forEach((t) => t.stop());
      await window.replii?.hideMicHelper?.();
    } catch {
      await window.replii?.showMicHelper?.();
    }
    setBusy(false);
    void refresh();
  };

  return (
    <div className="no-drag border-b border-amber-100 bg-amber-50 px-6 py-3">
      <p className="text-[13px] font-medium text-amber-950">Turn on your microphone</p>
      <p className="mt-0.5 text-[12px] text-amber-900">
        System Settings → Privacy &amp; Security → Microphone → enable <strong>Replii</strong>, then click
        below.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void enableMic()}
        className="mt-2 rounded-full bg-amber-900 px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Requesting…" : "Allow microphone"}
      </button>
    </div>
  );
}
