import { NextRequest, NextResponse } from "next/server";
import { EmployerNotification } from "@/types";

// In production: integrate with SendGrid / Resend / AWS SES
// Here we simulate and log the notification payload
export async function POST(req: NextRequest) {
  const payload: EmployerNotification = await req.json();

  const emailBody = `
New Application Received — ${payload.jobTitle}

Applicant: ${payload.applicantName}
Email: ${payload.applicantEmail}
AI Match Score: ${payload.matchScore}%
Applied: ${new Date(payload.appliedAt).toLocaleString("en-GB")}

Cover Note:
"${payload.coverNote}"

View full application at: https://jobboard.app/applications/${payload.jobId}/${payload.cvId}

---
Sent by AI JobBoard Platform
  `.trim();

  // Simulate email send (replace with real provider)
  console.log("=== EMPLOYER NOTIFICATION EMAIL ===");
  console.log(`TO: ${payload.applicantEmail}`);
  console.log(emailBody);
  console.log("===================================");

  // Simulate 200ms network delay
  await new Promise((r) => setTimeout(r, 200));

  return NextResponse.json({
    success: true,
    message: `Notification sent to employer for ${payload.jobTitle}`,
    emailPreview: emailBody,
    sentAt: new Date().toISOString(),
  });
}
