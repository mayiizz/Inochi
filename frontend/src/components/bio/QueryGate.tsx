import type { ReactNode } from "react";

export function QueryGate({
  isPending,
  error,
  children,
}: {
  isPending: boolean;
  error: Error | null;
  children: ReactNode;
}) {
  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }
  return <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>;
}
