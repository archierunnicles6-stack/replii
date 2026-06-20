import type { Metadata } from "next";
import { Suspense } from "react";
import { RepliiApp } from "@/components/app/RepliiApp";

export const metadata: Metadata = {
  title: "Replii App — Live Sales Co-pilot",
  description:
    "Real-time AI coaching during sales calls. Mock demo with live GPT suggestions, follow-ups, and call recap.",
};

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <RepliiApp />
    </Suspense>
  );
}
