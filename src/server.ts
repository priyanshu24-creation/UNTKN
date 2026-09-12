import "./lib/error-capture";

import { createServer } from "node:http";
import { Readable } from "node:stream";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const server = {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

export default server;

const nodeServer = createServer(async (request, response) => {
  try {
    const method = request.method ?? "GET";
    const body = method === "GET" || method === "HEAD" ? undefined : (Readable.toWeb(request) as ReadableStream);
    const fetchRequest = new Request(`http://${request.headers.host ?? "localhost"}${request.url ?? "/"}`, {
      method,
      headers: request.headers as HeadersInit,
      body,
      duplex: "half",
    } as RequestInit);
    const fetchResponse = await server.fetch(fetchRequest, undefined, undefined);

    response.statusCode = fetchResponse.status;
    fetchResponse.headers.forEach((value, key) => response.setHeader(key, value));
    if (fetchResponse.body) {
      Readable.fromWeb(fetchResponse.body as ReadableStream).pipe(response);
    } else {
      response.end();
    }
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(renderErrorPage());
  }
});

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
nodeServer.listen(port, "0.0.0.0");
