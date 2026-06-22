export interface CV {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  jobTitle: string;
  content: CVContent;
  tags: string[];
  matchScore?: number;
}

export interface CVContent {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  postedAt: string;
  employerEmail: string;
}

export interface Notification {
  id: string;
  type: "cv_viewed" | "application_received" | "shortlisted" | "interview";
  message: string;
  timestamp: string;
  read: boolean;
  jobTitle?: string;
  company?: string;
}

export interface SkillGap {
  missingSkills: string[];
  presentSkills: string[];
  gapScore: number;
  learningPath: { skill: string; resource: string; duration: string }[];
  summary: string;
}

export interface JobDecoded {
  plainSummary: string;
  redFlags: string[];
  greenFlags: string[];
  cultureSignals: string[];
  realRequirements: string[];
  niceToHave: string[];
  overallRating: number;
  verdict: string;
}

export interface CompanyBriefing {
  overview: string;
  recentNews: string[];
  techStack: string[];
  cultureInsights: string[];
  glassdoorSentiment: string;
  interviewTips: string[];
  keyPeople: string[];
  verdict: string;
}

export interface NegotiationAdvice {
  marketMin: string;
  marketMax: string;
  marketMid: string;
  counterOffer: string;
  emailScript: string;
  tactics: string[];
  leverage: string[];
}

export interface InterviewQuestion {
  question: string;
  category: string;
  suggestedAnswer: string;
  tip: string;
}

export interface EmployerNotification {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  jobId: string;
  cvId: string;
  matchScore: number;
  coverNote: string;
  appliedAt: string;
}
