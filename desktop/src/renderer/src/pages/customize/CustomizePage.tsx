import { PageHeader, Textarea, Button } from "../../components/ui";
import { SALES_MODES } from "../../store/types";
import { useAppStore } from "../../store/useAppStore";
import { useState } from "react";

export function CustomizePage() {
  const {
    activeMode,
    setActiveMode,
    customSystemPrompt,
    setCustomSystemPrompt,
    knowledgeFiles,
    addKnowledgeFile,
    removeKnowledgeFile,
  } = useAppStore();
  const [draft, setDraft] = useState(customSystemPrompt);
  const [saved, setSaved] = useState(false);

  const savePrompt = () => {
    setCustomSystemPrompt(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = () => {
    const name = `sales-playbook-${knowledgeFiles.length + 1}.pdf`;
    addKnowledgeFile(name);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Customize Ghost"
        description="Tailor Ghost for your sales motion — pick a mode, edit the system prompt, and upload playbooks."
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
                  ? "border-ghost-400 bg-ghost-50 ring-2 ring-ghost-200"
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
          Upload sales scripts, battlecards, and pricing docs for Ghost to reference.
        </p>
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
          <Button variant="secondary" onClick={handleFileUpload}>
            Add files
          </Button>
          <p className="mt-2 text-[11px] text-zinc-400">
            PDF, DOCX, TXT supported
          </p>
        </div>
        {knowledgeFiles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {knowledgeFiles.map((f) => (
              <li
                key={f}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
              >
                <span className="text-[13px] text-zinc-700">{f}</span>
                <button
                  type="button"
                  onClick={() => removeKnowledgeFile(f)}
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
