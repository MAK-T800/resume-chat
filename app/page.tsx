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
import DesktopShell, { type DesktopWindow } from "@/components/DesktopShell";
import IlluminateLogo from "@/components/IlluminateLogo";
import "./desktop.css";

function withoutFailedTurns(messages: Msg[]): Msg[] {
  const failedIndices = new Set<number>();
  messages.forEach((message, index) => {
    if (message.role === "assistant" && message.content.startsWith("⚠")) {
      failedIndices.add(index);
      if (index > 0 && messages[index - 1].role === "user") {
        failedIndices.add(index - 1);
      }
    }
  });
  return messages.filter((_, index) => !failedIndices.has(index));
}

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<StoredChat[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [activeWindow, setActiveWindow] = useState<DesktopWindow>(null);
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
    const next = [...withoutFailedTurns(messages), userMsg];
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
      const message =
        e instanceof Error && e.name === "AbortError"
          ? "⚠ Response stopped before completion."
          : "⚠ Connection error. Please try again.";
      setMessages((m) =>
        m.map((x) => (x.id === assistantId ? { ...x, content: message } : x))
      );
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
    setActiveWindow({ kind: "chatbot" });
  }

  function openChat(id: string) {
    const c = chats.find((x) => x.id === id);
    if (c) setMessages(c.messages);
    setSidebarOpen(false);
    setActiveWindow({ kind: "chatbot" });
  }

  const currentProject =
    activeWindow?.kind === "project"
      ? profile.projects.find((p) => p.id === activeWindow.projectId)
      : undefined;

  const greeting = messages.length === 0;

  return (
    <DesktopShell
      activeWindow={activeWindow}
      onOpenChat={() => setActiveWindow({ kind: "chatbot" })}
      onOpenProject={(projectId) => setActiveWindow({ kind: "project", projectId })}
      onOpenResume={() => setActiveWindow({ kind: "resume" })}
      onClose={() => setActiveWindow(null)}
    >
      {activeWindow?.kind === "chatbot" && (
        <div className="chatLayout">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            chats={chats}
            onNewChat={newChat}
            onOpenChat={openChat}
          />

          <main className="chatMain">
            <header className="chatMobileHeader">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open chat menu"
              >
                ☰
              </button>
              <span>{profile.name}</span>
            </header>

            <div ref={scrollRef} className="chatScroll">
              {greeting ? (
                <div className="greeting">
                  <h1 className="greetingTitle">
                    Hello — ask about {profile.name}
                  </h1>
                  <p className="greetingCopy">
                    I&apos;m his AI assistant. I answer questions using the information in his profile.
                  </p>
                  <ChatInput onSend={send} onStop={stop} streaming={streaming} centered />
                  <SuggestedQuestions questions={profile.suggestedQuestions} onPick={send} />
                </div>
              ) : (
                <div className="messageList">
                  {messages.map((message, index) => {
                    const projectMatch = message.content.match(/\[\[project:([^\]]+)\]\]/);
                    const hasResume = message.content.includes("[[resume]]");
                    const project = projectMatch
                      ? profile.projects.find((item) => item.id === projectMatch[1])
                      : undefined;

                    return (
                      <div key={message.id}>
                        <ChatMessage
                          role={message.role}
                          content={message.content}
                          streaming={streaming && index === messages.length - 1}
                        />
                        {message.role === "assistant" && project && (
                          <ProjectCard
                            project={project}
                            onOpen={() => setActiveWindow({ kind: "project", projectId: project.id })}
                            onAsk={() => send(`Tell me more about the ${project.title} project.`)}
                          />
                        )}
                        {message.role === "assistant" && hasResume && (
                          <ResumeCard onOpen={() => setActiveWindow({ kind: "resume" })} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!greeting && (
              <ChatInput
                onSend={send}
                onStop={stop}
                streaming={streaming}
                prefill={prefill}
                embedded
              />
            )}
          </main>
        </div>
      )}

      {activeWindow?.kind === "project" && currentProject && (
        <div className="projectContent">
          <p className="projectEyebrow">Portfolio project</p>
          <div className="projectIdentity">
            {currentProject.id === "illuminate" && (
              <span className="illuminateLogoFrame">
                <IlluminateLogo className="illuminateGlyph" />
              </span>
            )}
            <h1 className="projectTitle">{currentProject.title}</h1>
          </div>
          <p className="projectSummary">{currentProject.summary}</p>
          {currentProject.tools.length > 0 && (
            <div className="projectTools" aria-label="Technologies">
              {currentProject.tools.map((tool) => (
                <span key={tool} className="projectTool">{tool}</span>
              ))}
            </div>
          )}
          <div className="projectLinks">
            {currentProject.link && (
              <a className="projectLink" href={currentProject.link} target="_blank" rel="noopener noreferrer">
                Open project ↗
              </a>
            )}
            {currentProject.repo && (
              <a className="projectLink" href={currentProject.repo} target="_blank" rel="noopener noreferrer">
                View source ↗
              </a>
            )}
          </div>
          <button
            type="button"
            className="projectAsk"
            disabled={streaming}
            onClick={() => {
              setActiveWindow({ kind: "chatbot" });
              send(`Tell me about the ${currentProject.title} project.`);
            }}
          >
            Ask the chatbot about this project
          </button>
        </div>
      )}

      {activeWindow?.kind === "resume" && (
        <div className="resumeContent">
          <div className="resumeHeading">
            <h1 className="resumeTitle">{profile.name} — Resume.pdf</h1>
            <p className="resumeUpdated">Updated {profile.resume.updatedAt}</p>
          </div>
          <div className="resumeActions">
            <a className="projectLink" href={profile.resume.path} download>
              Download PDF
            </a>
            <a className="projectLink" href={profile.resume.path} target="_blank" rel="noopener noreferrer">
              Open in new tab ↗
            </a>
          </div>
          <iframe
            className="pdfViewer"
            src={profile.resume.path}
            title={`${profile.name} resume PDF`}
          />
        </div>
      )}
    </DesktopShell>
  );
}
