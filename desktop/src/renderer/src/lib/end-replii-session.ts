import type { TranscriptLine } from "../services/ai";
import {
  notifyAppStoreChanged,
  useAppStore,
} from "../store/useAppStore";
import type { SalesMode, SuggestionRecord } from "../store/types";

export async function endRepliiSession({
  duration,
  transcript,
  activeMode,
  suggestionUses,
  suggestions,
}: {
  duration: number;
  transcript: TranscriptLine[];
  activeMode: SalesMode;
  suggestionUses: number;
  suggestions: SuggestionRecord[];
}): Promise<string | null> {
  let meetingId: string | null = null;

  try {
    const meeting = useAppStore.getState().saveMeetingFromSession({
      title: "Live session",
      company: "Meeting",
      mode: activeMode,
      duration,
      transcript,
      summary: "Generating summary…",
      status: "processing",
      nextSteps: [],
      dealScore: 0,
      objections: [],
      suggestionUses,
      suggestions,
    });
    meetingId = meeting.id;

    if (transcript.length === 0) {
      useAppStore.getState().refundFreeOverlaySeconds(duration);
    }

    notifyAppStoreChanged();

    void window.replii?.requestMeetingSummary?.({
      meetingId: meeting.id,
      transcript,
    });
  } catch (err) {
    console.error("[replii] Failed to save session:", err);
  } finally {
    await window.replii?.stopSession();
    useAppStore.getState().setSessionActive(false);
    if (meetingId) {
      void window.replii?.focusDashboard(`/meetings/${meetingId}`);
    }
  }

  return meetingId;
}
