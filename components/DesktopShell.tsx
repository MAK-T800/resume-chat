"use client";

import { useEffect, useState, type ReactNode } from "react";
import { profile } from "@/lib/profile";
import IlluminateLogo from "./IlluminateLogo";
import ThemeToggle from "./ThemeToggle";

export type DesktopWindow =
  | { kind: "chatbot" }
  | { kind: "project"; projectId: string }
  | { kind: "resume" }
  | null;

type Props = {
  activeWindow: DesktopWindow;
  onOpenChat: () => void;
  onOpenProject: (projectId: string) => void;
  onOpenResume: () => void;
  onClose: () => void;
  children: ReactNode;
};

type IconKind = "chatbot" | "illuminate" | "project" | "resume";

export default function DesktopShell({
  activeWindow,
  onOpenChat,
  onOpenProject,
  onOpenResume,
  onClose,
  children,
}: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const projects = profile.projects.slice(0, 2);
  const currentProject =
    activeWindow?.kind === "project"
      ? profile.projects.find((project) => project.id === activeWindow.projectId)
      : undefined;

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const intervalId = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const title =
    activeWindow?.kind === "chatbot"
      ? `Portfolio Chatbot — ${profile.name}`
      : activeWindow?.kind === "project"
        ? currentProject?.title ?? "Project"
        : activeWindow?.kind === "resume"
          ? `${profile.name} — Resume.pdf`
          : "";

  const pinnedApps: {
    key: string;
    label: string;
    kind: IconKind;
    active: boolean;
    onClick: () => void;
  }[] = [
    {
      key: "chatbot",
      label: "Portfolio Chatbot",
      kind: "chatbot" as const,
      active: activeWindow?.kind === "chatbot",
      onClick: onOpenChat,
    },
    ...projects.map((project) => ({
      key: project.id,
      label: project.title,
      kind: project.id === "illuminate" ? "illuminate" as const : "project" as const,
      active:
        activeWindow?.kind === "project" && activeWindow.projectId === project.id,
      onClick: () => onOpenProject(project.id),
    })),
    {
      key: "resume",
      label: "Resume.pdf",
      kind: "resume" as const,
      active: activeWindow?.kind === "resume",
      onClick: onOpenResume,
    },
  ];

  return (
    <div className="desktop">
      <main className="workspace">
        <nav className="desktopIcons" aria-label="Desktop applications">
          <DesktopIcon label="Portfolio Chatbot" kind="chatbot" onClick={onOpenChat} />
          {projects.map((project) => (
            <DesktopIcon
              key={project.id}
              label={project.title}
                kind={project.id === "illuminate" ? "illuminate" : "project"}
              onClick={() => onOpenProject(project.id)}
            />
          ))}
          <DesktopIcon label="Resume.pdf" kind="resume" onClick={onOpenResume} />
        </nav>
      </main>

      {activeWindow && (
        <section className="window" aria-label={title}>
          <header className="titlebar">
            <div className="windowTitle">
              <span
                className={`titleGlyph ${
                  activeWindow.kind === "project" && currentProject?.id === "illuminate"
                    ? "illuminateTitleGlyph"
                    : `${activeWindow.kind}TitleGlyph`
                }`}
                aria-hidden="true"
              >
                {activeWindow.kind === "chatbot" ? (
                  "✦"
                ) : activeWindow.kind === "resume" ? (
                  "PDF"
                ) : currentProject?.id === "illuminate" ? (
                  <IlluminateLogo className="illuminateGlyph" />
                ) : (
                  "</>"
                )}
              </span>
              <span className="windowTitleText">{title}</span>
            </div>
            <div className="windowControls">
              <button type="button" onClick={onClose} aria-label="Minimize window" title="Minimize">
                <span aria-hidden="true">−</span>
              </button>
              <button type="button" onClick={onClose} aria-label="Close window" title="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </header>
          <div className="windowContent">{children}</div>
        </section>
      )}

      <footer className="taskbar">
        <div className="taskbarSpacer" aria-hidden="true" />

        <nav className="taskbarApps" aria-label="Taskbar applications">
          <span className="taskbarButton taskbarStartIcon" title="Start" aria-hidden="true">
            <WindowGlyph />
          </span>
          <button
            type="button"
            className="taskbarButton"
            onClick={onOpenChat}
            aria-label="Search portfolio"
            title="Search"
          >
            <span className="searchGlyph" aria-hidden="true">⌕</span>
          </button>
          {pinnedApps.map((app) => (
            <button
              key={app.key}
              type="button"
              className={`taskbarButton ${app.active ? "taskbarButtonActive" : ""}`}
              onClick={app.onClick}
              aria-label={app.label}
              aria-pressed={app.active}
              title={app.label}
            >
              <AppGlyph kind={app.kind} />
            </button>
          ))}
        </nav>

        <div className="systemTray">
          <div className="systemTrayIcons" aria-hidden="true">
            <WifiGlyph />
            <SpeakerGlyph />
            <BatteryGlyph />
          </div>
          <ThemeToggle />
          <span className="clock">
            <span>{now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--:--"}</span>
            <span>{now ? now.toLocaleDateString() : "--/--/----"}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function DesktopIcon({
  label,
  kind,
  onClick,
}: {
  label: string;
  kind: IconKind;
  onClick: () => void;
}) {
  return (
    <button type="button" className="desktopIcon" onClick={onClick}>
      <span className={`desktopIconTile ${kind}Tile`}>
        <AppGlyph kind={kind} />
      </span>
      <span className="desktopIconLabel">{label}</span>
    </button>
  );
}

function AppGlyph({ kind }: { kind: IconKind }) {
  if (kind === "chatbot") {
    return <span className="chatGlyph" aria-hidden="true">✦</span>;
  }
  if (kind === "illuminate") {
    return <IlluminateLogo className="illuminateGlyph" />;
  }
  if (kind === "project") {
    return <span className="projectGlyph" aria-hidden="true">&lt;/&gt;</span>;
  }
  return <span className="resumeGlyph" aria-hidden="true">PDF</span>;
}

function WifiGlyph() {
  return (
    <svg className="trayIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M2.5 8.5a15 15 0 0 1 19 0" />
      <path d="M5.5 12a10 10 0 0 1 13 0" />
      <path d="M8.8 15.5a5 5 0 0 1 6.4 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SpeakerGlyph() {
  return (
    <svg className="trayIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9v6h4l5 4V5L7 9H3Z" />
      <path d="M16 9a5 5 0 0 1 0 6" />
      <path d="M18.5 6.5a8.5 8.5 0 0 1 0 11" />
    </svg>
  );
}

function BatteryGlyph() {
  return (
    <svg className="trayIcon batteryIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6.5" width="18" height="11" rx="2" />
      <path d="M22 10v4" />
      <rect x="4.5" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WindowGlyph() {
  return (
    <svg className="windowGlyph" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="1" />
      <rect x="13" y="2" width="9" height="9" rx="1" />
      <rect x="2" y="13" width="9" height="9" rx="1" />
      <rect x="13" y="13" width="9" height="9" rx="1" />
    </svg>
  );
}
