// lib/storage.ts
import type { StoredChat, ChatMessage } from "./types";

const KEY = "mak-chats-v1";

export function loadChats(): StoredChat[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveChats(chats: StoredChat[]) {
  localStorage.setItem(KEY, JSON.stringify(chats.slice(0, 20)));
}

export function newChatId() {
  return Math.random().toString(36).slice(2, 10);
}

export function titleFrom(messages: ChatMessage[]) {
  const first = messages.find((m) => m.role === "user");
  return first ? first.content.slice(0, 40) : "New chat";
}
