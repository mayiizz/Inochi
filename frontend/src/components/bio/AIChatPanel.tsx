import { Send, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function AIChatPanel({
  messages,
  onSend,
  compact = false,
  prompts = [],
  pending = false,
  selectedPart = null,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  compact?: boolean;
  prompts?: string[];
  pending?: boolean;
  selectedPart?: string | null;
}) {
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = draft.trim();
    if (!next || pending) return;
    onSend(next);
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {selectedPart ? (
        <p className="mb-3 shrink-0 rounded-xl bg-secondary/70 px-3 py-2 text-[11px] font-medium text-foreground">
          Learning: <span className="font-semibold">{selectedPart}</span>
        </p>
      ) : (
        <p className="mb-3 shrink-0 text-[11px] text-muted-foreground">
          Click a part on the model, then ask about it.
        </p>
      )}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "glass-strong text-foreground",
              )}
            >
              {message.role === "assistant" ? (
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Sparkles className="size-3 text-accent" strokeWidth={1.8} />
                  Inochi Tutor
                </p>
              ) : null}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {pending ? (
          <p className="text-xs text-muted-foreground">The tutor is thinking…</p>
        ) : null}
      </div>

      {!compact && prompts.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={pending}
              onClick={() => onSend(prompt)}
              className="rounded-full border border-border bg-white/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-4 flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            selectedPart ? `Ask about ${selectedPart}...` : "Select a part, then ask about it..."
          }
          disabled={pending}
          className="h-11 flex-1 rounded-2xl border border-[var(--glass-border)] bg-white/80 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          title="Send"
        >
          <Send className="size-4" strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
}
