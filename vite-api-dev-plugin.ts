import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin, ViteDevServer } from "vite";

type VercelLikeRequest = IncomingMessage & {
  query: Record<string, string | string[]>;
  body?: unknown;
  headers: IncomingMessage["headers"];
};

type VercelLikeResponse = ServerResponse & {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
};

function parseQuery(url: string) {
  const query: Record<string, string | string[]> = {};
  const searchParams = new URL(url, "http://localhost").searchParams;

  for (const [key, value] of searchParams.entries()) {
    const existing = query[key];
    if (existing === undefined) {
      query[key] = value;
      continue;
    }
    query[key] = Array.isArray(existing)
      ? [...existing, value]
      : [existing, value];
  }

  return query;
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return undefined;
  return JSON.parse(raw) as unknown;
}

function createVercelResponse(res: ServerResponse): VercelLikeResponse {
  let statusCode = 200;

  const vercelRes = res as VercelLikeResponse;
  vercelRes.status = (code: number) => {
    statusCode = code;
    return vercelRes;
  };
  vercelRes.json = (body: unknown) => {
    if (!res.headersSent) {
      res.statusCode = statusCode;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
    }
  };

  return vercelRes;
}

async function handleApiRequest(
  server: ViteDevServer,
  req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) {
  const url = req.url ?? "";
  if (!url.startsWith("/api/")) {
    next();
    return;
  }

  const pathname = url.split("?")[0] ?? "";
  const routeName = pathname.replace(/^\/api\//, "");
  if (!routeName || routeName.includes("/")) {
    next();
    return;
  }

  try {
    const module = await server.ssrLoadModule(`/api/${routeName}.ts`);
    const handler = module.default as
      | ((req: VercelLikeRequest, res: VercelLikeResponse) => Promise<void> | void)
      | undefined;

    if (!handler) {
      next();
      return;
    }

    const vercelReq = req as VercelLikeRequest;
    vercelReq.query = parseQuery(url);
    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      vercelReq.body = await readJsonBody(req);
    }

    await handler(vercelReq, createVercelResponse(res));
  } catch (error) {
    console.error(`[vite-api-dev] ${routeName} failed`, error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "API handler failed",
        }),
      );
    }
  }
}

// Run Vercel API handlers during `npm run dev`
export function vercelApiDevPlugin(): Plugin {
  return {
    name: "vercel-api-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleApiRequest(server, req, res, next);
      });
    },
  };
}
