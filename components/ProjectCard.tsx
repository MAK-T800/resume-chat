"use client";
import type { Project } from "@/lib/types";
import IlluminateLogo from "./IlluminateLogo";

export default function ProjectCard({
  project,
  onAsk,
  onOpen,
}: {
  project: Project;
  onAsk: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-panel p-4">
      <div className="flex items-start gap-3">
        {project.id === "illuminate" && (
          <span className="illuminateCardMark">
            <IlluminateLogo className="illuminateGlyph" />
          </span>
        )}
        <div>
          <div className="text-sm font-semibold">{project.title}</div>
          <div className="mt-1 text-sm text-muted">{project.summary}</div>
        </div>
      </div>
      {project.tools.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {project.tools.map((t) => (
            <span key={t} className="rounded-md bg-border/40 px-2 py-0.5 text-xs">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button onClick={onOpen} className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
          View details
        </button>
        <button onClick={onAsk} className="rounded-md bg-accent/20 border border-accent/30 px-3 py-1.5 text-accent hover:bg-accent/30">
          Ask about this project
        </button>
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
            Live ↗
          </a>
        )}
        {project.repo && (
          <a href={project.repo} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
            Repo ↗
          </a>
        )}
      </div>
    </div>
  );
}
