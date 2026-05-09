import { z } from "zod";

const trimmedNotEmpty = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "Must not be empty" });

export const aiChatRequestSchema = z.object({
  question: trimmedNotEmpty,
  threadId: z.string(),
});

export type AiChatRequest = z.input<typeof aiChatRequestSchema>;
export type AiChatRequestParsed = z.output<typeof aiChatRequestSchema>;

export const aiChatSuccessResponseSchema = z.object({
  answer: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  remaining: z.number().optional(),
  threadId: z.string(),
});

export const aiChatErrorResponseSchema = z.object({
  error: z.string(),
  remaining: z.number().optional(),
  reset: z.string().optional(),
});

export type aiChatSuccessResponse = z.infer<typeof aiChatSuccessResponseSchema>;
export type aiChatErrorResponse = z.infer<typeof aiChatErrorResponseSchema>;
