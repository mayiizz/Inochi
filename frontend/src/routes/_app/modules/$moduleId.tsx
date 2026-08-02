import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/modules/$moduleId")({
  component: ModuleLayout,
});

function ModuleLayout() {
  return <Outlet />;
}
