import { Sparkles } from "lucide-react";

interface AiExplanationProps {
  explanation: string;
  gameCount: number;
}

export default function AiExplanation({
  explanation,
  gameCount,
}: AiExplanationProps) {
  return (
    <div
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-accent-primary)",
      }}
    >
      <div className="flex items-start gap-3">
        <Sparkles
          className="mt-1 shrink-0"
          style={{ color: "var(--color-accent-primary)" }}
        />
        <div>
          <p className="text-lg leading-relaxed">{explanation}</p>
          <p className="text-sm mt-2 opacity-70">
            Showing {gameCount} AI-validated results
          </p>
        </div>
      </div>
    </div>
  );
}
