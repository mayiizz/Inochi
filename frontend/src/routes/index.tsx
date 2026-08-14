import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Boxes,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/bio/GlassCard";
import { Logo } from "@/components/bio/Logo";
import { useQuery } from "@tanstack/react-query";
import { ModuleCard } from "@/components/bio/Cards";
import { ModelViewer } from "@/components/bio/ModelViewer";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const overview = [
  {
    icon: GraduationCap,
    title: "Interactive Learning",
    body: "Explore biological concepts visually, one system at a time.",
  },
  {
    icon: Bot,
    title: "AI Tutor",
    body: "Ask questions and receive contextual explanations as you study.",
  },
  {
    icon: Boxes,
    title: "3D Exploration",
    body: "Interact with biological structures inside each module.",
  },
];

const steps = [
  { n: "01", title: "Explore", body: "Enter a module and orient around a living system." },
  { n: "02", title: "Understand", body: "Read, watch and ask the tutor until the idea clicks." },
  { n: "03", title: "Interact", body: "Inspect the 3D model for that system until the structure is clear." },
  { n: "04", title: "Master", body: "Ask the tutor to quiz you on the same structure you just inspected." },
];

function LandingPage() {
  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: api.modules,
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-8">
        <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3">
          <Logo />
          <Link
            to="/modules"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Enter Lab
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Learn biology by seeing, exploring and understanding it
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] text-foreground sm:text-6xl">
            Master Biology Through Intelligent Exploration
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Inochi combines AI tutoring and interactive 3D models of organs, viscera, the nervous
            system and cells in one calm scientific workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/modules"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Learning
              <ArrowRight className="size-4" strokeWidth={1.8} />
            </Link>
            <Link
              to="/modules"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white/70 px-5 py-3 text-sm font-semibold text-primary"
            >
              Explore Modules
            </Link>
          </div>
        </div>
        <ModelViewer
          src="/heart2.glb"
          modelName="Heart"
          modelType="Live 3D model"
          height="h-[420px] sm:h-[520px]"
        />
      </section>

      <section id="overview" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Platform overview
        </p>
        <h2 className="font-display text-3xl font-extrabold">A digital biology laboratory</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.map((item, index) => (
            <GlassCard key={item.title} hover delay={index * 0.05} className="p-5">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                <item.icon className="size-[18px]" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          How it works
        </p>
        <h2 className="font-display text-3xl font-extrabold">Explore → Understand → Interact → Master</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <GlassCard key={step.n} delay={index * 0.06} className="relative p-5">
              <p className="font-display text-sm font-bold text-accent-foreground">{step.n}</p>
              <h3 className="mt-3 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Featured modules
            </p>
            <h2 className="font-display text-3xl font-extrabold">Start with a living system</h2>
          </div>
          <Link to="/modules" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => (
            <ModuleCard key={module.id} module={module} delay={index * 0.04} />
          ))}
        </div>
      </section>

      <section id="tutor" className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-8 lg:grid-cols-2">
        <GlassCard strong className="p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" />
            AI learning
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold">Your Personal Biology Tutor</h2>
          <div className="mt-8 space-y-3">
            <div className="ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
              Why does the left ventricle have thicker walls?
            </div>
            <div className="glass max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-foreground">
              The left ventricle pumps blood through the systemic circulation, so it must generate
              greater pressure than the right ventricle. Thicker myocardium lets it produce that
              force with each contraction.
            </div>
          </div>
        </GlassCard>
        <ModelViewer
          src="/heart2.glb"
          modelName="Heart — ventricular walls"
          modelType="Lesson context"
          height="h-full min-h-[380px]"
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Heart", value: "Organ" },
            { label: "Skeleton", value: "System" },
            { label: "Viscera systems", value: "5" },
            { label: "Nervous system", value: "System" },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-5 text-center">
              <p className="font-display text-3xl font-extrabold">{stat.value}</p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-8">
        <GlassCard strong className="mx-auto max-w-6xl px-6 py-14 text-center sm:px-12">
          <h2 className="font-display text-4xl font-extrabold">Start exploring the living world.</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Step into the lab, open a 3D module, and let the tutor sit beside every lesson.
          </p>
          <Link
            to="/modules"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Enter Learning Lab
            <ArrowRight className="size-4" />
          </Link>
        </GlassCard>
      </section>
    </div>
  );
}
