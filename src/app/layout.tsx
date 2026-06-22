import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI JobBoard — Smart Job Search",
  description: "AI-powered job search with tailored CVs and instant matching",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
