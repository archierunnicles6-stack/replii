import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Ghost — Live AI Sales Coach",
  description:
    "Real-time coaching during sales calls. Live suggestions, logged sessions, zero bots.",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Ghost",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
