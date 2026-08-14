import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Bot, ExternalLink, Send, Sparkles, X } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Group, Object3D } from "three";
import { Box3, Vector3 } from "three";
import { namesMatch, sourceName } from "@/lib/model-hierarchy";
import { explainPart } from "@/lib/part-explainers";
import type { ChatMessage, TutorImage, TutorSource } from "@/lib/types";
import { cn } from "@/lib/utils";

function findObject(root: Object3D, name: string) {
  let match: Object3D | undefined;
  root.traverse((node) => {
    if (match) return;
    if (namesMatch(sourceName(node), name) || namesMatch(node.name, name)) match = node;
  });
  return match;
}

export function TutorAnchor({
  root,
  selectedName,
  children,
}: {
  root: Object3D;
  selectedName: string;
  children: ReactNode;
}) {
  const groupRef = useRef<Group>(null);
  const offset = useMemo(() => new Vector3(0.28, 0.2, 0.14), []);

  useFrame(() => {
    const target = findObject(root, selectedName);
    const group = groupRef.current;
    if (!target || !group) return;
    const box = new Box3().setFromObject(target);
    if (box.isEmpty()) return;
    box.getCenter(group.position);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.014, 18, 18]} />
        <meshBasicMaterial color="#1a5f8a" />
      </mesh>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, offset.x, offset.y, offset.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#1a5f8a" transparent opacity={0.75} />
      </line>
      <Html
        position={[offset.x, offset.y, offset.z]}
        occlude={false}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="-translate-y-1/2"
        >
          {children}
        </div>
      </Html>
    </group>
  );
}

export function TutorGuideCard({
  partName,
  messages,
  pending,
  onSend,
  onClose,
}: {
  partName: string;
  messages: ChatMessage[];
  pending: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const explainer = explainPart(partName);
  const [draft, setDraft] = useState("");
  const latest = [...messages].reverse().find((message) => message.role === "assistant");

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = draft.trim();
    if (!next || pending) return;
    onSend(next);
    setDraft("");
  }

  return (
    <div className="w-[min(20.5rem,72vw)] rounded-2xl border border-[var(--glass-border)] bg-white/90 p-3 shadow-lift backdrop-blur-xl dark:bg-black/55">
      <div className="flex items-start gap-2">
        <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-4" strokeWidth={1.8} />
          {pending ? (
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {explainer.role}
          </p>
          <p className="font-display text-sm font-bold leading-tight">{explainer.title}</p>
        </div>
        <button
          type="button"
          title="Close"
          onClick={onClose}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{explainer.summary}</p>

      {latest && latest.text !== explainer.summary ? (
        <div className="mt-2 max-h-28 overflow-y-auto rounded-xl bg-secondary/60 px-2.5 py-2">
          <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="size-3 text-accent" strokeWidth={1.8} />
            Tutor
          </p>
          <p className="text-xs leading-relaxed text-foreground">{latest.text}</p>
        </div>
      ) : null}

      <EvidenceStrip images={latest?.images ?? []} sources={latest?.sources ?? []} />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {["How does this work?", "Show this clearly"].map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={pending}
            onClick={() => onSend(prompt)}
            className="rounded-full border border-border bg-white/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:border-primary/30 hover:text-primary disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-2 flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Ask about ${explainer.title}...`}
          disabled={pending}
          className="h-9 flex-1 rounded-xl border border-[var(--glass-border)] bg-white/80 px-3 text-xs outline-none placeholder:text-muted-foreground focus:border-ring/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
          title="Ask"
        >
          <Send className="size-3.5" strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
}

export function EvidenceStrip({
  images,
  sources,
}: {
  images: TutorImage[];
  sources: TutorSource[];
}) {
  if (images.length === 0 && sources.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {images[0] ? (
        <a
          href={images[0].sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl border border-border"
        >
          <img
            src={images[0].thumbUrl || images[0].url}
            alt={images[0].alt || images[0].caption}
            className="h-24 w-full object-cover"
          />
          <p className="px-2 py-1 text-[10px] text-muted-foreground">
            {images[0].caption} · {images[0].source}
          </p>
        </a>
      ) : null}
      {sources.slice(0, 2).map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-1.5 rounded-lg bg-white/70 px-2 py-1.5 text-[10px] leading-snug text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="mt-0.5 size-3 shrink-0" strokeWidth={1.8} />
          <span>
            <span className="font-medium text-foreground">
              {source.lead || source.authors.split(",")[0] || "Authors"} et al., {source.year}
            </span>
            {" · "}
            {source.title} ({source.source}
            {source.venue ? `, ${source.venue}` : ""})
          </span>
        </a>
      ))}
    </div>
  );
}

export function MessageEvidence({ message }: { message: ChatMessage }) {
  if (message.role !== "assistant") return null;
  if (!message.images?.length && !message.sources?.length) return null;
  return (
    <div className={cn("mt-2 space-y-2")}>
      {message.images?.slice(0, 2).map((image) => (
        <a
          key={image.url}
          href={image.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl border border-white/20"
        >
          <img src={image.thumbUrl || image.url} alt={image.alt || image.caption} className="h-28 w-full object-cover" />
          <p className="px-2 py-1 text-[10px] opacity-80">
            {image.caption} · {image.source}
          </p>
        </a>
      ))}
      {message.sources?.slice(0, 3).map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-1.5 text-[11px] leading-snug underline-offset-2 hover:underline"
        >
          <ExternalLink className="mt-0.5 size-3 shrink-0" strokeWidth={1.8} />
          <span>
            {(source.lead || source.authors.split(",")[0] || "Authors") + ` et al., ${source.year}. `}
            {source.title} — {source.source}
            {source.venue ? ` (${source.venue})` : ""}
          </span>
        </a>
      ))}
    </div>
  );
}
