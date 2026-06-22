"use client";
import { useState } from "react";
import { X, MessageSquare, ChevronDown, ChevronUp, Loader2, Lightbulb } from "lucide-react";
import { Job } from "@/types";
import { mockBaseCV } from "@/lib/mockData";

interface Question {
  question: string;
  category: string;
  suggestedAnswer: string;
  tip: string;
}

const categoryColors: Record<string, string> = {
  Technical: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Behavioural: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Situational: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Culture Fit": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Leadership: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Role-specific": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function InterviewPrepModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          jobDescription: job.description,
          requirements: job.requirements,
          seekerBackground: mockBaseCV.content.summary,
        }),
      });
      if (!res.ok) throw new Error();
      setQuestions(await res.json());
    } catch {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" /> Interview Prep Coach
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{job.title} at {job.company}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {questions.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Prepare for your interview</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                AI generates the most likely interview questions for this specific role with tailored answers based on your background.
              </p>
              <button onClick={generate} className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl transition-colors">
                Generate Questions
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-pink-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Preparing your interview questions...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">{error}</div>
          )}

          {questions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">{questions.length} questions prepared — tap to reveal suggested answers</p>
              {questions.map((q, i) => (
                <div key={i} className="bg-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-start justify-between gap-3 p-4 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[q.category] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
                          {q.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">{q.question}</p>
                    </div>
                    {expanded === i
                      ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    }
                  </button>

                  {expanded === i && (
                    <div className="px-4 pb-4 border-t border-slate-700 pt-3 space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Suggested Answer</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{q.suggestedAnswer}</p>
                      </div>
                      <div className="flex gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-300">{q.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
