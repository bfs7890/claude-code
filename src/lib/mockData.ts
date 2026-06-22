import { CV, Job, Notification } from "@/types";

export const mockJobs: Job[] = [
  {
    id: "job-001",
    title: "Senior React Developer",
    company: "TechFlow Ltd",
    location: "London, UK (Hybrid)",
    salary: "£70,000 - £90,000",
    postedAt: "2026-06-20",
    employerEmail: "hr@techflow.io",
    description:
      "We are looking for a Senior React Developer to join our growing product team. You will lead front-end architecture decisions, mentor junior developers, and work closely with product and design teams.",
    requirements: [
      "5+ years React experience",
      "TypeScript proficiency",
      "Next.js knowledge",
      "REST & GraphQL APIs",
      "Team leadership experience",
      "Agile/Scrum methodology",
    ],
  },
  {
    id: "job-002",
    title: "Full Stack Engineer",
    company: "StartupHub",
    location: "Remote",
    salary: "£55,000 - £75,000",
    postedAt: "2026-06-21",
    employerEmail: "talent@startuphub.co.uk",
    description:
      "Join our fast-moving startup as a Full Stack Engineer. Build scalable features across our Node.js backend and React frontend. Own features end to end from design to deployment.",
    requirements: [
      "Node.js / Express",
      "React or Vue",
      "PostgreSQL or MongoDB",
      "Docker & CI/CD",
      "AWS or GCP",
      "3+ years experience",
    ],
  },
  {
    id: "job-003",
    title: "AI/ML Product Engineer",
    company: "NeuralWorks",
    location: "Manchester, UK",
    salary: "£80,000 - £110,000",
    postedAt: "2026-06-22",
    employerEmail: "careers@neuralworks.ai",
    description:
      "Shape the future of AI-powered products. You will integrate LLM APIs, build intelligent pipelines, and develop user-facing AI features that delight our customers.",
    requirements: [
      "Python & TypeScript",
      "LLM API integration (Anthropic/OpenAI)",
      "Prompt engineering",
      "React front-end",
      "Vector databases",
      "RAG architecture",
    ],
  },
];

export const mockBaseCV: CV = {
  id: "cv-base",
  name: "My Base CV",
  createdAt: "2026-01-10",
  updatedAt: "2026-06-01",
  jobTitle: "Software Engineer",
  tags: ["react", "typescript", "node"],
  content: {
    personalInfo: {
      fullName: "Alex Johnson",
      email: "alex.johnson@email.com",
      phone: "+44 7700 900000",
      location: "London, UK",
      linkedin: "linkedin.com/in/alexjohnson",
      portfolio: "alexjohnson.dev",
    },
    summary:
      "Experienced software engineer with 6 years building modern web applications. Passionate about clean code, great user experiences, and collaborative team environments.",
    experience: [
      {
        company: "Digital Agency Co",
        role: "Software Engineer",
        startDate: "2021-03",
        endDate: "Present",
        bullets: [
          "Built and maintained React applications serving 50,000+ daily users",
          "Led migration from JavaScript to TypeScript across 3 major projects",
          "Collaborated with design and product teams in Agile sprints",
          "Mentored 2 junior developers through onboarding and code reviews",
        ],
      },
      {
        company: "WebStartup Inc",
        role: "Junior Developer",
        startDate: "2019-06",
        endDate: "2021-02",
        bullets: [
          "Developed REST API integrations using Node.js and Express",
          "Implemented responsive UI components with React and CSS",
          "Participated in daily standups and sprint planning",
        ],
      },
    ],
    education: [
      {
        institution: "University of Manchester",
        degree: "BSc",
        field: "Computer Science",
        year: "2019",
      },
    ],
    skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Next.js",
      "REST APIs",
      "Git",
      "Agile",
      "PostgreSQL",
    ],
    certifications: ["AWS Cloud Practitioner (2023)"],
  },
};

export const mockNotifications: Notification[] = [
  {
    id: "n-001",
    type: "cv_viewed",
    message: "TechFlow Ltd viewed your tailored CV",
    timestamp: "2026-06-22T09:15:00Z",
    read: false,
    jobTitle: "Senior React Developer",
    company: "TechFlow Ltd",
  },
  {
    id: "n-002",
    type: "shortlisted",
    message: "You have been shortlisted at NeuralWorks",
    timestamp: "2026-06-21T14:30:00Z",
    read: false,
    jobTitle: "AI/ML Product Engineer",
    company: "NeuralWorks",
  },
  {
    id: "n-003",
    type: "application_received",
    message: "Application confirmed at StartupHub",
    timestamp: "2026-06-20T11:00:00Z",
    read: true,
    jobTitle: "Full Stack Engineer",
    company: "StartupHub",
  },
];
