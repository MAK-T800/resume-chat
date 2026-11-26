// lib/types.ts
export type Project = {
  id: string;
  title: string;
  summary: string;
  tools: string[];
  screenshot?: string;
  link?: string;
  repo?: string;
};

export type Profile = {
  name: string;
  initials: string;
  headline: string;
  location: string;
  availability: string;
  summary: string;
  expertise: string[];
  skills: string[];
  education: { school: string; program: string; notes?: string }[];
  certifications: string[];
  achievements: string[];
  lookingFor: string;
  contact: { label: string; url: string }[];
  projects: Project[];
  resume: { updatedAt: string; path: string };
  suggestedQuestions: string[];
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type StoredChat = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};
