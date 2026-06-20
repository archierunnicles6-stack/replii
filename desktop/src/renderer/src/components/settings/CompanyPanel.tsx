import {
  KNOWLEDGE_ACCEPT,
  KNOWLEDGE_FORMATS_LABEL,
  MAX_KNOWLEDGE_DOCS,
  MAX_KNOWLEDGE_DOC_CHARS,
} from "../../lib/knowledge-documents";
import { formatKnowledgeFileSize } from "../../lib/parse-knowledge-doc";
import { useKnowledgeFileUpload } from "../../hooks/useKnowledgeFileUpload";
import { useAppStore } from "../../store/useAppStore";

export function CompanyPanel() {
  const removeKnowledgeDocument = useAppStore((s) => s.removeKnowledgeDocument);
  const knowledgeContext = useAppStore((s) => s.knowledgeContext);
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
  } = useKnowledgeFileUpload();

  const slots = Array.from({ length: MAX_KNOWLEDGE_DOCS }, (_, index) =>
    knowledgeFiles[index] ?? null,
  );

  return (
    <div>
      <div className="mb-6 border-b border-zinc-100 pb-5">
        <h2 className="text-[15px] font-semibold text-zinc-900">Personalise</h2>
        <p className="mt-1 text-[12px] text-zinc-500">
          Upload playbooks or battlecards. Replii reads each file once, stores it
          locally, and uses it throughout your calls.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={KNOWLEDGE_ACCEPT}
        className="hidden"
        onChange={(e) => void handleFileSelected(e)}
      />

      <div className="space-y-2" {...dropzoneProps}>
        {slots.map((doc, index) =>
          doc ? (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-zinc-900">
                  {doc.name}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {doc.text.length.toLocaleString()} chars ·{" "}
                  {formatKnowledgeFileSize(doc.text.length)} · Indexed
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeKnowledgeDocument(doc.id)}
                className="shrink-0 text-[12px] font-medium text-zinc-500 transition-colors hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              key={`slot-${index}`}
              type="button"
              onClick={openFilePicker}
              disabled={!canUpload}
              className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isDragging && canUpload
                  ? "border-replii-400 bg-replii-50 text-replii-700 ring-2 ring-replii-200"
                  : "border-zinc-300 bg-zinc-50/80 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100"
              }`}
            >
              <span>
                {uploading
                  ? "Reading file…"
                  : isDragging && canUpload
                    ? "Drop file here"
                    : "Upload file"}
              </span>
              {!uploading && canUpload && (
                <span className="mt-1 text-[11px] font-normal text-zinc-400">
                  or drag and drop
                </span>
              )}
            </button>
          ),
        )}
      </div>

      <p className="mt-3 text-[11px] text-zinc-400">
        Up to {MAX_KNOWLEDGE_DOCS} files · {KNOWLEDGE_FORMATS_LABEL} ·{" "}
        {MAX_KNOWLEDGE_DOC_CHARS.toLocaleString()} characters each
      </p>

      {knowledgeContext.trim() && (
        <p className="mt-2 text-[11px] font-medium text-emerald-600">
          Knowledge indexed — Replii will reference your docs in live calls.
        </p>
      )}

      {uploadError && (
        <p className="mt-2 text-[11px] text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
