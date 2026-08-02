import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <Navbar />
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden px-3 pb-3 pt-3 sm:px-6">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-[34px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}