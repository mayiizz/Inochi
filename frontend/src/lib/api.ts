import type { ChatMessage, LessonDetail, Module, Profile, TutorMeta, TutorReply } from "./types";

const API_BASE = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) detail = payload.detail;
    } catch {
      // keep status text
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

export const api = {
  profile: () => request<Profile>("/api/profile"),
  modules: () => request<Module[]>("/api/modules"),
  module: (id: string) => request<Module>(`/api/modules/${id}`),
  lesson: (moduleId: string, lessonId: string) =>
    request<LessonDetail>(`/api/modules/${moduleId}/lessons/${lessonId}`),
  tutorMeta: () => request<TutorMeta>("/api/tutor"),
  tutorChat: (payload: {
    text: string;
    history: ChatMessage[];
    moduleId?: string;
    lessonId?: string;
    selectedPart?: string;
    partNames?: string[];
  }) =>
    request<TutorReply>("/api/tutor/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
