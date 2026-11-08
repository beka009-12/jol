import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/*
  Renders the small subset of markdown AI answers use (bold, lists, links,
  headings) as React elements, so model output can never inject HTML.
*/
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK_PARTS = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

function renderLink(label: string, href: string, key: number): ReactNode {
  const className = "underline underline-offset-4 hover:no-underline";
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link key={key} href={href} className={className}>
        {label}
      </Link>
    );
  }
  if (/^https?:\/\//.test(href)) {
    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    );
  }
  return label;
}

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(LINK_PARTS);
    if (link) return renderLink(link[1], link[2], index);
    return part;
  });
}

interface Block {
  type: "paragraph" | "heading" | "bullets" | "numbers";
  lines: string[];
}

function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const push = (type: Block["type"], line: string) => {
    const last = blocks[blocks.length - 1];
    if (last?.type === type && type !== "heading") last.lines.push(line);
    else blocks.push({ type, lines: [line] });
  };

  let previousBlank = true;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      previousBlank = true;
      continue;
    }
    const heading = line.match(/^#{1,4}\s+(.*)/);
    const bullet = line.match(/^[-*•]\s+(.*)/);
    const number = line.match(/^\d+[.)]\s+(.*)/);
    if (heading) push("heading", heading[1]);
    else if (bullet) push("bullets", bullet[1]);
    else if (number) push("numbers", number[1]);
    else if (previousBlank) blocks.push({ type: "paragraph", lines: [line] });
    else push("paragraph", line);
    previousBlank = false;
  }
  return blocks;
}

interface MessageTextProps {
  text: string;
}

export function MessageText({ text }: MessageTextProps) {
  return (
    <div className="space-y-3">
      {toBlocks(text).map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <p key={index} className="font-semibold">
                {renderInline(block.lines[0])}
              </p>
            );
          case "bullets":
            return (
              <ul key={index} className="list-disc space-y-1 pl-6">
                {block.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>{renderInline(line)}</li>
                ))}
              </ul>
            );
          case "numbers":
            return (
              <ol key={index} className="list-decimal space-y-1 pl-6">
                {block.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>{renderInline(line)}</li>
                ))}
              </ol>
            );
          default:
            return <p key={index}>{renderInline(block.lines.join(" "))}</p>;
        }
      })}
    </div>
  );
}
