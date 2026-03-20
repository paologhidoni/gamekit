import { z } from "zod";

const trimmedNonEmpty = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "Must not be empty" });

export const askAiRequestSchema = z
  .object({
    gameName: trimmedNonEmpty,
    question: trimmedNonEmpty,
    prevResId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  })
  .transform((d) => ({
    gameName: d.gameName,
    question: d.question,
    ...(typeof d.prevResId === "string" ? { prevResId: d.prevResId } : {}),
  }));

/** Wire shape callers may pass before JSON serialization (allows null prevResId). */
export type AskAiRequest = z.input<typeof askAiRequestSchema>;

/** Normalized body after validation (trimmed strings; prevResId only when a string). */
export type AskAiRequestParsed = z.output<typeof askAiRequestSchema>;

export const askAiSuccessResponseSchema = z.object({
  answer: z.string(),
  remaining: z.number().optional(),
  id: z.string().optional(),
});

export const askAiErrorResponseSchema = z.object({
  error: z.string(),
  remaining: z.number().optional(),
  reset: z.string().optional(),
});

export type AskAiSuccessResponse = z.infer<typeof askAiSuccessResponseSchema>;
export type AskAiErrorResponse = z.infer<typeof askAiErrorResponseSchema>;

/** Normalized client return from askAiAboutGame. */
export type AskAiAboutGameResult = {
  answer: string;
  id?: string;
};
