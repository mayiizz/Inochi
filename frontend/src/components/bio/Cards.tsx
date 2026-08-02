import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  PlayCircle,
} from "lucide-react";
import { GlassCard } from "./GlassCard";
import type { Difficulty, Lesson, Module } from "@/lib/types";
import { resolveIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const difficultyTone: Record<Difficulty, string> = {
  Beginner: "bg-success/12 text-success",
  Intermediate: "bg-accent/20 text-accent-foreground",
  Advanced: "bg-warning/18 text-[oklch(0.52_0.11_70)]",
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        difficultyTone[level],
      )}
    >
      {level}
    </span>
  );
}

export function ModuleCard({ module, delay = 0 }: { module: Module; delay?: number }) {
  const Icon = resolveIcon(module.icon);
  return (
    <GlassCard hover delay={delay} className="group overflow-hidden">
      <div
        className={cn(
          "relative h-32 overflow-hidden bg-gradient-to-br",
          module.accent,
        )}
      >
        <div className="absolute inset-0 grid-lab opacity-60" />
        <span className="absolute right-4 top-4 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-md">
          {module.category}
        </span>
        <span className="absolute -bottom-6 left-5 flex size-14 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-white/85 text-primary backdrop-blur-xl">
          <Icon className="size-6" strokeWidth={1.6} />
        </span>
      </div>
      <div className="p-5 pt-9">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-foreground">{module.title}</h3>
          <DifficultyBadge level={module.difficulty} />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{module.description}</p>

        <div className="mt-5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>{module.lessonCount} lessons</span>
          <span>{module.estimate}</span>
        </div>

        <Link
          to="/modules/$moduleId/lesson/$lessonId"
          params={{ moduleId: module.id, lessonId: "orientation" }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white/70 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          Explore Module
          <ArrowRight className="size-4" strokeWidth={1.8} />
        </Link>
      </div>
    </GlassCard>
  );
}

export function LessonCard({
  lesson,
  moduleId,
  last = false,
}: {
  lesson: Lesson;
  moduleId: string;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-4">
      {!last ? (
        <span className="absolute left-[19px] top-11 h-[calc(100%-1.5rem)] w-px bg-border" />
      ) : null}
      <span className="z-10 mt-2 flex size-10 shrink-0 items-center justify-center rounded-xl border-transparent bg-primary text-primary-foreground">
        <PlayCircle className="size-4" strokeWidth={1.8} />
      </span>

      <div className="glass flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {lesson.index}
          </p>
          <h4 className="mt-1 font-display text-base font-bold text-foreground">
            {lesson.title}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">{lesson.summary}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Clock className="size-3.5" strokeWidth={1.8} />
            {lesson.duration}
          </span>
          <DifficultyBadge level={lesson.difficulty} />
          <Link
            to="/modules/$moduleId/lesson/$lessonId"
            params={{ moduleId, lessonId: lesson.id }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}