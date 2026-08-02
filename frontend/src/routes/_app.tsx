import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/bio/AppLayout";

export const Route = createFileRoute("/_app")({
  component: AppRoute,
});

function AppRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
