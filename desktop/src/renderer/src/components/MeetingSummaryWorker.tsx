import { useEffect, useRef } from "react";
import type { TranscriptLine } from "../services/ai";
import {
  generateMeetingSummary,
  sectionsToPlainText,
} from "../services/ai";
import { notifyAppStoreChanged, useAppStore } from "../store/useAppStore";

function finalizeMeeting(
  meetingId: string,
  transcript: TranscriptLine[],
  customSystemPrompt: string,
  outputLanguage: string,
  updateMeeting: ReturnType<typeof useAppStore.getState>["updateMeeting"],
) {
  void (async () => {
    try {
      const result = await generateMeetingSummary(
        transcript,
        customSystemPrompt,
        outputLanguage,
      );
      updateMeeting(meetingId, {
        title: result.title,
        company: result.company,
        summarySections: result.sections,
        summary: sectionsToPlainText(result.sections),
        nextSteps: result.nextSteps,
        objections: result.objections ?? [],
        dealScore: result.dealScore ?? 0,
        status: "ready",
      });
    } catch {
      updateMeeting(meetingId, {
        summary:
          transcript.length > 0
            ? `Session with ${transcript.length} transcript lines.`
            : "No transcript captured.",
        status: transcript.length > 0 ? "ready" : "failed",
      });
    }
    notifyAppStoreChanged();
  })();
}

/** Generate meeting summaries in the dashboard (survives overlay close). */
export function MeetingSummaryWorker() {
  const customSystemPrompt = useAppStore((s) => s.customSystemPrompt);
  const outputLanguage = useAppStore((s) => s.settings.outputLanguage);
  const updateMeeting = useAppStore((s) => s.updateMeeting);
  const meetings = useAppStore((s) => s.meetings);

  const recoveredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return window.ghost?.onGenerateMeetingSummary?.((payload) => {
      finalizeMeeting(
        payload.meetingId,
        payload.transcript,
        customSystemPrompt,
        outputLanguage,
        updateMeeting,
      );
    });
  }, [customSystemPrompt, outputLanguage, updateMeeting]);

  useEffect(() => {
    for (const meeting of meetings) {
      if (meeting.status !== "processing") continue;
      if (recoveredRef.current.has(meeting.id)) continue;
      recoveredRef.current.add(meeting.id);

      if (meeting.transcript.length === 0) {
        updateMeeting(meeting.id, {
          summary: "No transcript captured.",
          status: "failed",
        });
        notifyAppStoreChanged();
        continue;
      }

      finalizeMeeting(
        meeting.id,
        meeting.transcript,
        customSystemPrompt,
        outputLanguage,
        updateMeeting,
      );
    }
  }, [customSystemPrompt, meetings, outputLanguage, updateMeeting]);

  return null;
}
