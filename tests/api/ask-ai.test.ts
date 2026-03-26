// @vitest-environment node
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  responsesCreate: vi.fn(),
  checkRateLimit: vi.fn(),
  getRemainingRequests: vi.fn(),
  getClientIpForRateLimit: vi.fn(),
}));

vi.mock("dotenv", () => ({
  config: mocks.config,
}));

vi.mock("openai", () => ({
  default: vi.fn(function MockOpenAI() {
    return {
      responses: {
        create: mocks.responsesCreate,
      },
    };
  }),
}));

vi.mock("../../src/server/utils/rateLimiter.js", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRemainingRequests: mocks.getRemainingRequests,
}));

vi.mock("../../src/server/utils/clientIp.js", () => ({
  getClientIpForRateLimit: mocks.getClientIpForRateLimit,
}));

type MockJson = Record<string, unknown>;

function createMockRes() {
  const state: { statusCode?: number; body?: MockJson } = {};
  const res = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(body: MockJson) {
      state.body = body;
      return this;
    },
  } as unknown as VercelResponse;

  return { res, state };
}

describe("/api/ask-ai", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getClientIpForRateLimit.mockReturnValue("127.0.0.1");
    mocks.getRemainingRequests.mockResolvedValue(5);
  });

  it("rejects unsupported methods", async () => {
    const { default: handler } = await import("../../api/ask-ai.ts");
    const { res, state } = createMockRes();
    const req = {
      method: "GET",
      headers: {},
    } as VercelRequest;

    await handler(req, res);

    expect(state.statusCode).toBe(405);
    expect(state.body).toEqual({ error: "Method Not Allowed" });
  });

  it("returns 400 when the request body is invalid", async () => {
    mocks.checkRateLimit.mockResolvedValue({
      success: true,
      remaining: 5,
      reset: new Date("2026-01-01T00:00:00.000Z"),
    });

    const { default: handler } = await import("../../api/ask-ai.ts");
    const { res, state } = createMockRes();
    const req = {
      method: "POST",
      headers: { "x-forwarded-for": "127.0.0.1" },
      body: { gameName: "Golden Sun", question: "   " },
    } as unknown as VercelRequest;

    await handler(req, res);

    expect(state.statusCode).toBe(400);
    expect(state.body).toEqual({ error: "Invalid request body" });
  });

  it("returns the mocked AI answer on a valid request", async () => {
    mocks.checkRateLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: new Date("2026-01-01T00:00:00.000Z"),
    });
    mocks.responsesCreate.mockResolvedValue({
      output_text: "Golden Sun is known for its puzzle dungeons.",
      id: "resp_test_123",
    });

    const { default: handler } = await import("../../api/ask-ai.ts");
    const { res, state } = createMockRes();
    const req = {
      method: "POST",
      headers: { "x-forwarded-for": "127.0.0.1" },
      body: {
        gameName: "Golden Sun",
        question: "What makes it special?",
      },
    } as unknown as VercelRequest;

    await handler(req, res);

    expect(mocks.responsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini",
        max_output_tokens: 512,
        store: true,
      }),
    );
    expect(state.statusCode).toBe(200);
    expect(state.body).toEqual({
      answer: "Golden Sun is known for its puzzle dungeons.",
      remaining: 4,
      id: "resp_test_123",
    });
  });
});
