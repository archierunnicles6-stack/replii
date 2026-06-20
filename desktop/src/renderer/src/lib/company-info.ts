import { OPENAI_LIMITS } from "./openai-config";
import {
  formatUploadedKnowledgeBlock,
  MAX_KNOWLEDGE_PROMPT_CHARS,
  type KnowledgeDocument,
} from "./knowledge-documents";
import { BUNDLED_SALES_KNOWLEDGE } from "./sales-knowledge-base";
import { DEFAULT_OBJECTIONS, DEFAULT_PRODUCT } from "./prompts";

/** Compact seller context — stored locally per account, not in Supabase. */
export interface CompanyInfo {
  companyName: string;
  productDescription: string;
  commonObjections: string;
  keyFacts: string;
}

export const COMPANY_FIELD_LIMITS = {
  companyName: 100,
  productDescription: 500,
  commonObjections: 300,
  keyFacts: 600,
} as const;

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  companyName: "",
  productDescription: "",
  commonObjections: "",
  keyFacts: "",
};

export function clampCompanyInfo(info: Partial<CompanyInfo>): CompanyInfo {
  return {
    companyName: (info.companyName ?? "").slice(0, COMPANY_FIELD_LIMITS.companyName),
    productDescription: (info.productDescription ?? "").slice(
      0,
      COMPANY_FIELD_LIMITS.productDescription,
    ),
    commonObjections: (info.commonObjections ?? "").slice(
      0,
      COMPANY_FIELD_LIMITS.commonObjections,
    ),
    keyFacts: (info.keyFacts ?? "").slice(0, COMPANY_FIELD_LIMITS.keyFacts),
  };
}

export function getEffectiveProduct(info: CompanyInfo): string {
  return info.productDescription.trim() || DEFAULT_PRODUCT;
}

export function getEffectiveObjections(info: CompanyInfo): string {
  return info.commonObjections.trim() || DEFAULT_OBJECTIONS;
}

/** Compact block injected into AI system prompts (~800 chars max). */
export function formatCompanyContext(info: CompanyInfo): string {
  const lines: string[] = [];

  if (info.companyName.trim()) {
    lines.push(`Company: ${info.companyName.trim()}`);
  }
  if (info.productDescription.trim()) {
    lines.push(`Product/service: ${info.productDescription.trim()}`);
  }
  if (info.commonObjections.trim()) {
    lines.push(`Common objections: ${info.commonObjections.trim()}`);
  }
  if (info.keyFacts.trim()) {
    lines.push(`Key facts: ${info.keyFacts.trim()}`);
  }

  return lines.join("\n");
}

export interface CoachingContextOptions {
  /** Cap uploaded-doc injection for fast live suggestions. */
  maxUploadedKnowledgeChars?: number;
  includeBundledSalesKnowledge?: boolean;
}

export function getProductFromKnowledge(
  documents: KnowledgeDocument[],
  fallback = DEFAULT_PRODUCT,
): string {
  if (!documents.length) return fallback;

  const doc = documents[0];
  const snippet = doc.text.trim().replace(/\s+/g, " ").slice(0, 140);
  return snippet || doc.name.trim() || fallback;
}

export function buildAiCoachingContext(
  customSystemPrompt: string,
  companyInfo: CompanyInfo,
  knowledgeDocuments: KnowledgeDocument[] = [],
  options: CoachingContextOptions = {},
): string {
  const hasUploads = knowledgeDocuments.length > 0;
  const includeBundled =
    options.includeBundledSalesKnowledge ?? !hasUploads;
  const companyBlock = formatCompanyContext(companyInfo);
  const uploadedBlock = formatUploadedKnowledgeBlock(
    knowledgeDocuments,
    options.maxUploadedKnowledgeChars,
  );
  const prompt = customSystemPrompt.trim();

  const blocks = [
    uploadedBlock,
    companyBlock,
    includeBundled
      ? `SALES COACHING KNOWLEDGE:\n${BUNDLED_SALES_KNOWLEDGE}`
      : "",
    hasUploads ? "" : prompt,
  ].filter(Boolean);

  return blocks.join("\n\n");
}

/** Compile once when docs/settings change — stored locally, reused on every call. */
export function compileKnowledgeContext(
  customSystemPrompt: string,
  companyInfo: CompanyInfo,
  knowledgeDocuments: KnowledgeDocument[] = [],
): string {
  return buildAiCoachingContext(
    customSystemPrompt,
    companyInfo,
    knowledgeDocuments,
    {
      maxUploadedKnowledgeChars: MAX_KNOWLEDGE_PROMPT_CHARS,
      includeBundledSalesKnowledge: knowledgeDocuments.length === 0,
    },
  );
}

/** Trim stored context for fast live auto-suggestions (full context used for assist/recap). */
export function getLiveKnowledgeContext(storedContext: string): string {
  const trimmed = storedContext.trim();
  if (!trimmed) return "";
  const limit = OPENAI_LIMITS.liveCoachingKnowledgeChars;
  return trimmed.length <= limit ? trimmed : trimmed.slice(0, limit);
}

export function hasCompanyInfo(info: CompanyInfo): boolean {
  return Boolean(
    info.companyName.trim() ||
      info.productDescription.trim() ||
      info.commonObjections.trim() ||
      info.keyFacts.trim(),
  );
}
