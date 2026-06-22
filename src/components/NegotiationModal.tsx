"use client";
import { useState } from "react";
import { X, DollarSign, Copy, Loader2, TrendingUp, ShieldCheck } from "lucide-react";
import { Job } from "@/types";
import { mockBaseCV } from "@/lib/mockData";

interface NegotiationResult {
  marketMin: string;
  marketMax: string;
  marketMid: string;
  counterOffer: string;
  emailScript: string;
  tactics: string[];
  leverage: string[];
}

export default function NegotiationModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [error, setError] = useState("");
  const [offeredSalary, setOfferedSalary] = useState(job.salary?.split(" - ")[0] || "");
  const [copied, setCopied] = useState(false);

  async function getAdvice() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/negotiation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          location: job.location,
          offeredSalary,
          yearsExperience: 6,
          skills: mockBaseCV.content.skills,
        }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Failed to get advice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyEmail() {
    if (result) {
      navigator.clipboard.writeText(result.emailScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" /> Negotiation Coach
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{job.title} at {job.company}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!result && !loading && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Get your negotiation strategy</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  AI gives you market data, a counter-offer amount, and a ready-to-send negotiation email.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-white mb-1.5 block">Salary Offered</label>
                <input
                  type="text"
                  value={offeredSalary}
                  onChange={(e) => setOfferedSalary(e.target.value)}
                  placeholder="e.g. £65,000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
              </div>

              <button
                onClick={getAdvice}
                disabled={!offeredSalary}
                className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
              >
                Get Negotiation Strategy
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-green-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Analysing market data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">{error}</div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Market range */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" /> Market Salary Range
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-700 rounded-lg p-2">
                    <p className="text-xs text-slate-400">Min</p>
                    <p className="text-sm font-bold text-slate-300">{result.marketMin}</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2">
                    <p className="text-xs text-green-400">Mid</p>
                    <p className="text-sm font-bold text-green-300">{result.marketMid}</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-2">
                    <p className="text-xs text-slate-400">Max</p>
                    <p className="text-sm font-bold text-slate-300">{result.marketMax}</p>
                  </div>
                </div>
                <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-400 mb-1">Recommended Counter-Offer</p>
                  <p className="text-2xl font-bold text-green-300">{result.counterOffer}</p>
                </div>
              </div>

              {/* Leverage */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> Your Leverage Points
                </p>
                <ul className="space-y-1.5">
                  {result.leverage.map((l, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-blue-400 flex-shrink-0">→</span>{l}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tactics */}
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">Negotiation Tactics</p>
                <ul className="space-y-1.5">
                  {result.tactics.map((t, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="w-5 h-5 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Email script */}
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">Ready-to-Send Email</p>
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-slate-700/50 rounded-lg p-3">
                  {result.emailScript}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
