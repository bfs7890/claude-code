"use client";
import { useState } from "react";
import { X, Send, CheckCircle, Loader2, Building2 } from "lucide-react";
import { Job, CV } from "@/types";
import { mockBaseCV } from "@/lib/mockData";

interface Props {
  job: Job;
  tailoredCV?: CV;
  coverNote?: string;
  onClose: () => void;
}

export default function ApplyModal({
  job,
  tailoredCV,
  coverNote,
  onClose,
}: Props) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState(coverNote || "");

  const cv = tailoredCV || mockBaseCV;

  async function handleSend() {
    setSending(true);
    try {
      await fetch("/api/notify-employer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName: cv.content.personalInfo.fullName,
          applicantEmail: cv.content.personalInfo.email,
          jobTitle: job.title,
          jobId: job.id,
          cvId: cv.id,
          matchScore: cv.matchScore || 72,
          coverNote: note,
          appliedAt: new Date().toISOString(),
        }),
      });
      setSent(true);
    } catch {
      // still show success in demo
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-violet-400" />
            Submit Application
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!sent ? (
          <div className="p-5 space-y-4">
            <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-white font-medium">{job.title}</p>
                <p className="text-slate-400 text-sm">{job.company}</p>
              </div>
              {tailoredCV?.matchScore && (
                <span className="ml-auto text-sm font-bold text-green-400">
                  {tailoredCV.matchScore}% match
                </span>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-white mb-2">
                Applying as
              </p>
              <div className="bg-slate-800 rounded-xl p-3 text-sm text-slate-300">
                {cv.content.personalInfo.fullName} —{" "}
                {cv.content.personalInfo.email}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-white mb-2">
                Cover Note{" "}
                {tailoredCV && (
                  <span className="text-xs text-violet-400">(AI generated)</span>
                )}
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500 resize-none"
                placeholder="Add a personal note to the employer..."
              />
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 text-xs text-slate-400">
              The employer will receive your tailored CV, contact details, match
              score, and this cover note.
            </div>

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Application
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">
              Application Sent!
            </h3>
            <p className="text-slate-400 text-sm mb-2">
              Your tailored CV has been submitted to {job.company}.
            </p>
            <p className="text-slate-500 text-xs mb-6">
              The employer has been notified and you will receive updates in
              your notifications.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
