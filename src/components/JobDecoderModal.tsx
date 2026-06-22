"use client";
import { useState } from "react";
import { X, Search, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown, Loader2, Star } from "lucide-react";
import { Job } from "@/types";

interface DecodedJob {
  plainSummary: string;
  redFlags: string[];
  greenFlags: string[];
  cultureSignals: string[];
  realRequirements: string[];
  niceToHave: string[];
  overallRating: number;
  verdict: string;
}

export default function JobDecoderModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecodedJob | null>(null);
  const [error, setError] = useState("");

  async function decode() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/decode-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          jobDescription: job.description,
          requirements: job.requirements,
        }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Decode failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const ratingColor = result
    ? result.overallRating >= 75 ? "text-green-400" : result.overallRating >= 50 ? "text-yellow-400" : "text-red-400"
    : "";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" /> Job Description Decoder
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
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Decode the job posting</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                AI reads between the lines — exposing red flags, real requirements, and culture signals hidden in corporate language.
              </p>
              <button onClick={decode} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors">
                Decode This Job
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Reading between the lines...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">{error}</div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Rating + verdict */}
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Job Quality Score</p>
                  <p className={`text-2xl font-bold ${ratingColor}`}>{result.overallRating}/100</p>
                </div>
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(result.overallRating/20) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-300 font-medium italic">"{result.verdict}"</p>
              </div>

              {/* Plain summary */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">What This Job Actually Is</p>
                <p className="text-sm text-slate-300 leading-relaxed">{result.plainSummary}</p>
              </div>

              {/* Red flags */}
              {result.redFlags.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4" /> Red Flags ({result.redFlags.length})
                  </p>
                  <ul className="space-y-1.5">
                    {result.redFlags.map((f, i) => (
                      <li key={i} className="text-sm text-red-300 flex gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Green flags */}
              {result.greenFlags.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> Green Flags
                  </p>
                  <ul className="space-y-1.5">
                    {result.greenFlags.map((f, i) => (
                      <li key={i} className="text-sm text-green-300 flex gap-2">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Culture signals */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">Culture Signals</p>
                <ul className="space-y-1.5">
                  {result.cultureSignals.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-violet-400">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Real vs nice to have */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs font-semibold text-white mb-2">Must Have</p>
                  <ul className="space-y-1">
                    {result.realRequirements.map((r, i) => (
                      <li key={i} className="text-xs text-slate-300">• {r}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Nice to Have</p>
                  <ul className="space-y-1">
                    {result.niceToHave.map((r, i) => (
                      <li key={i} className="text-xs text-slate-500">• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
