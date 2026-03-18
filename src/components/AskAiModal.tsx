import { useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import RateLimitIndicator from "./RateLimitIndicator";
import { useSearch } from "../context/SearchContext";

interface AskAiModalProps {
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
}

const AskAiModal = ({ gameName, isOpen, onClose }: AskAiModalProps) => {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { remainingAiRequests, askAiAboutGame } = useSearch();

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!canSubmit || isLoading || isRateLimited) return;

    setIsLoading(true);
    setAnswer("");

    try {
      const result = await askAiAboutGame({
        gameName,
        question: question.trim(),
      });
      setAnswer(result);
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
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 md:p-5">
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

        <div className="p-4 md:p-5 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <RateLimitIndicator remaining={remainingAiRequests} total={6} />
            </div>

            {/* Question Input */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                className="w-full p-3 rounded-xl border border-white/10 bg-black/10 focus:outline-none focus:ring-2 focus:ring-(--color-accent-secondary) focus:border-(--color-accent-secondary) resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                rows={4}
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
                className="px-4 py-2 rounded-lg bg-(--color-accent) text-white hover:bg-(--color-accent-secondary) transition-colors duration-200 font-medium cursor-pointer border-2 border-(--color-accent-secondary) disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!canSubmit || isLoading || isRateLimited}
              >
                {isLoading ? "Thinking..." : "Ask"}
              </button>
            </form>

            {/* Answer */}
            {answer && (
              <div className="p-4 rounded-xl border border-white/10 bg-black/10">
                <div className="max-h-[40dvh] overflow-y-auto pr-2">
                  <p className="leading-6 whitespace-pre-wrap wrap-break-word">
                    {answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAiModal;
