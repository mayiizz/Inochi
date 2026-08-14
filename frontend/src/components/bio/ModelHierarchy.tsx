import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ModelPart } from "@/lib/model-hierarchy";
import { cn } from "@/lib/utils";

export function ModelHierarchy({
  parts,
  selectedId,
  hiddenIds,
  onSelect,
  onToggleHidden,
  onShowAll,
}: {
  parts: ModelPart[];
  selectedId: string | null;
  hiddenIds: string[];
  onSelect: (id: string | null) => void;
  onToggleHidden: (id: string) => void;
  onShowAll: () => void;
}) {
  const hidden = new Set(hiddenIds);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2 px-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Parts
        </p>
        {hiddenIds.length > 0 ? (
          <button
            type="button"
            onClick={onShowAll}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Show all
          </button>
        ) : null}
      </div>
      <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto pr-0.5">
        {parts.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">Reading model labels…</p>
        ) : (
          <ul className="flex flex-col">
            {parts.map((part) => (
              <PartRow
                key={part.id}
                part={part}
                depth={0}
                selectedId={selectedId}
                hidden={hidden}
                ancestorHidden={false}
                onSelect={onSelect}
                onToggleHidden={onToggleHidden}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PartRow({
  part,
  depth,
  selectedId,
  hidden,
  ancestorHidden,
  onSelect,
  onToggleHidden,
}: {
  part: ModelPart;
  depth: number;
  selectedId: string | null;
  hidden: Set<string>;
  ancestorHidden: boolean;
  onSelect: (id: string | null) => void;
  onToggleHidden: (id: string) => void;
}) {
  const hasChildren = part.children.length > 0;
  const [open, setOpen] = useState(depth < 1);
  const active = selectedId === part.id;
  const selfHidden = hidden.has(part.id);
  const isHidden = ancestorHidden || selfHidden;

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-0.5 rounded-xl pr-1 text-left text-[13px] transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-white/70 dark:hover:bg-white/10",
          isHidden && !active && "opacity-45",
        )}
        style={{ paddingLeft: 6 + depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            title={open ? "Collapse" : "Expand"}
            onClick={(event) => {
              event.stopPropagation();
              setOpen((value) => !value);
            }}
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md",
              active ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {open ? (
              <ChevronDown className="size-3.5" strokeWidth={2} />
            ) : (
              <ChevronRight className="size-3.5" strokeWidth={2} />
            )}
          </button>
        ) : (
          <span className="size-6 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect(active ? null : part.id)}
          className="min-w-0 flex-1 truncate py-1.5 text-left"
          title={part.label}
        >
          {part.label}
        </button>
        <button
          type="button"
          title={selfHidden ? "Show part" : "Hide part"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleHidden(part.id);
          }}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md",
            selfHidden && "opacity-100",
            active
              ? "text-primary-foreground/85 hover:bg-white/15"
              : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10",
          )}
        >
          {selfHidden ? (
            <EyeOff className="size-3.5" strokeWidth={2} />
          ) : (
            <Eye className="size-3.5" strokeWidth={2} />
          )}
        </button>
      </div>
      {hasChildren && open ? (
        <ul>
          {part.children.map((child) => (
            <PartRow
              key={child.id}
              part={child}
              depth={depth + 1}
              selectedId={selectedId}
              hidden={hidden}
              ancestorHidden={isHidden}
              onSelect={onSelect}
              onToggleHidden={onToggleHidden}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
