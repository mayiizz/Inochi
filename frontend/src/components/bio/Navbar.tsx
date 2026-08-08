import { useQuery } from "@tanstack/react-query";
import { Bell, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTheme } from "@/hooks/use-theme";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";

export function Navbar() {
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  const initials = profile?.initials ?? "—";
  const { isDark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass-strong mx-auto flex max-w-[1600px] items-center gap-4 rounded-2xl px-4 py-3 sm:px-5">
        <Logo />
        <SearchBar className="ml-2 hidden max-w-md flex-1 md:flex" />
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            title="Notifications"
            onClick={() => toast("Heart, Skeleton, Nervous System and viscera models are ready.")}
            className="relative flex size-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-white/70 text-muted-foreground transition-colors hover:text-primary dark:bg-white/10"
          >
            <Bell className="size-4" strokeWidth={1.8} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
          </button>
          <button
            type="button"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggle}
            className="flex size-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-white/70 text-muted-foreground transition-colors hover:text-primary dark:bg-white/10"
          >
            {isDark ? <Sun className="size-4" strokeWidth={1.8} /> : <Moon className="size-4" strokeWidth={1.8} />}
          </button>
          <span className="flex size-9 items-center justify-center rounded-xl bg-secondary font-display text-xs font-bold text-primary">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
