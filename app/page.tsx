"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { profile } from "@/lib/profile";
import { ChatMessage as Msg, StoredChat } from "@/lib/types";
import { loadChats, saveChats, newChatId, titleFrom } from "@/lib/storage";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import ProjectCard from "@/components/ProjectCard";
import ResumeCard from "@/components/ResumeCard";
import PanelDrawer from "@/components/PanelDrawer";

type PanelState =
  | { kind: "none" }
  | { kind: "project"; projectId: string }
  | { kind: "resume" };

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<StoredChat[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [panel, setPanel] = useState<PanelState>({ kind: "none" });
  const [prefill, setPrefill] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => setChats(loadChats()));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const persist = useCallback((msgs: Msg[]) => {
    if (msgs.length === 0) return;
    setChats((prev) => {
      const id = prev[0]?.id ?? newChatId();
      const existing = prev.find((c) => c.id === id);
      const updated: StoredChat = {
        id,
        title: titleFrom(msgs),
        createdAt: existing?.createdAt ?? Date.now(),
        messages: msgs,
      };
      const next = [updated, ...prev.filter((c) => c.id !== id)].slice(0, 20);
      saveChats(next);
      return next;
    });
  }, []);

  async function send(text: string) {
    if (streaming) return;
    const userMsg: Msg = { id: Math.random().toString(36).slice(2), role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setStreaming(true);
    setPrefill("");

    const assistantId = Math.random().toString(36).slice(2);
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed." }));
        setMessages((m) =>
          m.map((x) => (x.id === assistantId ? { ...x, content: `⚠ ${err.error}` } : x))
        );
        return;
      }
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) =>
          m.map((x) => (x.id === assistantId ? { ...x, content: acc } : x))
        );
      }
      persist([...next, { id: assistantId, role: "assistant", content: acc }]);
    } catch (e: unknown) {
      if (!(e instanceof Error && e.name === "AbortError")) {
        setMessages((m) =>
          m.map((x) =>
            x.id === assistantId
              ? { ...x, content: "⚠ Connection error. Please try again." }
              : x
          )
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function newChat() {
    setMessages([]);
    setPrefill("");
    setSidebarOpen(false);
  }

  function openChat(id: string) {
    const c = chats.find((x) => x.id === id);
    if (c) setMessages(c.messages);
    setSidebarOpen(false);
  }

  const currentProject =
    panel.kind === "project"
      ? profile.projects.find((p) => p.id === panel.projectId)
      : undefined;

  const greeting = messages.length === 0;

  return (
    <div className="min-h-screen flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        onNewChat={newChat}
        onOpenChat={openChat}
        onOpenProject={(id) => setPanel({ kind: "project", projectId: id })}
        onOpenResume={() => setPanel({ kind: "resume" })}
        onShortcut={(q) => {
          setSidebarOpen(false);
          send(q);
        }}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border sm:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="text-sm font-semibold truncate">{profile.name}</div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4">
          {greeting ? (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center pb-32 sm:pb-40">
              <h1 className="text-2xl sm:text-3xl font-semibold text-center">
                Hi — ask me anything about {profile.name}
              </h1>
              <p className="mt-2 text-sm text-muted text-center max-w-md">
                I&apos;m his AI assistant. I answer only from his profile.
              </p>
              <div className="mt-8 w-full max-w-2xl">
                <ChatInput onSend={send} onStop={stop} streaming={streaming} centered />
              </div>
              <SuggestedQuestions questions={profile.suggestedQuestions} onPick={send} />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-6 space-y-6 pb-40">
              {messages.map((m) => {
                const projectMatch = m.content.match(/\[\[project:([^\]]+)\]\]/);
                const hasResume = m.content.includes("[[resume]]");
                const proj = projectMatch
                  ? profile.projects.find((p) => p.id === projectMatch[1])
                  : undefined;
                return (
                  <div key={m.id}>
                    <ChatMessage role={m.role} content={m.content} streaming={streaming && m === messages[messages.length - 1]} />
                    {m.role === "assistant" && proj && (
                      <ProjectCard
                        project={proj}
                        onOpen={() => setPanel({ kind: "project", projectId: proj.id })}
                        onAsk={() => send(`Tell me more about the ${proj.title} project.`)}
                      />
                    )}
                    {m.role === "assistant" && hasResume && (
                      <ResumeCard onOpen={() => setPanel({ kind: "resume" })} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!greeting && (
          <ChatInput onSend={send} onStop={stop} streaming={streaming} prefill={prefill} />
        )}
      </main>

      {panel.kind === "project" && currentProject && (
        <PanelDrawer
          kind="project"
          project={currentProject}
          onClose={() => setPanel({ kind: "none" })}
          onAsk={send}
        />
      )}
      {panel.kind === "resume" && (
        <PanelDrawer
          kind="resume"
          onClose={() => setPanel({ kind: "none" })}
          onAsk={send}
        />
      )}
    </div>
  );
}
