export interface ChatRef {
  type: "tour" | "place";
  slug: string;
}

export interface ParsedMessage {
  text: string;
  refs: ChatRef[];
}

/*
  How the AI points at catalog items isn't specified by the API yet. Two forms
  are recognised: [[tour:slug]] / [[place:slug]] markers, removed from the text,
  and plain /tours/slug or /places/slug links, which stay in the text.
*/
const MARKER = /\[\[(tour|place):([a-z0-9-]+)\]\]/g;
const PARTIAL_MARKER = /\[\[[^\]]*\]?$/;
const LINK = /\/(tours|places)\/([a-z0-9-]+)/g;

export function parseMessage(content: string): ParsedMessage {
  const refs = new Map<string, ChatRef>();
  const add = (type: ChatRef["type"], slug: string) => {
    refs.set(`${type}:${slug}`, { type, slug });
  };

  for (const [, type, slug] of content.matchAll(MARKER)) {
    add(type as ChatRef["type"], slug);
  }
  for (const [, section, slug] of content.matchAll(LINK)) {
    add(section === "tours" ? "tour" : "place", slug);
  }

  const text = content
    .replace(MARKER, "")
    .replace(PARTIAL_MARKER, "")
    .trim();

  return { text, refs: [...refs.values()] };
}
