import { Search } from "lucide-react";
import { useCallback, useRef } from "react";
import useDebounce from "../hooks/useDebounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(() => {
    onSearch(inputRef.current?.value ?? "");
  }, [onSearch]);

  const debouncedInputChange = useDebounce(handleInputChange);

  return (
    <div
      className="rounded-full w-full transition duration-300 relative"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        color: "var(--color-text-primary)",
      }}
    >
      <Search className="absolute left-2 top-1/2 -translate-y-1/2" />
      <form>
        <label htmlFor="search-game-input" className="sr-only">
          Search for a game
        </label>

        <input
          ref={inputRef}
          id="search-game-input"
          onChange={debouncedInputChange}
          type="text"
          className="py-2 pl-10 pr-6 w-full bg-transparent rounded-full focus:outline-none"
        />
      </form>
    </div>
  );
}
