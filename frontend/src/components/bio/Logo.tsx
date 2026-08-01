import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-extrabold leading-none text-accent">
        命
      </span>
      <span className="font-display text-[15px] font-extrabold tracking-[0.14em] text-foreground">
        Inochi
      </span>
    </Link>
  );
}
