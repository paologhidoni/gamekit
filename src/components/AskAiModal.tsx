import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bot, User, X } from "lucide-react";
import RateLimitIndicator from "./RateLimitIndicator";
import RichTextRenderer from "./RichTextRenderer";
import { useSearch } from "../context/SearchContext";

interface AskAiModalProps {
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
}

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

function newMessageId(): string {
  return crypto.randomUUID();
}

const AskAiModal = ({ gameName, isOpen, onClose }: AskAiModalProps) => {
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prevResId, setPrevResId] = useState<string | null>(null);
  const { remainingAiRequests, askAiAboutGame } = useSearch();

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const canSubmit = useMemo<boolean>(
    () => question.trim().length > 0,
    [question],
  );
  const isRateLimited = remainingAiRequests <= 0;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
  }, [isOpen]);

  useLayoutEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!canSubmit || isLoading || isRateLimited) return;

    const trimmed = question.trim();
    const userId = newMessageId();
    const thinkingId = newMessageId();

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: trimmed },
      { id: thinkingId, role: "assistant", content: "Thinking…" },
    ]);
    setQuestion("");
    setIsLoading(true);

    try {
      const result = await askAiAboutGame({
        gameName,
        question: trimmed,
        prevResId: prevResId ?? undefined,
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId ? { ...m, content: result.answer } : m,
        ),
      );
      if (result.id) setPrevResId(result.id);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={() => onClose()}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl bg-(--color-bg-secondary) border-2 border-(--color-accent-secondary) shadow-xl outline-none flex flex-col"
      >
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/10 p-4 md:p-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg md:text-xl font-semibold">
              Ask AI about {gameName}
            </h2>

            <p className="text-sm opacity-80 mt-1">
              Ask a question about gameplay, story, mechanics, or tips.
            </p>
          </div>

          <button
            type="button"
            className="shrink-0 inline-flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 transition-colors h-9 w-9 cursor-pointer"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div
            ref={threadRef}
            role="region"
            aria-label={`Chat about ${gameName}`}
            aria-live="polite"
            aria-busy={isLoading}
            className={`flex-1 min-h-0 overflow-y-auto px-4 md:px-5 space-y-4 ${
              messages.length > 0 ? "py-4" : ""
            }`}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "flex justify-end"
                    : "flex w-full min-w-0 justify-start"
                }
              >
                {m.role === "user" ? (
                  <div className="flex max-w-[min(85%,28rem)] flex-row-reverse items-start gap-2.5 rounded-2xl bg-(--color-accent) px-3 py-2.5 text-sm leading-6 text-white shadow-sm">
                    <User
                      size={18}
                      className="mt-0.5 shrink-0 text-white/70"
                      aria-hidden
                    />
                    <p className="min-w-0 flex-1 whitespace-pre-wrap wrap-break-word">
                      {m.content}
                    </p>
                  </div>
                ) : (
                  <div className="flex w-full min-w-0 items-start gap-2.5 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5 text-sm leading-6">
                    <Bot
                      size={18}
                      className="mt-0.5 shrink-0 opacity-70 text-(--color-accent-secondary)"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      {m.content === "Thinking…" ? (
                        <p className="opacity-70 italic">Thinking…</p>
                      ) : (
                        <RichTextRenderer
                          content={m.content}
                          className="text-sm leading-6"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-white/10 p-4 md:p-5 pt-3 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <RateLimitIndicator remaining={remainingAiRequests} total={6} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                className="w-full p-3 rounded-xl border border-white/10 bg-black/10 focus:outline-none focus:ring-2 focus:ring-(--color-accent-secondary) focus:border-(--color-accent-secondary) resize-none disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base min-h-22 md:min-h-28"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  isRateLimited
                    ? "Daily limit reached. Try again tomorrow."
                    : "e.g. What is the main storyline of this game?"
                }
                disabled={isRateLimited}
              />

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-(--color-accent) text-white hover:bg-(--color-accent-secondary) transition-colors duration-200 font-medium cursor-pointer border-2 border-(--color-accent-secondary) disabled:opacity-60 disabled:cursor-not-allowed min-h-10"
                disabled={!canSubmit || isLoading || isRateLimited}
              >
                {isLoading ? "Thinking…" : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAiModal;
