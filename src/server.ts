import "./lib/error-capture";

import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { resolve, sep } from "node:path";

try {
  process.loadEnvFile?.();
} catch {
  try {
    process.loadEnvFile?.(fileURLToPath(new URL("../../.env", import.meta.url)));
  } catch {
    // Environment variables might already be present in process.env
  }
}

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

const clientRoot = resolve(fileURLToPath(new URL("../client/", import.meta.url)));
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function serveClientFile(pathname: string, method: string): Promise<Response | undefined> {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const filePath = resolve(clientRoot, `.${decodedPath}`);
  if (filePath !== clientRoot && !filePath.startsWith(`${clientRoot}${sep}`)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) return undefined;
    const body = method === "HEAD" ? undefined : await readFile(filePath);
    const extension = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
    return new Response(body, {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": contentTypes[extension] ?? "application/octet-stream",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

const nodeServer = createServer(async (request, response) => {
  try {
    const method = request.method ?? "GET";
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const clientFile = await serveClientFile(pathname, method);
    if (clientFile) {
      response.statusCode = clientFile.status;
      clientFile.headers.forEach((value, key) => response.setHeader(key, value));
      if (clientFile.body) {
        Readable.fromWeb(clientFile.body as ReadableStream).pipe(response);
      } else {
        response.end();
      }
      return;
    }
    if (pathname.startsWith("/assets/")) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }
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
