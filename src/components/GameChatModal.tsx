import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { Bot, Coins, MessageSquare, User, X } from "lucide-react";
import RichTextRenderer from "./RichTextRenderer";
import { useAiChat } from "../hooks/useAiChat";

interface GameChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameChatModal({ isOpen, onClose }: GameChatModalProps) {
  // Hook state
  const {
    question,
    messages,
    isLoading,
    remainingAiRequests,
    isRateLimited,
    canSubmit,
    setQuestion,
    submitQuestion,
  } = useAiChat();

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Escape close
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    // Focus dialog
    dialogRef.current?.focus();
  }, [isOpen]);

  useLayoutEffect(() => {
    // Stick to latest message
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={() => onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      <div
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl bg-(--color-bg-secondary) text-(--color-text-primary) border-2 border-(--color-accent-secondary) shadow-xl outline-none flex flex-col"
      >
        {/* Modal header */}
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/10 p-4 md:p-5">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-lg md:text-xl font-semibold flex items-center gap-2"
            >
              <MessageSquare size={20} className="text-(--color-accent-secondary)" />
              Friendly Gaming Expert Chat
            </h2>
            <p className="text-sm opacity-80 mt-1">
              Chat with a friendly gaming expert about anything gaming-related.
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
          {/* Chat thread */}
          <div
            ref={threadRef}
            role="region"
            aria-label="Game chat messages"
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
                      <RichTextRenderer content={m.content} className="text-sm leading-6" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex w-full min-w-0 justify-start">
                <div className="flex w-full min-w-0 items-start gap-2.5 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5 text-sm leading-6">
                  <Bot
                    size={18}
                    className="mt-0.5 shrink-0 opacity-70 text-(--color-accent-secondary)"
                    aria-hidden
                  />
                  <p className="opacity-70 italic">Thinking…</p>
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-white/10 p-4 md:p-5 pt-3 space-y-3">
            {/* Rate limit indicator */}
            <div className="flex items-center justify-start gap-2 text-sm flex-wrap">
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Coins
                    key={i}
                    size={16}
                    style={{
                      color:
                        i < remainingAiRequests
                          ? "var(--color-accent-primary)"
                          : "var(--color-text-tertiary)",
                      opacity: i < remainingAiRequests ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
              <span
                className="opacity-70"
                style={{ color: isRateLimited ? "#ef4444" : "inherit" }}
              >
                {remainingAiRequests}/6 chats left today
              </span>
            </div>

            <form onSubmit={submitQuestion} className="space-y-3">
              <textarea
                className="w-full p-3 rounded-xl border border-white/10 bg-black/10 focus:outline-none focus:ring-2 focus:ring-(--color-accent-secondary) focus:border-(--color-accent-secondary) resize-none disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base min-h-22 md:min-h-28"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  isRateLimited
                    ? "Daily limit reached. Try again tomorrow."
                    : "Ask anything about gaming. You are chatting with a friendly gaming expert."
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
}
