export const LEGAL = {
  productName: "Ghost",
  legalEntity: "Ghost AI, Inc.",
  website: "https://ghost.ai",
  effectiveDate: "June 12, 2026",
  lastUpdated: "June 12, 2026",
  contact: {
    legal: "legal@ghost.ai",
    privacy: "privacy@ghost.ai",
    support: "support@ghost.ai",
    dpo: "privacy@ghost.ai",
  },
  jurisdiction: {
    state: "Delaware",
    country: "United States",
    courts: "state and federal courts located in Delaware",
  },
  arbitration: {
    provider: "American Arbitration Association (AAA)",
    rules: "Commercial Arbitration Rules",
    seat: "Wilmington, Delaware",
  },
} as const;

export const LEGAL_ROUTES = {
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  acceptableUse: "/legal/acceptable-use",
  cookies: "/legal/cookies",
} as const;
