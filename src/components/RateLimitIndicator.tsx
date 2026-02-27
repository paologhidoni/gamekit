import { Coins } from "lucide-react";

interface RateLimitIndicatorProps {
  remaining: number;
  total?: number;
}

export default function RateLimitIndicator({
  remaining,
  total = 6,
}: RateLimitIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm flex-wrap">
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

      <span className="opacity-70">
        {remaining}/{total} searches left today
      </span>
    </div>
  );
}
