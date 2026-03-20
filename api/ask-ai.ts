import { config } from "dotenv";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import {
  checkRateLimit,
  getRemainingRequests,
} from "../src/server/utils/rateLimiter.js";
import { parseAskAiRequestBody } from "../src/util/askAiWire.js";

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

    const parsed = parseAskAiRequestBody(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { gameName, question, prevResId } = parsed.value;

    // Why trim: so we never treat "" or accidental spaces as "continue the old thread" — that would skip the system prompt and break context.
    const trimmedPrev = typeof prevResId === "string" ? prevResId.trim() : "";
    // Why check: no id from the client means a new conversation; an id means the user is replying in the same modal thread.
    const isFirstTurn = trimmedPrev.length === 0;

    // Why only first turn: the model already saw these rules once; resending them every message wastes tokens and buys nothing because the thread is chained.
    const systemPrompt = `You are a helpful assistant and a video game expert.

    The user is asking about the game: ${gameName}. Every question is in that context. The phrases "this game", "it", and "this" refer to ${gameName} unless the user names another title.

    Refuse ONLY when the topic is clearly not about video games and not plausibly about ${gameName} (e.g. homework, politics, unrelated hobbies). In that case respond with exactly:
    "I can only help with questions about ${gameName}. Try asking about story, gameplay mechanics, characters, progression, or tips."

    Treat as RELATED (never refuse) when the user asks about:
    - story/lore, gameplay, mechanics, controls, progression, quests
    - characters, factions, items, abilities
    - difficulty, how it plays, whether it is fun, what to expect
    - playtime, replayability, completion time
    - similar games, games like this, recommendations, comparisons, same genre or style, what to play next if they liked ${gameName}

    For similar-game or recommendation questions, you MAY name and briefly describe other real video games. Tie suggestions to how they resemble ${gameName} (genre, mechanics, mood, etc.).

    If you are unsure whether the question is related, assume it IS related and answer helpfully.

    For non-recommendation answers, keep the focus on ${gameName} unless comparing helps the user.`;

    // Why user-only on follow-ups: OpenAI keeps the prior system message + Q&A on file; we only need to send the new question.
    const input = isFirstTurn
      ? [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: question },
        ]
      : [{ role: "user" as const, content: question }];

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input,
      temperature: 0.2,
      max_output_tokens: 512,
      // Why set this: tells OpenAI which answer to extend so follow-ups stay one continuous chat (omit on first message so we start clean).
      previous_response_id: trimmedPrev || undefined,
      // Why true: without storing responses, previous_response_id cannot work — there would be nothing to continue from.
      store: true,
    });

    res.status(200).json({
      answer: response.output_text,
      remaining,
      id: response.id,
    });
  } catch (err: unknown) {
    console.error(err);

    // Get remaining requests for error response (peek without consuming)
    const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
    const remaining = await getRemainingRequests(ip);

    res.status(500).json({
      error: "Failed to get an answer from the AI.",
      remaining,
    });
  }
}
