"use client";
import { useState, KeyboardEvent } from "react";

export default function ChatInput({
  onSend,
  onStop,
  streaming,
  centered,
  prefill,
  embedded,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  centered?: boolean;
  prefill?: string;
  embedded?: boolean;
}) {
  const [val, setVal] = useState(prefill ?? "");

  function send() {
    const t = val.trim();
    if (!t || streaming) return;
    onSend(t);
    setVal("");
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      className={
        "w-full max-w-2xl mx-auto " +
        (centered
          ? ""
          : embedded
            ? "px-4 py-4 border-t border-border bg-panel"
            : "fixed left-0 right-0 bottom-0 px-4 pb-4 bg-gradient-to-t from-bg via-bg to-transparent pt-6")
      }
    >
      <div className="relative rounded-2xl border border-border bg-panel shadow-sm">
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask about Mohammad's experience, skills or projects…"
          rows={centered ? 2 : 1}
          maxLength={1500}
          className="w-full resize-none bg-transparent px-4 py-3 pr-24 text-[15px] outline-none placeholder:text-muted"
        />
        <div className="absolute right-2 bottom-2 flex gap-1">
          {streaming ? (
            <button
              onClick={onStop}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-border/40"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!val.trim()}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              Send ↵
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] text-muted">
        AI assistant · answers only from Mohammad&apos;s profile · AI can make mistakes
      </div>
    </div>
  );
}
