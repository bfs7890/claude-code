"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Star,
  Clock,
  Tag,
  ChevronRight,
} from "lucide-react";
import { CV } from "@/types";
import { getCVLibrary, deleteCV } from "@/lib/cvStore";

interface Props {
  onSelect: (cv: CV) => void;
  selectedId?: string;
  refreshKey?: number;
}

export default function CVLibrary({ onSelect, selectedId, refreshKey }: Props) {
  const [library, setLibrary] = useState<CV[]>([]);

  useEffect(() => {
    setLibrary(getCVLibrary());
  }, [refreshKey]);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Delete this CV from your library?")) {
      deleteCV(id);
      setLibrary(getCVLibrary());
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">CV Library</span>
          <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
            {library.length}
          </span>
        </div>
        <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
        {library.map((cv) => (
          <div
            key={cv.id}
            onClick={() => onSelect(cv)}
            className={`group flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-800 transition-colors ${
              selectedId === cv.id ? "bg-slate-800 border-l-2 border-violet-500" : ""
            }`}
          >
            <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-violet-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-white truncate">
                  {cv.name}
                </p>
                {cv.matchScore && (
                  <span className="flex items-center gap-0.5 text-xs text-yellow-400 flex-shrink-0">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {cv.matchScore}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {cv.updatedAt}
                </span>
                {cv.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleDelete(cv.id, e)}
                className="p-1 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
