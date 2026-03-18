import { config } from "dotenv";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import {
  checkRateLimit,
  getRemainingRequests,
} from "../src/server/utils/rateLimiter.js";
import type { AskAiRequest, AskAiResponse } from "../types.js";

config({ path: ".env.backend" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // Rate limiting: Extract IP and check limit FIRST to protect OpenAI credits
    const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
    const { success, remaining, reset } = await checkRateLimit(ip);

    if (!success) {
      res.status(429).json({
        error: "Daily limit reached. Try again tomorrow!",
        remaining: 0,
        reset: reset.toISOString(),
      });
      return;
    }

    const { gameName, question } = req.body as AskAiRequest;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `You are a helpful assistant and a video game expert.

          You MUST answer ONLY questions related to the provided game: ${gameName}.

          If the user asks something clearly unrelated to video games AND does not ask about anything related to ${gameName}, respond with exactly this sentence:
          "I can only help with questions about ${gameName}. Try asking about story, gameplay mechanics, characters, progression, or tips."

          The phrases "this game" and "it" always refer to the provided game: ${gameName} (in the context of the question).

          Treat as RELATED (do not refuse) when the user asks about:
          - story/lore, gameplay, mechanics, controls, progression, quests
          - characters, factions, items, abilities
          - difficulty, how it plays, “is it fun/exciting”, “what should I expect”
          - how long it is, whether it can be completed in X hours, playtime, replayability

          If you are unsure whether the question is related, assume it IS related and answer it in the context of ${gameName}.

          When answering, keep the answer focused on ${gameName}.`,
        },
        { role: "user", content: question },
      ],
      temperature: 0.5,
      max_output_tokens: 512,
    });

    res
      .status(200)
      .json({ answer: response.output_text, remaining } as AskAiResponse);
  } catch (err: unknown) {
    console.error(err);

    // Get remaining requests for error response (peek without consuming)
    const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
    const remaining = await getRemainingRequests(ip);

    res.status(500).json({
      error: "Failed to get an answer from the AI.",
      remaining,
    } as AskAiResponse);
  }
}
