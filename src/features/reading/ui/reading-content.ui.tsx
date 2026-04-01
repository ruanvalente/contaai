"use client";

import { cn } from "@/utils/cn";
import { ReadingMode } from "@/features/reading/types/reading.types";

type ReadingContentProps = {
  content: string;
  fontSize: number;
  readingMode: ReadingMode;
  className?: string;
};

export function ReadingContent({
  content,
  fontSize,
  readingMode,
  className,
}: ReadingContentProps) {
  const isNightMode = readingMode === "night";

  return (
    <div
      className={cn(
        "reading-content mx-auto max-w-170 px-4 sm:px-6 py-8 sm:py-12 rounded-xl",
        isNightMode ? "reading-mode-night" : "bg-white",
        className,
      )}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: 1.7,
      }}
    >
      <div className="prose prose-lg max-w-none font-serif">
        <div
          className="lexical-content"
          dangerouslySetInnerHTML={{
            __html: renderLexicalContent(content, isNightMode),
          }}
        />
      </div>
    </div>
  );
}

function renderLexicalContent(content: string, isNightMode: boolean): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed && parsed.root) {
      return renderLexicalNode(parsed.root, isNightMode);
    }
    return renderParagraph(content, isNightMode);
  } catch {
    return renderParagraph(content, isNightMode);
  }
}

function renderParagraph(text: string, isNightMode: boolean): string {
  const textColor = isNightMode ? "#3d3429" : "#1a1a1a";
  return `<p style="margin-bottom: 1.5rem; line-height: 1.7; color: ${textColor}">${escapeHtml(text)}</p>`;
}

function renderLexicalNode(
  node: Record<string, unknown>,
  isNightMode: boolean,
): string {
  if (!node) return "";

  const type = node.type as string;
  const textColor = isNightMode ? "#3d3429" : "#1a1a1a";

  switch (type) {
    case "root":
    case "paragraph": {
      const children = (node.children as Array<Record<string, unknown>>) || [];
      const innerHtml = children
        .map((c) => renderLexicalNode(c, isNightMode))
        .join("");
      return `<p style="margin-bottom: 1.5rem; line-height: 1.7; color: ${textColor}">${innerHtml || "&nbsp;"}</p>`;
    }

    case "heading": {
      const tag = (node.tag as string) || "h2";
      const level = parseInt(tag.replace("h", ""), 10);
      const children = (node.children as Array<Record<string, unknown>>) || [];
      const innerHtml = children
        .map((c) => renderLexicalNode(c, isNightMode))
        .join("");
      const marginTop = level === 1 ? "3rem" : level === 2 ? "2rem" : "1.5rem";
      const fontSize =
        level === 1 ? "2rem" : level === 2 ? "1.5rem" : "1.25rem";
      return `<${tag} style="margin-top: ${marginTop}; margin-bottom: 1rem; font-family: 'Playfair Display', serif; font-size: ${fontSize}; color: ${textColor}">${innerHtml}</${tag}>`;
    }

    case "text": {
      let text = escapeHtml((node.text as string) || "");

      if (node.format) {
        const format = node.format as number;
        if (format & 1) text = `<strong>${text}</strong>`;
        if (format & 2) text = `<em>${text}</em>`;
        if (format & 4)
          text = `<span style="text-decoration: underline">${text}</span>`;
        if (format & 8) text = `<del>${text}</del>`;
        if (format & 16)
          text = `<code style="background-color: ${isNightMode ? "#4a4a4a" : "#f3f4f6"}; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;">${text}</code>`;
      }

      return text;
    }

    case "list": {
      const tag = node.listType === "number" ? "ol" : "ul";
      const children = (node.children as Array<Record<string, unknown>>) || [];
      const innerHtml = children
        .map((c) => renderLexicalNode(c, isNightMode))
        .join("");
      return `<${tag} style="margin-left: 1.5rem; margin-bottom: 1.5rem; color: ${textColor}">${innerHtml}</${tag}>`;
    }

    case "listitem": {
      const children = (node.children as Array<Record<string, unknown>>) || [];
      const innerHtml = children
        .map((c) => renderLexicalNode(c, isNightMode))
        .join("");
      return `<li style="margin-bottom: 0.5rem; color: ${textColor}">${innerHtml}</li>`;
    }

    case "quote": {
      const children = (node.children as Array<Record<string, unknown>>) || [];
      const innerHtml = children
        .map((c) => renderLexicalNode(c, isNightMode))
        .join("");
      const bgColor = isNightMode ? "#e8d5c4" : "#f5f3ef";
      return `<blockquote style="border-left: 4px solid #c2a47e; padding-left: 1.5rem; font-style: italic; margin: 2rem 0; color: ${textColor}; background-color: ${bgColor}; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0;">${innerHtml}</blockquote>`;
    }

    case "code": {
      const children = (node.children as Array<Record<string, unknown>>) || [];
      const innerHtml = children
        .map((c) => renderLexicalNode(c, isNightMode))
        .join("");
      return `<pre style="background-color: #1a1a1a; color: #f5f5f5; padding: 1.5rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; font-family: monospace;"><code>${innerHtml}</code></pre>`;
    }

    default:
      return "";
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
