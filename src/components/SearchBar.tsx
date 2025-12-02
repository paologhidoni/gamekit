import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div
      className="rounded-full w-full transition duration-300 relative"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        color: "var(--color-text-primary)",
        // borderColor: "var(--color-accent-primary)",
        // borderWidth: 2,
      }}
    >
      <Search className="absolute left-2 top-1/2 -translate-y-1/2" />

      <input type="text" className="py-2 pl-10 pr-6 w-full" />
    </div>
  );
}
