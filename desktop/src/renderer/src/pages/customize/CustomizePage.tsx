import { PageHeader, Textarea, Button } from "../../components/ui";
import { SALES_MODES } from "../../store/types";
import { useAppStore } from "../../store/useAppStore";
import { useState } from "react";
import { formatKnowledgeFileSize } from "../../lib/parse-knowledge-doc";
import {
  KNOWLEDGE_ACCEPT,
  KNOWLEDGE_FORMATS_LABEL,
  MAX_KNOWLEDGE_DOCS,
  MAX_KNOWLEDGE_DOC_CHARS,
} from "../../lib/knowledge-documents";
import { useKnowledgeFileUpload } from "../../hooks/useKnowledgeFileUpload";

export function CustomizePage() {
  const {
    activeMode,
    setActiveMode,
    customSystemPrompt,
    setCustomSystemPrompt,
    removeKnowledgeDocument,
  } = useAppStore();
  const [draft, setDraft] = useState(customSystemPrompt);
  const [saved, setSaved] = useState(false);
  const {
    knowledgeFiles,
    uploadError,
    uploading,
    isDragging,
    canUpload,
    fileInputRef,
    openFilePicker,
    handleFileSelected,
    dropzoneProps,
  } = useKnowledgeFileUpload({
    maxDocsMessage: `Max ${MAX_KNOWLEDGE_DOCS} documents — remove one in Settings → Personalise.`,
  });

  const savePrompt = () => {
    setCustomSystemPrompt(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Customize Replii"
        description="Tailor Replii for your sales motion — pick a mode, edit the system prompt, and upload playbooks."
      />

      <section className="mb-8">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          Sales mode
        </h2>
        <p className="mt-1 text-[13px] text-zinc-500">
          Active mode appears in the overlay dropdown during live sessions.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SALES_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setActiveMode(mode.id);
                setDraft(mode.systemPrompt);
              }}
              className={`rounded-2xl border p-4 text-left transition-all ${
                activeMode === mode.id
                  ? "border-replii-400 bg-replii-50 ring-2 ring-replii-200"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <p className="text-[14px] font-semibold text-zinc-900">
                {mode.name}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
                {mode.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          System prompt
        </h2>
        <Textarea
          className="mt-3 min-h-[160px] font-mono text-[13px]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={savePrompt}>Save prompt</Button>
          {saved && (
            <span className="text-[12px] font-medium text-emerald-600">
              Saved
            </span>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
          Knowledge base
        </h2>
        <p className="mt-1 text-[13px] text-zinc-500">
          Upload sales scripts, battlecards, and pricing docs (max{" "}
          {MAX_KNOWLEDGE_DOCS}). Also available in Settings → Personalise.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={KNOWLEDGE_ACCEPT}
          className="hidden"
          onChange={(e) => void handleFileSelected(e)}
        />
        <div
          {...dropzoneProps}
          className={`mt-4 rounded-2xl border border-dashed p-8 text-center transition-colors ${
            isDragging && canUpload
              ? "border-replii-400 bg-replii-50 ring-2 ring-replii-200"
              : "border-zinc-300 bg-zinc-50"
          }`}
        >
          <Button
            variant="secondary"
            onClick={openFilePicker}
            disabled={!canUpload}
          >
            {uploading
              ? "Reading file…"
              : isDragging && canUpload
                ? "Drop file here"
                : "Upload document"}
          </Button>
          <p className="mt-2 text-[11px] text-zinc-400">
            {KNOWLEDGE_FORMATS_LABEL} · drag and drop · up to{" "}
            {MAX_KNOWLEDGE_DOC_CHARS.toLocaleString()} characters each
          </p>
          {uploadError && (
            <p className="mt-2 text-[11px] text-red-600">{uploadError}</p>
          )}
        </div>
        {knowledgeFiles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {knowledgeFiles.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="block truncate text-[13px] text-zinc-700">
                    {doc.name}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {doc.text.length.toLocaleString()} chars ·{" "}
                    {formatKnowledgeFileSize(doc.text.length)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeKnowledgeDocument(doc.id)}
                  className="text-[12px] text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
