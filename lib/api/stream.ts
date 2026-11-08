/*
  The backend's OpenAPI doesn't describe the stream body, so the decoder accepts
  plain text, SSE and NDJSON, detected from the content type or the first bytes.
*/

type StreamFormat = "text" | "sse" | "ndjson";

interface StreamPayload {
  error?: unknown;
  content?: unknown;
  delta?: unknown;
  text?: unknown;
  token?: unknown;
}

export class StreamError extends Error {}

function detectFormat(contentType: string, firstChunk: string): StreamFormat {
  if (contentType.includes("event-stream")) return "sse";
  if (contentType.includes("ndjson")) return "ndjson";
  return /^(data|event|id|retry):|^:/.test(firstChunk.trimStart())
    ? "sse"
    : "text";
}

function textFromPayload(raw: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw;
  }
  if (typeof parsed === "string") return parsed;
  if (typeof parsed !== "object" || parsed === null) return "";

  const payload = parsed as StreamPayload;
  if (payload.error) {
    const error = payload.error as { message?: unknown };
    throw new StreamError(
      typeof error.message === "string" ? error.message : "Stream failed",
    );
  }
  for (const value of [
    payload.delta,
    payload.content,
    payload.text,
    payload.token,
  ]) {
    if (typeof value === "string") return value;
  }
  return "";
}

export interface StreamDecoder {
  /** Returns the text carried by this chunk. */
  push(chunk: string): string;
  /** Returns text still buffered at the end of the stream. */
  flush(): string;
}

export function createStreamDecoder(contentType: string): StreamDecoder {
  let format: StreamFormat | null = null;
  let buffer = "";

  const readLine = (line: string, activeFormat: StreamFormat): string => {
    if (activeFormat === "ndjson") {
      return line.trim() ? textFromPayload(line) : "";
    }
    if (!line.startsWith("data:")) return "";
    const data = line.slice(5).replace(/^ /, "");
    if (data.trim() === "[DONE]") return "";
    return textFromPayload(data);
  };

  return {
    push(chunk) {
      format ??= detectFormat(contentType, chunk);
      if (format === "text") return chunk;

      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      let output = "";
      for (const line of lines) output += readLine(line, format);
      return output;
    },
    flush() {
      if (!format || format === "text" || !buffer) return "";
      const rest = readLine(buffer, format);
      buffer = "";
      return rest;
    },
  };
}
