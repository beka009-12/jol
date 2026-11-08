import { getMessages } from "next-intl/server";
import type { Messages } from "next-intl";

/*
  Translations sent to the browser are inlined into every page's HTML. Each
  page passes only what its client components read; this keeps Home ~100 KB
  lighter than handing over the whole app's strings.
*/
export const BASE_NAMESPACES = ["Common", "Nav", "Errors"] as const;

export async function clientMessages(
  ...namespaces: (keyof Messages)[]
): Promise<Partial<Messages>> {
  const messages = await getMessages();
  const picked: Partial<Record<keyof Messages, unknown>> = {};
  for (const namespace of [...BASE_NAMESPACES, ...namespaces]) {
    picked[namespace] = messages[namespace];
  }
  return picked as Partial<Messages>;
}
