import OpenAI from "openai";

export const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
export const OPENAI_API_ENDPOINT = process.env["OPENAI_API_ENDPOINT"];
export const OPENAI_MODEL = process.env["OPENAI_MODEL"];
export const OPENAI_EMBEDDING_MODEL =
  process.env["OPENAI_EMBEDDING_MODEL"] || "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = parseInt(
  process.env["OPENAI_EMBEDDING_DIMENSIONS"] || "384",
  10,
);

export function isAiEnabled(): boolean {
  return Boolean(OPENAI_API_KEY && OPENAI_MODEL);
}

export function getOpenAIClient(): OpenAI {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!OPENAI_MODEL) {
    throw new Error("OPENAI_MODEL is not configured");
  }
  return new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: OPENAI_API_ENDPOINT || undefined,
    fetch: debugFetch,
  });
}

async function debugFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = input.toString();
  const response = await fetch(input, init);

  // Clone so we can read the body without consuming the original response.
  const clone = response.clone();
  let bodyText = "";
  try {
    bodyText = await clone.text();
  } catch {
    // ignore
  }

  console.error("[AI] HTTP response", {
    url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    bodyPreview: bodyText.slice(0, 2000),
  });

  // The Hack Club AI proxy returns embeddings as base64-encoded binary floats
  // with Content-Type: text/event-stream. Decode them back to float arrays so
  // the OpenAI SDK can parse the response normally.
  if (url.endsWith("/embeddings")) {
    const decoded = tryDecodeBase64Embeddings(bodyText);
    if (decoded) {
      const headers = new Headers(response.headers);
      headers.set("content-type", "application/json");
      return new Response(decoded, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  }

  return response;
}

function tryDecodeBase64Embeddings(bodyText: string): string | null {
  try {
    const parsed = JSON.parse(bodyText) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("data" in parsed) ||
      !Array.isArray((parsed as { data?: unknown }).data)
    ) {
      return null;
    }

    let mutated = false;
    for (const item of (parsed as { data: Array<unknown> }).data) {
      if (
        typeof item === "object" &&
        item !== null &&
        "embedding" in item &&
        typeof (item as { embedding: unknown }).embedding === "string"
      ) {
        const base64 = (item as { embedding: string }).embedding;
        (item as { embedding: number[] }).embedding = Array.from(
          base64ToFloat32Array(base64),
        );
        mutated = true;
      }
    }

    return mutated ? JSON.stringify(parsed) : null;
  } catch {
    return null;
  }
}

function base64ToFloat32Array(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}
