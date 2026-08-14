import { Link, createFileRoute } from "@tanstack/react-router";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AIChatPanel } from "@/components/bio/AIChatPanel";
import { TutorGuideCard } from "@/components/bio/FloatingTutor";
import { GlassCard } from "@/components/bio/GlassCard";
import { ModelHierarchy } from "@/components/bio/ModelHierarchy";
import { QueryGate } from "@/components/bio/QueryGate";
import { ModelViewer } from "@/components/bio/ModelViewer";
import { useTutorChat } from "@/hooks/use-tutor-chat";
import { api } from "@/lib/api";
import {
  collectPartIds,
  displayPartLabel,
  findPart,
  flattenParts,
  resolvePartId,
  type ModelPart,
} from "@/lib/model-hierarchy";
import type { CameraCommand, Module, TutorAction } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand | null>(null);
  const commandId = useRef(1);
  const handleHierarchy = useCallback((next: ModelPart[]) => {
    setParts(next);
  }, []);

  const partNames = useMemo(() => flattenParts(parts).map((part) => part.label), [parts]);
  const chat = useTutorChat(
    [
      {
        role: "assistant",
        text: `Select a structure on the ${module.title} model, then ask me about it. I can move the model, hide covering parts, and pull papers and diagrams.`,
      },
    ],
    {
      moduleId: module.id,
      lessonId,
      selectedPart: focusNode ? displayPartLabel(focusNode) : null,
      partNames,
    },
  );

  const toggleHidden = useCallback(
    (id: string) => {
      const hiding = !hiddenIds.includes(id);
      setHiddenIds((current) =>
        hiding ? [...current, id] : current.filter((item) => item !== id),
      );
      if (!hiding) return;
      const part = findPart(parts, id);
      const covered = part ? collectPartIds(part) : [id];
      setFocusNode((selected) => (selected && covered.includes(selected) ? null : selected));
    },
    [hiddenIds, parts],
  );

  const applyActions = useCallback(
    (actions: TutorAction[]) => {
      for (const action of actions) {
        if (action.type === "show_all" || action.type === "reset") {
          setHiddenIds([]);
        }
        if (action.type === "reset") {
          setFocusNode(null);
          setCameraCommand({ id: commandId.current++, kind: "reset" });
          continue;
        }
        if ((action.type === "select" || action.type === "focus" || action.type === "hide" || action.type === "show") && action.part) {
          const id = resolvePartId(parts, action.part);
          if (!id) continue;
          if (action.type === "hide") {
            setHiddenIds((current) => (current.includes(id) ? current : [...current, id]));
            continue;
          }
          if (action.type === "show") {
            setHiddenIds((current) => current.filter((item) => item !== id));
            continue;
          }
          setFocusNode(id);
          if (action.type === "focus") {
            setCameraCommand({ id: commandId.current++, kind: "focus", part: id });
          }
        }
        if (action.type === "rotate") {
          setCameraCommand({
            id: commandId.current++,
            kind: "rotate",
            yaw: action.yaw ?? 0.55,
            pitch: action.pitch ?? 0.08,
          });
        }
      }
    },
    [parts],
  );

  const ask = useCallback(
    async (text: string) => {
      const actions = await chat.send(text);
      applyActions(actions);
    },
    [applyActions, chat],
  );

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

      <div
        className={cn(
          "grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-rows-[minmax(0,1fr)]",
          chatOpen
            ? "xl:grid-cols-[240px_minmax(0,1fr)_300px]"
            : "xl:grid-cols-[240px_minmax(0,1fr)_auto]",
        )}
      >
        <GlassCard className="flex h-full min-h-0 flex-col overflow-hidden p-3">
          <ModelHierarchy
            parts={parts}
            selectedId={focusNode}
            hiddenIds={hiddenIds}
            onSelect={setFocusNode}
            onToggleHidden={toggleHidden}
            onShowAll={() => setHiddenIds([])}
          />
        </GlassCard>

        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <ModelViewer
            src={module.glbUrl}
            isolateNodes={module.isolateNodes}
            selectedName={focusNode}
            hiddenNames={hiddenIds}
            cameraCommand={cameraCommand}
            onSelect={setFocusNode}
            onHierarchy={handleHierarchy}
            modelName={lesson.title}
            modelType={module.title}
            height="h-full"
            floatingGuide={
              focusNode ? (
                <TutorGuideCard
                  partName={focusNode}
                  messages={chat.messages}
                  pending={chat.pending}
                  onSend={(text) => void ask(text)}
                  onClose={() => setFocusNode(null)}
                />
              ) : null
            }
          />
        </div>

        {chatOpen ? (
          <GlassCard className="flex h-full min-h-0 flex-col overflow-hidden p-4">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold">AI assistant</h3>
              <button
                type="button"
                title="Collapse assistant"
                onClick={() => setChatOpen(false)}
                className="flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <PanelRightClose className="size-4" strokeWidth={1.8} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <AIChatPanel
                compact
                messages={chat.messages}
                onSend={(text) => void ask(text)}
                pending={chat.pending}
                selectedPart={focusNode ? displayPartLabel(focusNode) : null}
              />
            </div>
          </GlassCard>
        ) : (
          <button
            type="button"
            title="Open AI assistant"
            onClick={() => setChatOpen(true)}
            className="glass flex min-h-[48px] items-center justify-center gap-2 rounded-3xl px-4 py-3 text-muted-foreground transition-colors hover:text-foreground xl:h-full xl:w-12 xl:flex-col xl:gap-3 xl:px-2"
          >
            <PanelRightOpen className="size-4 shrink-0" strokeWidth={1.8} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] xl:[writing-mode:vertical-rl]">
              AI assistant
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
