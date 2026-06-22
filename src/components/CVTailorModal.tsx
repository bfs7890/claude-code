"use client";
import { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle,
  Star,
  Copy,
  Save,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Job, CV, CVContent } from "@/types";
import { mockBaseCV } from "@/lib/mockData";
import { saveCV, generateCVId } from "@/lib/cvStore";

interface TailorResult {
  summary: string;
  skills: string[];
  experience: CVContent["experience"];
  matchScore: number;
  keyChanges: string[];
  coverNote: string;
}

interface Props {
  job: Job;
  onClose: () => void;
  onSaved: () => void;
  onApply: (job: Job, tailoredCV: CV, coverNote: string) => void;
}

export default function CVTailorModal({
  job,
  onClose,
  onSaved,
  onApply,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showExp, setShowExp] = useState(false);

  async function handleTailor() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseCV: mockBaseCV.content,
          jobDescription: job.description,
          jobRequirements: job.requirements,
          jobTitle: job.title,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data: TailorResult = await res.json();
      setResult(data);
    } catch {
      setError("AI tailoring failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!result) return;
    const tailored: CV = {
      id: generateCVId(),
      name: `CV for ${job.title} @ ${job.company}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      jobTitle: job.title,
      tags: result.skills.slice(0, 3).map((s) => s.toLowerCase()),
      matchScore: result.matchScore,
      content: {
        ...mockBaseCV.content,
        summary: result.summary,
        skills: result.skills,
        experience: result.experience,
      },
    };
    saveCV(tailored);
    setSaved(true);
    onSaved();
  }

  function handleApply() {
    if (!result) return;
    const tailored: CV = {
      id: generateCVId(),
      name: `CV for ${job.title} @ ${job.company}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      jobTitle: job.title,
      tags: result.skills.slice(0, 3).map((s) => s.toLowerCase()),
      matchScore: result.matchScore,
      content: {
        ...mockBaseCV.content,
        summary: result.summary,
        skills: result.skills,
        experience: result.experience,
      },
    };
    onApply(job, tailored, result.coverNote);
  }

  const scoreColor =
    result && result.matchScore >= 80
      ? "text-green-400"
      : result && result.matchScore >= 60
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              AI CV Tailor
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {job.title} at {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!result && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                Tailor your CV with AI
              </h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Claude will analyse the job requirements and rewrite your CV to
                maximise your match score and get past ATS filters.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {job.requirements.map((req) => (
                  <span
                    key={req}
                    className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg"
                  >
                    {req}
                  </span>
                ))}
              </div>
              <button
                onClick={handleTailor}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
              >
                Tailor My CV Now
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">
                Claude is tailoring your CV...
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Analysing job requirements and optimising your profile
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4">
                <div>
                  <p className="text-sm text-slate-400">AI Match Score</p>
                  <p className={`text-3xl font-bold ${scoreColor}`}>
                    {result.matchScore}%
                  </p>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i <= Math.round(result.matchScore / 20)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Key changes */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Key Changes Made
                </p>
                <ul className="space-y-1.5">
                  {result.keyChanges.map((c, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-violet-400 flex-shrink-0">→</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">
                  Tailored Summary
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Skills */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">
                  Optimised Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience toggle */}
              <div className="bg-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowExp((v) => !v)}
                  className="w-full flex items-center justify-between p-4 text-sm font-semibold text-white"
                >
                  <span>Tailored Experience Bullets</span>
                  {showExp ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {showExp && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-700 pt-3">
                    {result.experience.map((exp, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium text-violet-300">
                          {exp.role} @ {exp.company}
                        </p>
                        <ul className="mt-1 space-y-1">
                          {exp.bullets.map((b, j) => (
                            <li key={j} className="text-sm text-slate-400 flex gap-2">
                              <span className="text-slate-600">•</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover note */}
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">
                    AI Cover Note
                  </p>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(result.coverNote)
                    }
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{result.coverNote}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl border border-slate-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved to Library" : "Save to Library"}
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Apply with This CV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
