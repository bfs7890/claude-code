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

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [tailorJob, setTailorJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applyCoverNote, setApplyCoverNote] = useState("");
  const [applyCV, setApplyCV] = useState<CV | undefined>(undefined);
  const [cvRefreshKey, setCvRefreshKey] = useState(0);

  const filtered = mockJobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );

  function handleApplyFromTailor(job: Job, cv: CV, note: string) {
    setTailorJob(null);
    setApplyCV(cv);
    setApplyCoverNote(note);
    setApplyJob(job);
  }

  function handleDirectApply(job: Job) {
    setApplyCV(undefined);
    setApplyCoverNote("");
    setApplyJob(job);
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
                <span className="ml-2 text-yellow-400">
                  ★ {selectedCV.matchScore}% match
                </span>
              )}
            </div>
          )}
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
              AI Match Ready
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
              onTailorCV={setTailorJob}
              onApply={handleDirectApply}
            />
          ))}
        </section>
      </main>

      {/* CV Tailor Modal */}
      {tailorJob && (
        <CVTailorModal
          job={tailorJob}
          onClose={() => setTailorJob(null)}
          onSaved={() => setCvRefreshKey((k) => k + 1)}
          onApply={handleApplyFromTailor}
        />
      )}

      {/* Apply Modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          tailoredCV={applyCV}
          coverNote={applyCoverNote}
          onClose={() => {
            setApplyJob(null);
            setApplyCV(undefined);
          }}
        />
      )}
    </div>
  );
}
