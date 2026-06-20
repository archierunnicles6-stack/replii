import { useEffect, useRef } from "react";
import type { TranscriptLine } from "../services/ai";
import {
  EMPTY_SESSION_PLACEHOLDER,
  generateMeetingSummary,
  sectionsToPlainText,
} from "../services/ai";
import { useAppStore, notifyAppStoreChanged } from "../store/useAppStore";

function finalizeMeeting(
  meetingId: string,
  transcript: TranscriptLine[],
  coachingContext: string,
  outputLanguage: string,
  updateMeeting: ReturnType<typeof useAppStore.getState>["updateMeeting"],
) {
  void (async () => {
    try {
      const result = await generateMeetingSummary(
        transcript,
        coachingContext,
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
      if (transcript.length === 0) {
        const placeholder = EMPTY_SESSION_PLACEHOLDER;
        updateMeeting(meetingId, {
          title: placeholder.title,
          company: placeholder.company,
          summarySections: placeholder.sections,
          summary: sectionsToPlainText(placeholder.sections),
          nextSteps: placeholder.nextSteps,
          objections: placeholder.objections ?? [],
          dealScore: placeholder.dealScore ?? 0,
          status: "ready",
        });
      } else {
        updateMeeting(meetingId, {
          summary: "Replii couldn't generate a summary. Check your OpenAI API key and try again.",
          summarySections: [
            {
              heading: "Summary unavailable",
              items: ["Replii couldn't generate a summary. Check your OpenAI API key and try again."],
            },
          ],
          status: "ready",
        });
      }
    }
    notifyAppStoreChanged();
  })();
}

/** Generate meeting summaries in the dashboard (survives overlay close). */
export function MeetingSummaryWorker() {
  const knowledgeContext = useAppStore((s) => s.knowledgeContext);
  const outputLanguage = useAppStore((s) => s.settings.outputLanguage);
  const updateMeeting = useAppStore((s) => s.updateMeeting);
  const meetings = useAppStore((s) => s.meetings);

  const recoveredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return window.replii?.onGenerateMeetingSummary?.((payload) => {
      finalizeMeeting(
        payload.meetingId,
        payload.transcript,
        knowledgeContext,
        outputLanguage,
        updateMeeting,
      );
    });
  }, [knowledgeContext, outputLanguage, updateMeeting]);

  useEffect(() => {
    for (const meeting of meetings) {
      if (meeting.status !== "processing") continue;
      if (recoveredRef.current.has(meeting.id)) continue;
      recoveredRef.current.add(meeting.id);

      finalizeMeeting(
        meeting.id,
        meeting.transcript,
        knowledgeContext,
        outputLanguage,
        updateMeeting,
      );
    }
  }, [knowledgeContext, meetings, outputLanguage, updateMeeting]);

  return null;
}
