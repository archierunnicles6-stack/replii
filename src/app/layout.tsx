import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import { REPLII_MARKETING_ORIGIN } from "@/lib/replii-urls";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? REPLII_MARKETING_ORIGIN;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const title = "Replii — Live AI Sales Coach";
const description =
  "Real-time coaching during sales calls. Live suggestions, logged sessions, zero bots.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Replii",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Replii",
    type: "website",
    images: [{ url: "/app-icon.png", width: 1024, height: 1024, alt: "Replii" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/app-icon.png"],
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
