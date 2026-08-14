import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ChatMessage, TutorAction, TutorReply } from "@/lib/types";

export function useTutorChat(
  seed: ChatMessage[],
  context?: {
    moduleId?: string;
    lessonId?: string;
    selectedPart?: string | null;
    partNames?: string[];
  },
) {
  const [messages, setMessages] = useState<ChatMessage[]>(seed);
  const [pending, setPending] = useState(false);
  const [lastReply, setLastReply] = useState<TutorReply | null>(null);
  const contextRef = useRef(context);
  contextRef.current = context;

  async function send(text: string): Promise<TutorAction[]> {
    const history = messages;
    const next: ChatMessage[] = [...history, { role: "user", text }];
    setMessages(next);
    setPending(true);
    const current = contextRef.current;
    try {
      const reply = await api.tutorChat({
        text,
        history,
        ...(current?.moduleId ? { moduleId: current.moduleId } : {}),
        ...(current?.lessonId ? { lessonId: current.lessonId } : {}),
        ...(current?.selectedPart ? { selectedPart: current.selectedPart } : {}),
        ...(current?.partNames?.length ? { partNames: current.partNames } : {}),
      });
      setLastReply(reply);
      setMessages([
        ...next,
        {
          role: "assistant",
          text: reply.text,
          sources: reply.sources,
          images: reply.images,
        },
      ]);
      return reply.actions ?? [];
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tutor unavailable";
      toast.error(message);
      setMessages([
        ...next,
        {
          role: "assistant",
          text: "I cannot reach the tutor right now. Set GROQ_API_KEY in backend/.env and restart the API.",
        },
      ]);
      return [];
    } finally {
      setPending(false);
    }
  }

  return { messages, send, pending, setMessages, lastReply };
}
