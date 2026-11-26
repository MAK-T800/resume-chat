// lib/profile.ts
// ============================================================
// THE ONLY FILE YOU NEED TO EDIT FOR CONTENT.
// - Replace public/resume.pdf to update the resume.
// - Bump resume.updatedAt below whenever you do.
// - Keep education/certification dates consistent with the PDF.
// ============================================================

import type { Profile } from "./types";

export const profile: Profile = {
  name: "Mohammad Amaan Khan",
  initials: "MAK",
  headline: "Developer",
  location: "To be added",
  availability: "To be added",
  summary:
    "I'm an Electronics and Computer Engineering student at SRM Institute of Science and Technology, Kattankulathur, with strong coding skills and a keen interest in building practical solutions. My branch gives me a foundation in both hardware and software, and I enjoy turning ideas into working projects. I'm looking for internship opportunities where I can apply my skills, learn from real-world challenges and contribute to a team.",
  expertise: ["Electronics", "Web Development", "AI Engineering", "Data Science"],
  skills: ["Python", "Java", "C", "C++", "JavaScript", "HTML", "CSS", "CUDA"],
  education: [
    {
      school: "SRM Institute of Science and Technology, Kattankulathur",
      program: "Electronics and Computer Engineering",
    },
  ],
  certifications: [],
  achievements: ["To be added"],
  lookingFor: "To be added",
  contact: [
    { label: "GitHub", url: "https://github.com/MAK-T800" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/m-a-k-t800/" },
  ],
  // ---- PROJECTS: replace these placeholders with your real ones ----
  // Newest first. Remove both placeholders when you have real projects.
  projects: [
    // TODO: replace with a real project
    {
      id: "placeholder-one",
      title: "Project One (placeholder)",
      summary: "Placeholder project — replace with a real project.",
      tools: ["Python"],
      link: "",
      repo: "",
    },
    // TODO: replace with a real project
    {
      id: "placeholder-two",
      title: "Project Two (placeholder)",
      summary: "Placeholder project — replace with a real project.",
      tools: ["JavaScript"],
      link: "",
      repo: "",
    },
  ],
  resume: {
    updatedAt: "2026-11-26", // ⭐ bump this when you replace public/resume.pdf
    path: "/resume.pdf",
  },
  suggestedQuestions: [
    "What is Mohammad studying?",
    "What programming languages does he know?",
    "What areas is he strongest in?",
    "How can I contact him?",
  ],
};
