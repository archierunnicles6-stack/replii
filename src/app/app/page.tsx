import type { Metadata } from "next";
import { Suspense } from "react";
import { GhostApp } from "@/components/app/GhostApp";

export const metadata: Metadata = {
  title: "Ghost App — Live Sales Co-pilot",
  description:
    "Real-time AI coaching during sales calls. Mock demo with live GPT suggestions, follow-ups, and call recap.",
};

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <GhostApp />
    </Suspense>
  );
}
