import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/bio/AppLayout";
import { ModuleCard } from "@/components/bio/Cards";
import { QueryGate } from "@/components/bio/QueryGate";
import { SearchBar } from "@/components/bio/SearchBar";
import { api } from "@/lib/api";
import type { Difficulty } from "@/lib/types";

export const Route = createFileRoute("/_app/modules/")({
  component: ModulesPage,
});

const categories = ["All", "Organs", "Systems", "Cells"] as const;
const difficulties: Array<"All" | Difficulty> = ["All", "Beginner", "Intermediate", "Advanced"];

function ModulesPage() {
  const { data: modules = [], isPending, error } = useQuery({
    queryKey: ["modules"],
    queryFn: api.modules,
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("All");

  const filtered = useMemo(() => {
    return modules.filter((module) => {
      const matchesQuery = `${module.title} ${module.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "All" || module.category === category;
      const matchesDifficulty = difficulty === "All" || module.difficulty === difficulty;
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [modules, query, category, difficulty]);

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Explore BioScience"
        subtitle="Organs, systems and cells, each with a live 3D model."
      />
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search modules..."
        className="mb-5 max-w-xl"
        filters={{
          category,
          difficulty,
          categories,
          difficulties,
          onCategoryChange: (value) => setCategory(value as (typeof categories)[number]),
          onDifficultyChange: (value) => setDifficulty(value as (typeof difficulties)[number]),
        }}
      />

      <QueryGate isPending={isPending} error={error}>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((module, index) => (
            <ModuleCard key={module.id} module={module} delay={index * 0.04} />
          ))}
        </div>
        {filtered.length === 0 && !isPending ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">No modules match those filters.</p>
        ) : null}
      </QueryGate>
    </div>
  );
}
