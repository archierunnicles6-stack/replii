import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL, LEGAL_ROUTES } from "@/content/legal/config";
import { privacySections } from "@/content/legal/privacy-sections";

export const metadata: Metadata = {
  title: "Privacy Policy — Ghost",
  description: `How ${LEGAL.productName} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      description={`This Privacy Policy describes how ${LEGAL.legalEntity} handles personal information when you use ${LEGAL.productName}.`}
      sections={privacySections}
      relatedLinks={[
        { href: LEGAL_ROUTES.terms, label: "Terms of Service" },
        { href: LEGAL_ROUTES.acceptableUse, label: "Acceptable Use Policy" },
        { href: LEGAL_ROUTES.cookies, label: "Cookie Policy" },
      ]}
    />
  );
}
