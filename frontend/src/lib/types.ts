export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type LessonStatus = "completed" | "active" | "locked";

export interface Lesson {
  id: string;
  index: string;
  title: string;
  duration: string;
  difficulty: Difficulty;
  status: LessonStatus;
  summary: string;
  concepts: string[];
  body: string;
}

export interface ModuleSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  lessonCount: number;
  concepts: number;
  estimate: string;
  icon: string;
  accent: string;
  glbUrl: string;
  isolateNodes: string[];
}

export interface Module extends ModuleSummary {
  lessons: Lesson[];
}

export interface LessonDetail {
  module: ModuleSummary;
  lesson: Lesson;
}

export interface Profile {
  displayName: string;
  programme: string;
  initials: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  sources?: TutorSource[];
  images?: TutorImage[];
}

export interface TutorAction {
  type: "select" | "focus" | "hide" | "show" | "show_all" | "rotate" | "reset" | string;
  part?: string | null;
  yaw?: number | null;
  pitch?: number | null;
}

export interface TutorSource {
  title: string;
  authors: string;
  year: string;
  venue: string;
  url: string;
  source: string;
  lead: string;
}

export interface TutorImage {
  url: string;
  thumbUrl: string;
  caption: string;
  alt: string;
  source: string;
  sourceUrl: string;
  license: string;
}

export interface TutorReply {
  text: string;
  actions: TutorAction[];
  sources: TutorSource[];
  images: TutorImage[];
}

export type CameraCommand =
  | { id: number; kind: "focus"; part: string }
  | { id: number; kind: "rotate"; yaw: number; pitch: number }
  | { id: number; kind: "reset" };

export interface TutorMeta {
  conversations: { id: string; title: string; time: string }[];
  prompts: string[];
  suggestedQuestions: string[];
  seed: ChatMessage[];
  contextModule: string;
  contextLesson: string;
  contextModel: string;
  contextGlbUrl: string;
}
