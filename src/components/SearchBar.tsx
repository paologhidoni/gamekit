import { Search, Sparkles, Send } from "lucide-react";
import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import useDebounce from "../hooks/useDebounce";
import { useSearch } from "../context/SearchContext";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const { isAiSearch, setIsAiSearch } = useSearch();
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = useCallback(
    (value: string) => {
      if (!isAiSearch) {
        onSearch(value);
      }
    },
    [onSearch, isAiSearch],
  );

  const debouncedInputChange = useDebounce(handleInputChange);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInputValue(e.target.value);
    debouncedInputChange(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isAiSearch && inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  const handletoggle = () => {
    setInputValue("");
    onSearch(""); // Clear parent query state
    setIsAiSearch(!isAiSearch);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* AI Mode Toggle */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <label
          htmlFor="ai-toggle"
          className={`text-sm font-medium flex items-center gap-1 ${isAiSearch ? "text-(--color-accent-primary)" : ""}`}
        >
          <Sparkles size={20} />
          AI Search
        </label>
        <button
          id="ai-toggle"
          onClick={handletoggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors border-2 cursor-pointer"
          style={{
            backgroundColor: isAiSearch
              ? "var(--color-accent-primary)"
              : "var(--color-bg-tertiary)",
            borderColor: "var(--color-bg-secondary)",
          }}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            style={{
              transform: isAiSearch ? "translateX(24px)" : "translateX(4px)",
            }}
          />
        </button>
      </div>

      {/* Search Input */}
      <div
        className="rounded-full w-full transition duration-300 relative"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          color: "var(--color-text-primary)",
        }}
      >
        {isAiSearch ? (
          <Sparkles className="absolute left-2 top-1/2 -translate-y-1/2" />
        ) : (
          <Search className="absolute left-2 top-1/2 -translate-y-1/2" />
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="search-game-input" className="sr-only">
            Search for a game
          </label>

          {isAiSearch ? (
            <>
              <textarea
                id="search-game-input"
                value={inputValue}
                onChange={handleChange}
                className="py-2 pl-10 pr-12 w-full rounded-full outline-none resize-none flex items-center"
                style={{
                  lineHeight: "1.5rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                }}
                placeholder="Describe games... e.g. 'cozy RPG on Game Boy'"
                rows={1}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:opacity-70 cursor-pointer"
                style={{ color: "var(--color-accent-primary)" }}
                aria-label="Submit AI search"
              >
                <Send size={20} />
              </button>
            </>
          ) : (
            <input
              id="search-game-input"
              value={inputValue}
              onChange={handleChange}
              type="text"
              className="py-2 pl-10 pr-6 w-full rounded-full outline-none"
              placeholder="Search games by title..."
            />
          )}
        </form>
      </div>
    </div>
  );
}
