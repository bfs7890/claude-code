"use client";
import { useState } from "react";
import { X, Building2, Newspaper, Code2, Users, MessageSquare, Lightbulb, Loader2 } from "lucide-react";
import { Job } from "@/types";

interface Briefing {
  overview: string;
  recentNews: string[];
  techStack: string[];
  cultureInsights: string[];
  glassdoorSentiment: string;
  interviewTips: string[];
  keyPeople: string[];
  verdict: string;
}

export default function CompanyBriefingModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Briefing | null>(null);
  const [error, setError] = useState("");

  async function fetchBriefing() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: job.company,
          jobTitle: job.title,
          jobDescription: job.description,
        }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Briefing failed. Please try again.");
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
              <Building2 className="w-5 h-5 text-emerald-400" /> Company Briefing
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{job.company} — Pre-Interview Intel</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!result && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Get your pre-interview briefing</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                AI generates a 1-page intel brief on {job.company} — culture, tech stack, interview tips, and what to expect.
              </p>
              <button onClick={fetchBriefing} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors">
                Generate Briefing
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Researching {job.company}...</p>
              <p className="text-slate-400 text-sm mt-1">Compiling your pre-interview brief</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">{error}</div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Verdict banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-300 text-sm font-medium">"{result.verdict}"</p>
              </div>

              {/* Overview */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Overview
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{result.overview}</p>
              </div>

              {/* Tech stack */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-violet-400" /> Likely Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.techStack.map((t) => (
                    <span key={t} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-lg">{t}</span>
                  ))}
                </div>
              </div>

              {/* Recent news */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-400" /> Recent News & Trends
                </p>
                <ul className="space-y-1.5">
                  {result.recentNews.map((n, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-blue-400 flex-shrink-0">•</span>{n}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Culture + Glassdoor */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" /> Culture Insights
                </p>
                <ul className="space-y-1.5 mb-3">
                  {result.cultureInsights.map((c, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-orange-400 flex-shrink-0">→</span>{c}
                    </li>
                  ))}
                </ul>
                <div className="bg-slate-700/60 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Employee Sentiment
                  </p>
                  <p className="text-sm text-slate-300">{result.glassdoorSentiment}</p>
                </div>
              </div>

              {/* Interview tips */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" /> Interview Tips
                </p>
                <ul className="space-y-2">
                  {result.interviewTips.map((t, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="w-5 h-5 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Who you'll meet */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">Who You'll Likely Meet</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.keyPeople.map((p) => (
                    <span key={p} className="text-xs bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-lg">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
