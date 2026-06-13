import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ghost — Live Demo",
  description:
    "Try Ghost's real-time sales coaching demo. Mock call audio streams in and GPT suggests what to say next.",
};

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
