"use client";
import { profile } from "@/lib/profile";
import type { StoredChat } from "@/lib/types";

export default function Sidebar({
  open,
  onClose,
  chats,
  onNewChat,
  onOpenChat,
}: {
  open: boolean;
  onClose: () => void;
  chats: StoredChat[];
  onNewChat: () => void;
  onOpenChat: (id: string) => void;
}) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 sm:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={
          "fixed sm:static z-40 top-0 left-0 h-full w-[290px] shrink-0 border-r border-border bg-panel flex flex-col transition-transform " +
          (open ? "translate-x-0" : "-translate-x-full sm:translate-x-0")
        }
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/30 grid place-items-center text-sm font-semibold text-accent">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{profile.name}</div>
              <div className="text-xs text-muted truncate">{profile.headline}</div>
            </div>
          </div>
          <button
            onClick={onNewChat}
            className="mt-4 w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
          >
            + New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 text-sm">
          <section>
            <h3 className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Chat history
            </h3>
            {chats.length > 0 ? (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <SideBtn
                    key={chat.id}
                    label={chat.title || "Untitled"}
                    onClick={() => onOpenChat(chat.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="px-2 py-2 text-xs text-muted">Your conversations will appear here.</p>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}

function SideBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-md px-2 py-1.5 text-sm text-ink/90 hover:bg-border/40 truncate"
    >
      {label}
    </button>
  );
}
