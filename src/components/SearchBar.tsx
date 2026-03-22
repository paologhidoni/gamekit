import { Search, Sparkles, Send } from "lucide-react";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import useDebounce from "../hooks/useDebounce";
import { useSearch } from "../context/SearchContext";
import AiSearchToggle from "./AiSearchToggle";
import RateLimitIndicator from "./RateLimitIndicator";

interface SearchBarProps {
  committedQuery?: string;
  placeholder?: string;
  /** Classic mode: fires debounced on every keystroke. */
  onDebouncedChange?: (value: string) => void;
  /** AI mode: fires on explicit Send / Enter. */
  onSubmit?: (value: string) => void;
  showSubmitButton?: boolean;
  showRateLimit?: boolean;
  icon?: "search" | "sparkles";
}

export default function SearchBar({
  committedQuery = "",
  placeholder = "Search games by title...",
  onDebouncedChange,
  onSubmit,
  showSubmitButton = false,
  showRateLimit = false,
  icon = "search",
}: SearchBarProps) {
  const { remainingAiRequests } = useSearch();
  const [inputValue, setInputValue] = useState(committedQuery);

  useEffect(() => {
    setInputValue(committedQuery);
  }, [committedQuery]);

  const fireDebouncedChange = useCallback(
    (value: string) => onDebouncedChange?.(value),
    [onDebouncedChange],
  );
  const debouncedChange = useDebounce(fireDebouncedChange);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (onDebouncedChange) {
      debouncedChange(value);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit && inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  const Icon = icon === "sparkles" ? Sparkles : Search;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap justify-center md:justify-between">
        <div className="order-2 min-[470px]:order-1">
          {showRateLimit && (
            <RateLimitIndicator remaining={remainingAiRequests} />
          )}
        </div>
        <div className="order-1 min-[470px]:order-2">
          <AiSearchToggle />
        </div>
      </div>

      <div
        className="rounded-full w-full transition duration-300 relative"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          color: "var(--color-text-primary)",
        }}
      >
        <Icon className="absolute left-2 top-1/2 -translate-y-1/2" />

        <form onSubmit={handleSubmit}>
          <label htmlFor="search-game-input" className="sr-only">
            Search for a game
          </label>

          <input
            id="search-game-input"
            value={inputValue}
            onChange={handleChange}
            type="text"
            className={`py-2 pl-10 w-full rounded-full outline-none ${showSubmitButton ? "pr-12" : "pr-6"}`}
            placeholder={placeholder}
          />

          {showSubmitButton && (
            <button
              type="submit"
              disabled={remainingAiRequests === 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:opacity-70 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: "var(--color-accent-primary)" }}
              aria-label="Submit AI search"
            >
              <Send size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
