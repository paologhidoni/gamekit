import OpenAI from "openai";
import { config } from "dotenv";

config({ path: ".env.backend" });

/**
 * This is the central hub for communicating with the OpenAI API. It's designed to transform a user's natural language
 * query (like "cozy rpg on gameboy") into structured, reliable data that the backend can use to call RAWG api.
 * It coerces a powerful, creative AI into acting like a predictable, structured data-extraction engine,
 * which is the foundation of my AI search feature.
 */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * This is the AI's "master instruction manual." Before it even sees the user's query, it reads this prompt
 * to understand its role, constraints and output format.
 */
const SYSTEM_PROMPT = `ROLE: Video game discovery engine that interprets natural language queries.

RULES:
- Only respond to video game related queries
- If the query is not about video games, do NOT use the recommend_games tool
- Only suggest games you are highly confident exist on the specified platform
- If uncertain about platform availability, omit the game
- Do not estimate release years or metadata
- Provide 3-15 candidates only
- Use official release titles
- Platform must match allowed vocabulary exactly
- Confidence reflects certainty the game fits ALL criteria (0.0 to 1.0)

PLATFORM VOCABULARY (use ONLY these):
NES, SNES, Genesis, PC Engine, PlayStation, PS2, PS3, PS4, PS5,
Nintendo 64, GameCube, Wii, Wii U, Nintendo Switch,
Xbox, Xbox 360, Xbox One, Xbox Series X,
Game Boy, Game Boy Color, Game Boy Advance, Nintendo DS, Nintendo 3DS,
PSP, PS Vita, WonderSwan, Neo Geo Pocket, Dreamcast, Saturn, PC,
3DO, Atari Jaguar, Atari 2600, Atari 5200, Atari 7800, Neo Geo,
Sega Master System, Sega CD, Sega 32X, Game Gear,
Philips CD-i, Virtual Boy, Vectrex, Atari Lynx,
Commodore 64, Amiga, ZX Spectrum, MSX, PC-98

OUTPUT: Use recommend_games tool ONLY for game-related queries`;

/**
 * Instead of just getting a block of text from the AI, we define a strict JSON "shape"
 * that the AI's response must conform to.
 */
const TOOL_SCHEMA = {
  type: "function" as const,
  name: "recommend_games",
  description: "Interpret user intent and suggest candidate games",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      intent: {
        type: "object",
        additionalProperties: false,
        properties: {
          genre: {
            type: ["string", "null"],
            description: "Primary genre inferred from request",
          },
          platform: {
            type: ["string", "null"],
            description: "Platform from controlled vocabulary",
          },
          mood: {
            type: ["string", "null"],
            description: "Emotional descriptor (cozy, dark, fast-paced, etc.)",
          },
          year_from: {
            type: ["integer", "null"],
            description: "Lower bound of release year if specified",
          },
          year_to: {
            type: ["integer", "null"],
            description: "Upper bound of release year if specified",
          },
        },
        required: ["genre", "platform", "mood", "year_from", "year_to"],
      },
      candidates: {
        type: "array",
        description: "3 to 15 highly relevant candidate games",
        minItems: 3,
        maxItems: 15,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              type: "string",
              description: "Official release title",
            },
            confidence: {
              type: "number",
              description: "Model confidence from 0.0 to 1.0",
              minimum: 0,
              maximum: 1,
            },
          },
          required: ["name", "confidence"],
        },
      },
    },
    required: ["intent", "candidates"],
  },
};

export async function interpretQuery(userQuery: string) {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
    tools: [TOOL_SCHEMA],
  });

  const toolCall = response.output.find(
    (item) => item.type === "function_call" && item.name === "recommend_games",
  );

  if (!toolCall || toolCall.type !== "function_call") {
    throw new Error(
      "Please enter a game-related question. Try something like: 'cozy RPG games on Game Boy' or 'action games on PS5'",
    );
  }

  return JSON.parse(toolCall.arguments);
}

