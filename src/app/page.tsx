"use client";
import { useState } from "react";
import { Sparkles, Search, Briefcase, FileText } from "lucide-react";
import { Job, CV } from "@/types";
import { mockJobs } from "@/lib/mockData";
import JobCard from "@/components/JobCard";
import CVLibrary from "@/components/CVLibrary";
import CVTailorModal from "@/components/CVTailorModal";
import ApplyModal from "@/components/ApplyModal";
import NotificationBell from "@/components/NotificationBell";
import SkillsGapModal from "@/components/SkillsGapModal";
import JobDecoderModal from "@/components/JobDecoderModal";
import CompanyBriefingModal from "@/components/CompanyBriefingModal";
import InterviewPrepModal from "@/components/InterviewPrepModal";
import NegotiationModal from "@/components/NegotiationModal";

type ActiveModal =
  | { type: "tailor"; job: Job }
  | { type: "apply"; job: Job; cv?: CV; note?: string }
  | { type: "skills"; job: Job }
  | { type: "decode"; job: Job }
  | { type: "briefing"; job: Job }
  | { type: "interview"; job: Job }
  | { type: "negotiate"; job: Job }
  | null;

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [modal, setModal] = useState<ActiveModal>(null);
  const [cvRefreshKey, setCvRefreshKey] = useState(0);

  const filtered = mockJobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );

  function handleApplyFromTailor(job: Job, cv: CV, note: string) {
    setModal({ type: "apply", job, cv, note });
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">AI JobBoard</span>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <NotificationBell />
        </div>
      </header>

      {/* AI Feature Strip */}
      <div className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-500 flex-shrink-0">AI Tools:</span>
          {[
            { label: "CV Tailor", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
            { label: "Skills Gap", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
            { label: "Job Decoder", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { label: "Company Brief", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { label: "Interview Prep", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
            { label: "Salary Coach", color: "text-green-400 bg-green-500/10 border-green-500/20" },
            { label: "Cover Letter", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
            { label: "Notifications", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
          ].map((f) => (
            <span key={f.label} className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${f.color}`}>
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — CV Library */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Your CV Library
            </h2>
          </div>
          <CVLibrary
            onSelect={setSelectedCV}
            selectedId={selectedCV?.id}
            refreshKey={cvRefreshKey}
          />
          {selectedCV && (
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 text-sm text-violet-300">
              Selected: <strong>{selectedCV.name}</strong>
              {selectedCV.matchScore && (
                <span className="ml-2 text-yellow-400">★ {selectedCV.matchScore}% match</span>
              )}
            </div>
          )}

          {/* Quick stat cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-violet-400">3</p>
              <p className="text-xs text-slate-400 mt-0.5">Jobs Applied</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">2</p>
              <p className="text-xs text-slate-400 mt-0.5">Shortlisted</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">87%</p>
              <p className="text-xs text-slate-400 mt-0.5">Best Match</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">1</p>
              <p className="text-xs text-slate-400 mt-0.5">Interview</p>
            </div>
          </div>
        </aside>

        {/* Right — Job Listings */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                {filtered.length} Jobs Found
              </h2>
            </div>
            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
              6 AI Tools per job
            </span>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No jobs found for &ldquo;{search}&rdquo;</p>
            </div>
          )}

          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onTailorCV={(j) => setModal({ type: "tailor", job: j })}
              onApply={(j) => setModal({ type: "apply", job: j })}
              onSkillsGap={(j) => setModal({ type: "skills", job: j })}
              onDecode={(j) => setModal({ type: "decode", job: j })}
              onBriefing={(j) => setModal({ type: "briefing", job: j })}
              onInterviewPrep={(j) => setModal({ type: "interview", job: j })}
              onNegotiate={(j) => setModal({ type: "negotiate", job: j })}
            />
          ))}
        </section>
      </main>

      {/* Modals */}
      {modal?.type === "tailor" && (
        <CVTailorModal
          job={modal.job}
          onClose={() => setModal(null)}
          onSaved={() => setCvRefreshKey((k) => k + 1)}
          onApply={(job, cv, note) => handleApplyFromTailor(job, cv, note)}
        />
      )}
      {modal?.type === "apply" && (
        <ApplyModal
          job={modal.job}
          tailoredCV={modal.cv}
          coverNote={modal.note}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "skills" && (
        <SkillsGapModal job={modal.job} onClose={() => setModal(null)} />
      )}
      {modal?.type === "decode" && (
        <JobDecoderModal job={modal.job} onClose={() => setModal(null)} />
      )}
      {modal?.type === "briefing" && (
        <CompanyBriefingModal job={modal.job} onClose={() => setModal(null)} />
      )}
      {modal?.type === "interview" && (
        <InterviewPrepModal job={modal.job} onClose={() => setModal(null)} />
      )}
      {modal?.type === "negotiate" && (
        <NegotiationModal job={modal.job} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
