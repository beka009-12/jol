import assert from "node:assert/strict";
import { test } from "node:test";
import { createStreamDecoder, StreamError } from "./stream.ts";

function decode(contentType: string, chunks: string[]): string {
  const decoder = createStreamDecoder(contentType);
  return chunks.map((chunk) => decoder.push(chunk)).join("") + decoder.flush();
}

test("plain text passes through untouched", () => {
  assert.equal(
    decode("text/plain", ["Hello ", "world\n", "data: not sse"]),
    "Hello world\ndata: not sse",
  );
});

test("sse is detected from the content type", () => {
  assert.equal(
    decode("text/event-stream", ['data: {"delta":"Hi"}\n\n', "data: there\n\n"]),
    "Hithere",
  );
});

test("sse is sniffed when the content type is wrong", () => {
  assert.equal(
    decode("application/json", ['data: {"content":"Hi"}\n\n']),
    "Hi",
  );
});

test("sse lines split across chunks are reassembled", () => {
  assert.equal(
    decode("text/event-stream", ['data: {"del', 'ta":"Hello"}\n', "\n"]),
    "Hello",
  );
});

test("sse control lines and done markers add no text", () => {
  assert.equal(
    decode("text/event-stream", [
      "event: message\nid: 1\n: ping\n",
      'data: {"delta":"A"}\n\n',
      'data: {"type":"usage","tokens":5}\n\n',
      "data: [DONE]\n\n",
    ]),
    "A",
  );
});

test("ndjson lines are read", () => {
  assert.equal(
    decode("application/x-ndjson", ['{"text":"A"}\n{"te', 'xt":"B"}\n']),
    "AB",
  );
});

test("last line without a newline is flushed", () => {
  assert.equal(decode("text/event-stream", ['data: {"delta":"End"}']), "End");
});

test("an error event throws", () => {
  assert.throws(
    () =>
      decode("text/event-stream", [
        'data: {"error":{"message":"model overloaded"}}\n\n',
      ]),
    StreamError,
  );
});
