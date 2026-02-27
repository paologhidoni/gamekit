import { Coins } from "lucide-react";
import { useSearch } from "../context/SearchContext";

interface RateLimitIndicatorProps {
  remaining: number;
  total?: number;
}

export default function RateLimitIndicator({
  remaining,
  total = 6,
}: RateLimitIndicatorProps) {
  const isExhausted = remaining === 0;
  const { resetRateLimit } = useSearch();

  return (
    <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <Coins
            key={i}
            size={16}
            style={{
              color:
                i < remaining
                  ? "var(--color-accent-primary)"
                  : "var(--color-text-tertiary)",
              opacity: i < remaining ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      <span
        className="opacity-70"
        style={{ color: isExhausted ? "#ef4444" : "inherit" }}
      >
        {remaining}/{total} searches left today
      </span>

      {/* Reset rate limit button - development only */}
      {import.meta.env.DEV && (
        <button
          onClick={resetRateLimit}
          className="opacity-0 hover:opacity-20 transition-opacity text-xs"
          title="Admin reset"
        >
          🔄
        </button>
      )}
    </div>
  );
}
