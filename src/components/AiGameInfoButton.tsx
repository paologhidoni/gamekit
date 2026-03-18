import { useState } from "react";
import { Sparkles } from "lucide-react";
import AskAiModal from "./AskAiModal";

interface AiGameInfoButtonProps {
  gameName: string;
}

export default function AiGameInfoButton({ gameName }: AiGameInfoButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-1 bg-(--color-accent) text-white rounded-lg hover:bg-(--color-accent-secondary) transition-colors duration-200 font-medium cursor-pointer border-2 border-(--color-accent-secondary)"
        aria-label={`Ask AI about ${gameName}`}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={20} />
        Ask AI
      </button>

      {isOpen && (
        <AskAiModal
          gameName={gameName}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
