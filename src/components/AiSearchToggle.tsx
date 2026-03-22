import { Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useSearch } from "../context/SearchContext";

export default function AiSearchToggle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lastAiQuery } = useSearch();
  const isAi = location.pathname === "/ai-search";

  const handleToggle = () => {
    if (isAi) {
      navigate("/");
    } else {
      const search = lastAiQuery ? `?q=${encodeURIComponent(lastAiQuery)}` : "";
      navigate(`/ai-search${search}`);
    }
  };

  return (
    <div className="flex items-center gap-2 md:ml-auto">
      <label
        htmlFor="ai-toggle"
        className={`text-sm font-medium flex items-center gap-1 ${isAi ? "text-(--color-accent-primary)" : ""}`}
      >
        <Sparkles size={20} />
        AI Search
      </label>

      <button
        id="ai-toggle"
        onClick={handleToggle}
        className="relative inline-flex h-8 w-13 md:h-6 md:w-11 items-center rounded-full transition-colors border-2 cursor-pointer"
        style={{
          backgroundColor: isAi
            ? "var(--color-accent-primary)"
            : "var(--color-bg-tertiary)",
          borderColor: "var(--color-bg-secondary)",
        }}
      >
        <span
          className="inline-block h-5 w-5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform"
          style={{
            transform: isAi ? "translateX(24px)" : "translateX(4px)",
          }}
        />
      </button>
    </div>
  );
}
