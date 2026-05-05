import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface UseAiChatResult {
  question: string;
  messages: ChatMessage[];
  isLoading: boolean;
  remainingAiRequests: number;
  isRateLimited: boolean;
  canSubmit: boolean;
  setQuestion: (value: string) => void;
  submitQuestion: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
  resetChat: () => void;
}

function newMessageId(): string {
  return crypto.randomUUID();
}

export function useAiChat(): UseAiChatResult {
  // Chat input
  const [question, setQuestion] = useState<string>("");
  // Chat thread
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Rate limit state
  const [remainingAiRequests, setRemainingAiRequests] = useState<number>(6);

  useEffect(() => {
    // Load initial quota
    const getRateLimitStatus = async (): Promise<void> => {
      try {
        const res = await fetch("/api/rate-limit");
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (
          typeof data === "object" &&
          data !== null &&
          "remaining" in data &&
          typeof data.remaining === "number"
        ) {
          setRemainingAiRequests(data.remaining);
        }
      } catch {
        // Keep default quota value
      }
    };

    void getRateLimitStatus();
  }, []);

  // Submit guard
  const canSubmit = useMemo<boolean>(() => question.trim().length > 0, [question]);
  const isRateLimited = remainingAiRequests <= 0;

  const submitQuestion = useCallback(
    async (event?: FormEvent<HTMLFormElement>): Promise<void> => {
      event?.preventDefault();
      if (!canSubmit || isLoading || isRateLimited) return;

      // User message
      const trimmed = question.trim();
      setMessages((prev) => [
        ...prev,
        { id: newMessageId(), role: "user", content: trimmed },
      ]);
      setQuestion("");
      setIsLoading(true);

      try {
        // Why: placeholder response until backend logic is added.
        const placeholder =
          "Game chat is ready. Hook up your AI logic in useAiChat to answer this question.";
        setMessages((prev) => [
          ...prev,
          { id: newMessageId(), role: "assistant", content: placeholder },
        ]);
        // Why: UI-only quota behavior until API integration is added.
        setRemainingAiRequests((prev) => Math.max(0, prev - 1));
      } finally {
        setIsLoading(false);
      }
    },
    [canSubmit, isLoading, isRateLimited, question],
  );

  const resetChat = useCallback((): void => {
    // Clear thread
    setMessages([]);
    setQuestion("");
    setIsLoading(false);
  }, []);

  return {
    question,
    messages,
    isLoading,
    remainingAiRequests,
    isRateLimited,
    canSubmit,
    setQuestion,
    submitQuestion,
    resetChat,
  };
}
