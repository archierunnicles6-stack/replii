import { useEffect, useState } from "react";
import type { TranscriptLine } from "../services/ai";

export interface LiveTranscriptFeed {
  lines: TranscriptLine[];
  interim: string;
  error: string | null;
  hearingAudio: boolean;
  hasMic: boolean;
  hasSystemAudio: boolean;
  aiReady: boolean;
  audioSource: "desktop-capture" | "microphone" | null;
  isDemo: boolean;
}

const EMPTY: LiveTranscriptFeed = {
  lines: [],
  interim: "",
  error: null,
  hearingAudio: false,
  hasMic: false,
  hasSystemAudio: false,
  aiReady: false,
  audioSource: null,
  isDemo: false,
};

export function useLiveTranscriptFeed(active: boolean): LiveTranscriptFeed {
  const [feed, setFeed] = useState<LiveTranscriptFeed>(EMPTY);

  useEffect(() => {
    if (!active) {
      setFeed(EMPTY);
      return;
    }

    return window.ghost?.onLiveTranscript?.((state) => {
      setFeed(state);
    });
  }, [active]);

  return feed;
}
