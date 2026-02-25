import { Search, Sparkles } from "lucide-react";
import { useCallback, type ChangeEvent } from "react";
import useDebounce from "../hooks/useDebounce";
import { useSearch } from "../context/SearchContext";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const { isAiSearch } = useSearch();

  const handleInputChange = useCallback(
    (value: string) => {
      onSearch(value);
    },
    [onSearch],
  );

  const debouncedInputChange = useDebounce(handleInputChange);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    debouncedInputChange(e.target.value);
  };

  return (
    <div
      className="rounded-full w-full transition duration-300 relative focus:border-y-(--color-accent-primary)"
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

      <form>
        <label htmlFor="search-game-input" className="sr-only">
          Search for a game
        </label>

        {isAiSearch ? (
          <textarea
            id=""
            onChange={handleChange}
            className="py-2 pl-10 pr-6 w-full rounded-full outline-none"
          ></textarea>
        ) : (
          <input
            id="search-game-input"
            onChange={handleChange}
            type="text"
            className="py-2 pl-10 pr-6 w-full rounded-full outline-none"
          />
        )}
      </form>
    </div>
  );
}
