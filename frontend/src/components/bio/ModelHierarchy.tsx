import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ModelPart } from "@/lib/model-hierarchy";
import { cn } from "@/lib/utils";

export function ModelHierarchy({
  parts,
  selectedId,
  onSelect,
}: {
  parts: ModelPart[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Parts
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
                onSelect={onSelect}
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
  onSelect,
}: {
  part: ModelPart;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const hasChildren = part.children.length > 0;
  const [open, setOpen] = useState(depth < 1);
  const active = selectedId === part.id;

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-0.5 rounded-xl pr-2 text-left text-[13px] transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-white/70 dark:hover:bg-white/10",
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
      </div>
      {hasChildren && open ? (
        <ul>
          {part.children.map((child) => (
            <PartRow
              key={child.id}
              part={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
