"use client";
import {
  Building2,
  MapPin,
  Banknote,
  Calendar,
  Sparkles,
  Send,
  Zap,
  Search,
  MessageSquare,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Job } from "@/types";

interface Props {
  job: Job;
  onTailorCV: (job: Job) => void;
  onApply: (job: Job) => void;
  onSkillsGap: (job: Job) => void;
  onDecode: (job: Job) => void;
  onBriefing: (job: Job) => void;
  onInterviewPrep: (job: Job) => void;
  onNegotiate: (job: Job) => void;
}

export default function JobCard({
  job,
  onTailorCV,
  onApply,
  onSkillsGap,
  onDecode,
  onBriefing,
  onInterviewPrep,
  onNegotiate,
}: Props) {
  const [showTools, setShowTools] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-violet-500/50 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-sm">
            <Building2 className="w-3.5 h-3.5" />
            <span>{job.company}</span>
          </div>
        </div>
        <span className="flex-shrink-0 text-xs bg-violet-500/10 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-full">
          {job.location.includes("Remote") ? "Remote" : "Hybrid"}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {job.location}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1 text-green-400">
            <Banknote className="w-3 h-3" /> {job.salary}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {job.postedAt}
        </span>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mb-3 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.requirements.slice(0, 4).map((req) => (
          <span
            key={req}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-lg"
          >
            {req}
          </span>
        ))}
        {job.requirements.length > 4 && (
          <span className="text-xs text-slate-500">+{job.requirements.length - 4} more</span>
        )}
      </div>

      {/* Primary actions */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => onTailorCV(job)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4" /> AI Tailor CV
        </button>
        <button
          onClick={() => onApply(job)}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
        >
          <Send className="w-4 h-4" /> Apply
        </button>
        <button
          onClick={() => setShowTools((v) => !v)}
          className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl border border-slate-700 transition-colors"
          title="More AI tools"
        >
          More {showTools ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Secondary AI tools */}
      {showTools && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => onSkillsGap(job)}
            className="flex items-center gap-2 py-2 px-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-xl border border-yellow-500/20 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Skills Gap
          </button>
          <button
            onClick={() => onDecode(job)}
            className="flex items-center gap-2 py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-medium rounded-xl border border-blue-500/20 transition-colors"
          >
            <Search className="w-3.5 h-3.5" /> Decode Job
          </button>
          <button
            onClick={() => onBriefing(job)}
            className="flex items-center gap-2 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-xl border border-emerald-500/20 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" /> Company Brief
          </button>
          <button
            onClick={() => onInterviewPrep(job)}
            className="flex items-center gap-2 py-2 px-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs font-medium rounded-xl border border-pink-500/20 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Interview Prep
          </button>
          <button
            onClick={() => onNegotiate(job)}
            className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 bg-green-500/10 hover:bg-green-500/20 text-green-300 text-xs font-medium rounded-xl border border-green-500/20 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" /> Salary Negotiation Coach
          </button>
        </div>
      )}
    </div>
  );
}
