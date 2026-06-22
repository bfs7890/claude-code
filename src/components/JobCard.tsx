"use client";
import {
  Building2,
  MapPin,
  Banknote,
  Calendar,
  Sparkles,
  Send,
} from "lucide-react";
import { Job } from "@/types";

interface Props {
  job: Job;
  onTailorCV: (job: Job) => void;
  onApply: (job: Job) => void;
}

export default function JobCard({ job, onTailorCV, onApply }: Props) {
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
          <span className="text-xs text-slate-500">
            +{job.requirements.length - 4} more
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onTailorCV(job)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          AI Tailor CV
        </button>
        <button
          onClick={() => onApply(job)}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          Apply
        </button>
      </div>
    </div>
  );
}
