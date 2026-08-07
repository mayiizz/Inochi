import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  category: string;
  difficulty: string;
  categories: readonly string[];
  difficulties: readonly string[];
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
}

export function SearchBar({
  placeholder = "Search modules, concepts, lessons...",
  className,
  value,
  onChange,
  filters,
}: {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (v: string) => void;
  filters?: SearchFilters;
}) {
  const [internal, setInternal] = useState("");
  const current = value ?? internal;
  const filterActive = Boolean(
    filters && (filters.category !== "All" || filters.difficulty !== "All"),
  );

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-2xl border border-[var(--glass-border)] bg-white/70 px-4 py-2.5 backdrop-blur-xl transition-all focus-within:border-ring/50 focus-within:shadow-lift dark:bg-white/10",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
      <input
        value={current}
        onChange={(e) => (onChange ? onChange(e.target.value) : setInternal(e.target.value))}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      {filters ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Filters"
              className={cn(
                "relative flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                filterActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-primary",
              )}
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.8} />
              {filterActive ? (
                <span className="absolute right-1 top-1 size-1.5 rounded-full bg-accent" />
              ) : null}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 rounded-2xl p-4">
            <FilterGroup
              label="Category"
              values={filters.categories}
              current={filters.category}
              onChange={filters.onCategoryChange}
            />
            <FilterGroup
              label="Difficulty"
              values={filters.difficulties}
              current={filters.difficulty}
              onChange={filters.onDifficultyChange}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <kbd className="hidden rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
          /
        </kbd>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  values,
  current,
  onChange,
}: {
  label: string;
  values: readonly string[];
  current: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              current === value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/70 text-muted-foreground hover:text-primary",
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
