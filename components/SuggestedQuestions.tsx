"use client";
export default function SuggestedQuestions({
  questions,
  onPick,
}: {
  questions: string[];
  onPick: (q: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl mx-auto mt-4">
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onPick(q)}
          className="text-left rounded-xl border border-border bg-panel px-4 py-3 text-sm hover:bg-border/30"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
