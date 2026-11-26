"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import TypingDots from "./TypingDots";

export default function ChatMessage({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const clean = content.replace(/\[\[project:[^\]]+\]\]/g, "").replace(/\[\[resume\]\]/g, "").trim();

  function copy() {
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent/15 border border-accent/20 px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-accent/20 border border-accent/30 grid place-items-center text-xs font-semibold text-accent">
        AI
      </div>
      <div className="min-w-0 flex-1">
        <div className="prose-chat text-[15px] leading-relaxed">
          {streaming && !clean ? (
            <TypingDots />
          ) : (
            <ReactMarkdown>{clean}</ReactMarkdown>
          )}
        </div>
        {clean && !streaming && (
          <button
            onClick={copy}
            className="mt-2 text-xs text-muted hover:text-ink"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
