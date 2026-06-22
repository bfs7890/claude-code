import { NextRequest, NextResponse } from "next/server";
import { EmployerNotification } from "@/types";

export async function POST(req: NextRequest) {
  const payload: EmployerNotification = await req.json();

  const emailBody = `
New Application Received — ${payload.jobTitle}

Applicant: ${payload.applicantName}
Email:     ${payload.applicantEmail}
AI Match Score: ${payload.matchScore}%
Applied:   ${new Date(payload.appliedAt).toLocaleString("en-GB")}

Cover Note:
"${payload.coverNote}"

View full application at: https://jobboard.app/applications/${payload.jobId}/${payload.cvId}

---
Sent by AI JobBoard Platform
  `.trim();

  // In production: replace with SendGrid / Resend / AWS SES call
  console.log("=== EMPLOYER NOTIFICATION ===");
  console.log(`TO: ${payload.applicantEmail}`);
  console.log(emailBody);

  await new Promise((r) => setTimeout(r, 200));

  return NextResponse.json({
    success: true,
    message: `Employer notified for ${payload.jobTitle}`,
    sentAt: new Date().toISOString(),
  });
}
