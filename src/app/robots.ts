import type { MetadataRoute } from "next";
import { REPLII_MARKETING_ORIGIN } from "@/lib/replii-urls";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? REPLII_MARKETING_ORIGIN;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/overlay", "/auth/callback"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
