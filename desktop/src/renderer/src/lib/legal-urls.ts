const baseUrl = (
  import.meta.env.VITE_LEGAL_BASE_URL ?? "https://ghost.ai"
).replace(/\/$/, "");

export const legalLinks = {
  terms: `${baseUrl}/legal/terms`,
  privacy: `${baseUrl}/legal/privacy`,
  acceptableUse: `${baseUrl}/legal/acceptable-use`,
  cookies: `${baseUrl}/legal/cookies`,
} as const;

export function openLegalLink(url: string) {
  void window.ghost?.openExternal?.(url);
}
