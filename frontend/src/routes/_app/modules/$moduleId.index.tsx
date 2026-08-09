import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/modules/$moduleId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/modules/$moduleId/lesson/$lessonId",
      params: { moduleId: params.moduleId, lessonId: "orientation" },
    });
  },
});
