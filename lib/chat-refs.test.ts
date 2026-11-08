import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMessage } from "./chat-refs.ts";

test("markers become refs and leave the text", () => {
  const { text, refs } = parseMessage(
    "Go to Karakol.\n\n[[tour:karakol-ski-week]] [[place:song-kol]]",
  );
  assert.equal(text, "Go to Karakol.");
  assert.deepEqual(refs, [
    { type: "tour", slug: "karakol-ski-week" },
    { type: "place", slug: "song-kol" },
  ]);
});

test("links stay in the text and also produce a ref", () => {
  const { text, refs } = parseMessage("See [this](/tours/osh-two-days).");
  assert.equal(text, "See [this](/tours/osh-two-days).");
  assert.deepEqual(refs, [{ type: "tour", slug: "osh-two-days" }]);
});

test("duplicate refs collapse", () => {
  const { refs } = parseMessage("[[tour:a]] /tours/a [[tour:a]]");
  assert.equal(refs.length, 1);
});

test("a marker cut off mid-stream is hidden until it completes", () => {
  assert.equal(parseMessage("Go there [[tou").text, "Go there");
  assert.equal(parseMessage("Go there [[tour:abc]").text, "Go there");
});
