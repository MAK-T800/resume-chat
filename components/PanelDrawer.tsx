"use client";
import { useEffect } from "react";
import { profile } from "@/lib/profile";
import type { Project } from "@/lib/types";

type Props =
  | { kind: "project"; project: Project; onClose: () => void; onAsk: (q: string) => void }
  | { kind: "resume"; onClose: () => void; onAsk: (q: string) => void };

export default function PanelDrawer(props: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && props.onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={props.onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-panel border-l border-border p-6 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {props.kind === "project" ? "Project" : "Resume"}
          </h2>
          <button onClick={props.onClose} aria-label="Close" className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        {props.kind === "project" ? (
          <div className="space-y-4">
            {props.project.screenshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={props.project.screenshot} alt="" className="w-full rounded-lg border border-border" />
            )}
            <h3 className="text-xl font-semibold">{props.project.title}</h3>
            <p className="text-sm text-muted">{props.project.summary}</p>
            {props.project.tools.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {props.project.tools.map((t) => (
                  <span key={t} className="rounded-md bg-border/40 px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 text-sm">
              {props.project.link && (
                <a href={props.project.link} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
                  Live ↗
                </a>
              )}
              {props.project.repo && (
                <a href={props.project.repo} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
                  Repo ↗
                </a>
              )}
            </div>
            <button
              onClick={() => {
                props.onAsk(`Tell me more about the ${props.project.title} project.`);
                props.onClose();
              }}
              className="w-full rounded-lg bg-accent/20 border border-accent/30 px-3 py-2 text-sm text-accent hover:bg-accent/30"
            >
              Ask about this project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-muted">
              Last updated: {profile.resume.updatedAt}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href={profile.resume.path} download className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
                Download PDF
              </a>
              <a href={profile.resume.path} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
                Open in new tab ↗
              </a>
            </div>
            <iframe
              src={profile.resume.path}
              title="Resume preview"
              className="w-full h-[70vh] rounded-lg border border-border bg-bg"
            />
          </div>
        )}
      </aside>
    </div>
  );
}
