import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Ghost — Live Sales Co-pilot",
  description:
    "Real-time AI coaching during sales calls. Live mic, meeting tab audio, GPT suggestions, follow-ups, and recap.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Ghost",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full min-h-screen">{children}</div>;
}
