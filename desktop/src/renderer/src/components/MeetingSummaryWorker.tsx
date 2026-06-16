import { useEffect, useRef } from "react";
import type { TranscriptLine } from "../services/ai";
import {
  EMPTY_SESSION_PLACEHOLDER,
  generateMeetingSummary,
  sectionsToPlainText,
} from "../services/ai";
import { buildAiCoachingContext } from "../lib/company-info";
import { notifyAppStoreChanged, useAppStore } from "../store/useAppStore";

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
          summary: `Session with ${transcript.length} transcript lines.`,
          status: "ready",
        });
      }
    }
    notifyAppStoreChanged();
  })();
}

/** Generate meeting summaries in the dashboard (survives overlay close). */
export function MeetingSummaryWorker() {
  const customSystemPrompt = useAppStore((s) => s.customSystemPrompt);
  const companyInfo = useAppStore((s) => s.companyInfo);
  const outputLanguage = useAppStore((s) => s.settings.outputLanguage);
  const updateMeeting = useAppStore((s) => s.updateMeeting);
  const meetings = useAppStore((s) => s.meetings);
  const coachingContext = buildAiCoachingContext(customSystemPrompt, companyInfo);

  const recoveredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return window.ghost?.onGenerateMeetingSummary?.((payload) => {
      finalizeMeeting(
        payload.meetingId,
        payload.transcript,
        coachingContext,
        outputLanguage,
        updateMeeting,
      );
    });
  }, [coachingContext, outputLanguage, updateMeeting]);

  useEffect(() => {
    for (const meeting of meetings) {
      if (meeting.status !== "processing") continue;
      if (recoveredRef.current.has(meeting.id)) continue;
      recoveredRef.current.add(meeting.id);

      finalizeMeeting(
        meeting.id,
        meeting.transcript,
        coachingContext,
        outputLanguage,
        updateMeeting,
      );
    }
  }, [coachingContext, meetings, outputLanguage, updateMeeting]);

  return null;
}
