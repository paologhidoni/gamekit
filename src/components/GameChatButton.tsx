import { Bot } from "lucide-react";
import { useState } from "react";
import GameChatModal from "./GameChatModal";

export default function GameChatButton() {
  // Modal state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-2 sm:right-3 xl:right-6 2xl:right-16 bottom-4 md:bottom-6 z-50 border-3 border-(--color-accent-primary-t2) rounded-full p-3 transition-colors hover:opacity-80 md:right-6 cursor-pointer"
        style={{
          backgroundColor: "var(--color-accent-primary)",
          color: "var(--color-text-on-accent)",
        }}
        aria-label="Open game chat"
      >
        <Bot size={30} />
      </button>

      {/* Chat modal */}
      {isOpen && <GameChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
