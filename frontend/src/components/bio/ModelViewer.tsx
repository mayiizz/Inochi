import { Expand, Maximize2, RotateCw } from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ModelPart } from "@/lib/model-hierarchy";
import { displayPartLabel } from "@/lib/model-hierarchy";
import type { CameraCommand } from "@/lib/types";
import { cn } from "@/lib/utils";

const ModelCanvas = lazy(() => import("./ModelCanvas"));

export interface ModelViewerProps {
  src: string;
  isolateNodes?: string[];
  selectedName?: string | null;
  hiddenNames?: string[];
  cameraCommand?: CameraCommand | null;
  floatingGuide?: ReactNode;
  onSelect?: ((name: string | null) => void) | undefined;
  onHierarchy?: ((parts: ModelPart[]) => void) | undefined;
  modelName?: string;
  modelType?: string;
  fullscreen?: boolean;
  showControls?: boolean;
  height?: string;
  caption?: string;
  action?: ReactNode;
  className?: string;
}

export function ModelViewer({
  src,
  isolateNodes = [],
  selectedName = null,
  hiddenNames = [],
  cameraCommand = null,
  floatingGuide,
  onSelect,
  onHierarchy,
  modelName = "3D Model",
  modelType = "Interactive 3D Model",
  fullscreen = false,
  showControls = true,
  height = "h-[460px]",
  caption,
  action,
  className,
}: ModelViewerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [viewKey, setViewKey] = useState(0);
  const isolateKey = isolateNodes.join("|");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setViewKey((current) => current + 1);
  }, [src, isolateKey]);

  const resetView = useCallback(() => {
    onSelect?.(null);
    setViewKey((current) => current + 1);
  }, [onSelect]);

  const toggleFullscreen = useCallback(() => {
    const node = shellRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void node.requestFullscreen();
  }, []);

  return (
    <div
      ref={shellRef}
      className={cn(
        "glass relative min-h-0 overflow-hidden rounded-3xl bg-[#c5d5e4] dark:bg-[radial-gradient(ellipse_at_center,oklch(0.28_0.04_260/0.9),oklch(0.18_0.03_264)_70%)]",
        fullscreen ? "h-[calc(100svh-9rem)]" : height,
        className,
      )}
    >
      <div className="absolute inset-0 grid-lab opacity-15" />

      <div className="absolute left-5 top-5 z-10 flex flex-wrap items-center gap-2">
        <span className="glass-strong inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          <span className="size-1.5 rounded-full bg-success" />
          Select & Learn
        </span>
        <span className="glass-strong rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {modelType}
        </span>
        {selectedName ? (
          <span className="glass-strong rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
            {displayPartLabel(selectedName)}
          </span>
        ) : null}
      </div>

      <div className="absolute inset-0">
        {mounted ? (
          <Suspense fallback={<ViewportFallback />}>
            <ModelCanvas
              key={`${src}-${isolateKey}-${viewKey}`}
              src={src}
              isolateNodes={isolateNodes}
              selectedName={selectedName}
              hiddenNames={hiddenNames}
              cameraCommand={cameraCommand}
              floatingGuide={floatingGuide}
              onSelect={onSelect}
              onHierarchy={onHierarchy}
            />
          </Suspense>
        ) : (
          <ViewportFallback />
        )}
      </div>

      {(modelName || caption || action) && (
        <div className="pointer-events-none absolute inset-x-0 top-14 z-10 flex flex-col items-center px-6 text-center">
          <p className="font-display text-sm font-bold text-foreground/80">{modelName}</p>
          {caption ? <p className="mt-1 max-w-sm text-xs text-muted-foreground">{caption}</p> : null}
          {action ? <div className="pointer-events-auto mt-3">{action}</div> : null}
        </div>
      )}

      {showControls ? (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-[var(--glass-border)] bg-white/80 p-1.5 backdrop-blur-xl">
          <span className="hidden px-3 py-2 text-xs font-medium text-muted-foreground sm:inline">
            Drag to rotate · click a part to learn
          </span>
          <button
            type="button"
            title="Reset view"
            onClick={resetView}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <RotateCw className="size-4" strokeWidth={1.7} />
            Reset
          </button>
          <button
            type="button"
            title="Fit"
            onClick={resetView}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <Expand className="size-4" strokeWidth={1.7} />
            Fit
          </button>
          <button
            type="button"
            title="Fullscreen"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <Maximize2 className="size-4" strokeWidth={1.7} />
            Fullscreen
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ViewportFallback() {
  return (
    <div className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
      Preparing viewport…
    </div>
  );
}
