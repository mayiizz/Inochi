import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AIChatPanel } from "@/components/bio/AIChatPanel";
import { PageHeader } from "@/components/bio/AppLayout";
import { GlassCard } from "@/components/bio/GlassCard";
import { QueryGate } from "@/components/bio/QueryGate";
import { useTutorChat } from "@/hooks/use-tutor-chat";
import { api } from "@/lib/api";
import type { TutorMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai-tutor")({
  component: TutorPage,
});

function TutorPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ["tutor-meta"],
    queryFn: api.tutorMeta,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Assistant"
        title="AI Tutor"
        subtitle="Ask questions and keep the current lesson in context."
      />
      <QueryGate isPending={isPending} error={error}>
        {data ? <TutorWorkspace meta={data} /> : null}
      </QueryGate>
    </div>
  );
}

function TutorWorkspace({ meta }: { meta: TutorMeta }) {
  const [active, setActive] = useState(meta.conversations[0]?.id ?? "c1");
  const chat = useTutorChat(meta.seed, { moduleId: "heart", lessonId: "orientation" });

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
      <GlassCard className="flex min-h-[640px] flex-col p-5">
        <AIChatPanel
          messages={chat.messages}
          onSend={chat.send}
          pending={chat.pending}
          prompts={meta.prompts}
        />
      </GlassCard>

      <GlassCard className="h-fit p-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Conversations
        </p>
        {meta.conversations.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={cn(
              "mb-1 w-full rounded-xl px-3 py-2.5 text-left transition-colors",
              active === item.id ? "bg-primary text-primary-foreground" : "hover:bg-white/70",
            )}
          >
            <span className="block text-sm font-semibold">{item.title}</span>
            <span
              className={cn(
                "text-[11px]",
                active === item.id ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {item.time}
            </span>
          </button>
        ))}
      </GlassCard>
    </div>
  );
}
