import { useEffect, useState } from "react";
import {
  COMPANY_FIELD_LIMITS,
  type CompanyInfo,
} from "../../lib/company-info";
import { useAppStore } from "../../store/useAppStore";
import { Input, Textarea } from "../ui";

function FieldLabel({
  label,
  hint,
  count,
  max,
}: {
  label: string;
  hint?: string;
  count: number;
  max: number;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <div>
        <label className="text-[13px] font-medium text-zinc-900">{label}</label>
        {hint && (
          <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p>
        )}
      </div>
      <span className="shrink-0 text-[11px] text-zinc-400">
        {count}/{max}
      </span>
    </div>
  );
}

export function CompanyPanel() {
  const companyInfo = useAppStore((s) => s.companyInfo);
  const updateCompanyInfo = useAppStore((s) => s.updateCompanyInfo);
  const [draft, setDraft] = useState<CompanyInfo>(companyInfo);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(companyInfo);
  }, [companyInfo]);

  const isDirty =
    draft.companyName !== companyInfo.companyName ||
    draft.productDescription !== companyInfo.productDescription ||
    draft.commonObjections !== companyInfo.commonObjections ||
    draft.keyFacts !== companyInfo.keyFacts;

  const handleSave = () => {
    updateCompanyInfo(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: keyof CompanyInfo, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value.slice(0, COMPANY_FIELD_LIMITS[field]),
    }));
  };

  return (
    <div>
      <div className="mb-2 border-b border-zinc-100 pb-5">
        <h2 className="text-[15px] font-semibold text-zinc-900">Personalise</h2>
        <p className="mt-1 text-[12px] text-zinc-500">
          Tell Ghost about your company so it can answer prospect questions and
          tailor suggestions to you. Stored on your device only.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel
            label="Company name"
            count={draft.companyName.length}
            max={COMPANY_FIELD_LIMITS.companyName}
          />
          <Input
            value={draft.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="Acme Inc."
          />
        </div>

        <div>
          <FieldLabel
            label="What you sell"
            hint="Product, service, and who it's for"
            count={draft.productDescription.length}
            max={COMPANY_FIELD_LIMITS.productDescription}
          />
          <Textarea
            value={draft.productDescription}
            onChange={(e) => updateField("productDescription", e.target.value)}
            placeholder="AI sales co-pilot for B2B SaaS teams. Helps reps handle objections live during calls."
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <FieldLabel
            label="Common objections"
            hint="Comma-separated — Ghost will know how to handle these"
            count={draft.commonObjections.length}
            max={COMPANY_FIELD_LIMITS.commonObjections}
          />
          <Textarea
            value={draft.commonObjections}
            onChange={(e) => updateField("commonObjections", e.target.value)}
            placeholder="Too expensive, already using a competitor, need team approval, no budget this quarter"
            rows={2}
            className="resize-none"
          />
        </div>

        <div>
          <FieldLabel
            label="Extra context"
            hint="Pricing, competitors, target customer — keep it brief"
            count={draft.keyFacts.length}
            max={COMPANY_FIELD_LIMITS.keyFacts}
          />
          <Textarea
            value={draft.keyFacts}
            onChange={(e) => updateField("keyFacts", e.target.value)}
            placeholder="Starts at $49/mo. Main competitor is Gong. Best for teams of 5–50 reps."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
          {saved && (
            <span className="text-[12px] text-emerald-600">Saved</span>
          )}
          {isDirty && !saved && (
            <span className="text-[12px] text-zinc-400">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}
