export const TERMS_VERSION = "2026-06-18" as const;

export const LEGAL = {
  productName: "Ghost",
  /** Trading name — not a limited company. */
  legalEntity: "Ghost",
  businessStructure:
    "Ghost is operated by its founder as a sole trader. Ghost is not a limited company (Ltd), partnership, or corporation.",
  website: "https://ghost.ai",
  effectiveDate: "June 18, 2026",
  lastUpdated: "June 18, 2026",
  termsVersion: TERMS_VERSION,
  aiDisclaimerShort:
    "AI can make mistakes. Always review suggestions before you use or repeat them.",
  contact: {
    legal: "legal@ghost.ai",
    privacy: "privacy@ghost.ai",
    support: "support@ghost.ai",
    dpo: "privacy@ghost.ai",
  },
  jurisdiction: {
    region: "England and Wales",
    country: "United Kingdom",
    courts: "courts of England and Wales",
  },
  arbitration: {
    provider: "London Court of International Arbitration (LCIA)",
    rules: "LCIA Arbitration Rules",
    seat: "London, England",
  },
} as const;

export const LEGAL_ROUTES = {
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  acceptableUse: "/legal/acceptable-use",
  cookies: "/legal/cookies",
  subprocessors: "/legal/subprocessors",
} as const;

export const SUPPORT_ROUTES = {
  helpCenter: "/help-center",
  contact: "/contact",
} as const;
