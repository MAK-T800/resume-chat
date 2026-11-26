"use client";
import { profile } from "@/lib/profile";

export default function ResumeCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-panel p-4">
      <div className="text-sm font-semibold">Resume — {profile.name}</div>
      <div className="mt-1 text-xs text-muted">
        Last updated: {profile.resume.updatedAt}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button onClick={onOpen} className="rounded-md bg-accent/20 border border-accent/30 px-3 py-1.5 text-accent hover:bg-accent/30">
          Preview
        </button>
        <a href={profile.resume.path} download className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
          Download PDF
        </a>
        <a href={profile.resume.path} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:bg-border/40">
          Open in new tab ↗
        </a>
      </div>
    </div>
  );
}
