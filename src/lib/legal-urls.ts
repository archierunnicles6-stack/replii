import { LEGAL, LEGAL_ROUTES } from "@/content/legal/config";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? LEGAL.website;

export function legalUrl(path: string) {
  return `${baseUrl}${path}`;
}

export const legalLinks = {
  terms: legalUrl(LEGAL_ROUTES.terms),
  privacy: legalUrl(LEGAL_ROUTES.privacy),
  acceptableUse: legalUrl(LEGAL_ROUTES.acceptableUse),
  cookies: legalUrl(LEGAL_ROUTES.cookies),
} as const;
