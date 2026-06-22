"use client";
import { useState } from "react";
import { X, Zap, CheckCircle, AlertCircle, BookOpen, Loader2, TrendingUp } from "lucide-react";
import { Job } from "@/types";
import { mockBaseCV } from "@/lib/mockData";

interface GapResult {
  presentSkills: string[];
  missingSkills: string[];
  gapScore: number;
  summary: string;
  learningPath: { skill: string; resource: string; duration: string }[];
}

export default function SkillsGapModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GapResult | null>(null);
  const [error, setError] = useState("");

  async function analyse() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seekerSkills: mockBaseCV.content.skills,
          jobRequirements: job.requirements,
          jobTitle: job.title,
        }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result
    ? result.gapScore >= 80 ? "text-green-400" : result.gapScore >= 60 ? "text-yellow-400" : "text-red-400"
    : "";
  const barColor = result
    ? result.gapScore >= 80 ? "bg-green-500" : result.gapScore >= 60 ? "bg-yellow-500" : "bg-red-500"
    : "bg-violet-500";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Skills Gap Analyser
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{job.title} at {job.company}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!result && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Identify your skills gap</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                AI will compare your skills against this role and build a personalised learning path to close the gap.
              </p>
              <button onClick={analyse} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-colors">
                Analyse My Skills Gap
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Analysing your skills profile...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">{error}</div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Score bar */}
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Skills Match</p>
                  <p className={`text-2xl font-bold ${scoreColor}`}>{result.gapScore}%</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all ${barColor}`} style={{ width: `${result.gapScore}%` }} />
                </div>
                <p className="text-sm text-slate-300 mt-2">{result.summary}</p>
              </div>

              {/* Present skills */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Skills You Have ({result.presentSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.presentSkills.map((s) => (
                    <span key={s} className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>

              {/* Missing skills */}
              {result.missingSkills.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" /> Skills to Develop ({result.missingSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map((s) => (
                      <span key={s} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning path */}
              {result.learningPath.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-400" /> Your Learning Path
                  </p>
                  <div className="space-y-3">
                    {result.learningPath.map((item, i) => (
                      <div key={i} className="flex gap-3 bg-slate-700/50 rounded-xl p-3">
                        <div className="w-6 h-6 bg-violet-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.skill}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.resource}</p>
                          <p className="text-xs text-violet-400 mt-0.5">⏱ {item.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
