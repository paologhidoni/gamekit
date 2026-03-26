import { http, HttpResponse } from "msw";
import aiSearchSuccess from "@tests/fixtures/ai-search-success.json";
import askAiSuccess from "@tests/fixtures/ask-ai-success.json";
import rateLimitSuccess from "@tests/fixtures/rate-limit-success.json";

export const handlers = [
  http.get("/api/rate-limit", () => HttpResponse.json(rateLimitSuccess)),
  http.get("/api/ai-search", () => HttpResponse.json(aiSearchSuccess)),
  http.post("/api/ask-ai", () => HttpResponse.json(askAiSuccess)),
];
