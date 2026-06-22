import { CV } from "@/types";
import { mockBaseCV } from "./mockData";

const STORAGE_KEY = "ai_jobboard_cv_library";

export function getCVLibrary(): CV[] {
  if (typeof window === "undefined") return [mockBaseCV];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [mockBaseCV];
  return JSON.parse(stored);
}

export function saveCV(cv: CV): void {
  const library = getCVLibrary();
  const idx = library.findIndex((c) => c.id === cv.id);
  if (idx >= 0) {
    library[idx] = cv;
  } else {
    library.push(cv);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

export function deleteCV(cvId: string): void {
  const library = getCVLibrary().filter((c) => c.id !== cvId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

export function generateCVId(): string {
  return `cv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
