import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AIChatPanel } from "@/components/bio/AIChatPanel";
import { GlassCard } from "@/components/bio/GlassCard";
import { ModelHierarchy } from "@/components/bio/ModelHierarchy";
import { QueryGate } from "@/components/bio/QueryGate";
import { ModelViewer } from "@/components/bio/ModelViewer";
import { useTutorChat } from "@/hooks/use-tutor-chat";
import { api } from "@/lib/api";
import { displayPartLabel, type ModelPart } from "@/lib/model-hierarchy";
import type { Module } from "@/lib/types";

export const Route = createFileRoute("/_app/modules/$moduleId/lesson/$lessonId")({
  component: LessonPage,
});

function LessonPage() {
  const { moduleId, lessonId } = Route.useParams();
  const { data: module, isPending, error } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: () => api.module(moduleId),
  });
  const lesson = module?.lessons.find((item) => item.id === lessonId);

  return (
    <QueryGate isPending={isPending} error={error}>
      {module && lesson ? (
        <LessonBody module={module} lessonId={lessonId} />
      ) : module ? (
        <p className="text-sm text-muted-foreground">That lesson could not be found.</p>
      ) : null}
    </QueryGate>
  );
}

function LessonBody({ module, lessonId }: { module: Module; lessonId: string }) {
  const lesson = module.lessons.find((item) => item.id === lessonId);
  const [parts, setParts] = useState<ModelPart[]>([]);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  const handleHierarchy = useCallback((next: ModelPart[]) => {
    setParts(next);
  }, []);

  if (!lesson) return null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mb-3 flex shrink-0 items-baseline gap-3">
        <div className="text-xs font-medium text-muted-foreground">
          <Link to="/modules" className="hover:text-primary">
            Modules
          </Link>
          <span className="mx-2">/</span>
          <span>{module.title}</span>
        </div>
        <h1 className="font-display text-xl font-extrabold">{lesson.title}</h1>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-rows-[minmax(0,1fr)]">
        <GlassCard className="flex h-full min-h-0 flex-col overflow-hidden p-3">
          <ModelHierarchy parts={parts} selectedId={focusNode} onSelect={setFocusNode} />
        </GlassCard>

        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <ModelViewer
            src={module.glbUrl}
            isolateNodes={module.isolateNodes}
            selectedName={focusNode}
            onSelect={setFocusNode}
            onHierarchy={handleHierarchy}
            modelName={lesson.title}
            modelType={module.title}
            height="h-full"
          />
        </div>

        <GlassCard className="flex h-full min-h-0 flex-col overflow-hidden p-4">
          <h3 className="mb-3 shrink-0 font-display text-lg font-bold">AI assistant</h3>
          <div className="min-h-0 flex-1 overflow-hidden">
            <LessonTutor
              moduleId={module.id}
              lessonId={lessonId}
              moduleTitle={module.title}
              selectedPart={focusNode ? displayPartLabel(focusNode) : null}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function LessonTutor({
  moduleId,
  lessonId,
  moduleTitle,
  selectedPart,
}: {
  moduleId: string;
  lessonId: string;
  moduleTitle: string;
  selectedPart: string | null;
}) {
  const chat = useTutorChat(
    [
      {
        role: "assistant",
        text: `Select a structure on the ${moduleTitle} model, then ask me about it.`,
      },
    ],
    { moduleId, lessonId, selectedPart },
  );
  return (
    <AIChatPanel
      compact
      messages={chat.messages}
      onSend={chat.send}
      pending={chat.pending}
      selectedPart={selectedPart}
    />
  );
}
