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
  headline: "Electronics & Computer Engineering Student | Full-Stack & AI/ML",
  location: "",
  availability: "Open to internship opportunities",
  summary:
    "I'm a third-year Electronics and Computer Engineering student at SRM Institute of Science and Technology, Kattankulathur. I have a CGPA of 8.37 and expect to graduate in 2028. My interests include full-stack web development, data structures, data science, AI/ML, and embedded systems. I'm looking for internship opportunities where I can apply my skills, learn from real-world challenges, and contribute to a team.",
  expertise: ["Full-Stack Web Development", "AI/ML", "Data Science", "Embedded Systems"],
  skills: [
    "C",
    "C++",
    "Java",
    "Python",
    "JavaScript",
    "HTML",
    "CSS",
    "MERN Stack",
    "Data Structures",
    "Data Science",
    "AI/ML",
    "Embedded Systems",
  ],
  education: [
    {
      school: "SRM Institute of Science and Technology, Kattankulathur",
      program: "Electronics and Computer Engineering",
      notes: "Third year, fifth semester; CGPA 8.37; expected graduation in 2028.",
    },
  ],
  certifications: [],
  achievements: [],
  lookingFor:
    "Internship opportunities where I can apply my skills, learn from real-world challenges, and contribute to a team.",
  contact: [
    { label: "GitHub", url: "https://github.com/MAK-T800" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/m-a-k-t800/" },
  ],
  projects: [
    {
      id: "illuminate",
      title: "Illuminate",
      summary:
        "An AI-powered learning platform with a study helper, support for PDF and PowerPoint materials, cited sources, quiz generation, and a classroom leaderboard.",
      tools: [],
      link: "https://quiz-deck-eight.vercel.app/",
      repo: "https://github.com/MAK-T800/QuizDeck",
    },
  ],
  resume: {
    updatedAt: "2026-11-27",
    path: "/resume.pdf",
  },
  suggestedQuestions: [
    "What is Mohammad studying?",
    "What programming languages does he know?",
    "Tell me about the Illuminate project.",
    "What is Mohammad's CGPA?",
  ],
};
