import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { company, jobTitle, jobDescription } = await req.json();

  const prompt = `You are a research analyst preparing a pre-interview briefing for a job seeker.

Generate a realistic and insightful company briefing for:

**COMPANY:** ${company}
**ROLE:** ${jobTitle}
**JOB DESCRIPTION:** ${jobDescription}

Base your response on general knowledge about this type of company and role. Be specific and useful.

Return ONLY valid JSON:
{
  "overview": "2-3 sentence company overview — what they do, size, stage",
  "recentNews": ["relevant news item or trend about this company or sector"],
  "techStack": ["likely technologies used based on the role and company type"],
  "cultureInsights": ["insight about working culture based on available signals"],
  "glassdoorSentiment": "Typical employee sentiment summary for this type of company",
  "interviewTips": ["specific tip for interviewing at this company for this role"],
  "keyPeople": ["type of people likely on the interview panel e.g. 'Engineering Manager', 'CTO'"],
  "verdict": "One sentence: what makes this company stand out as an employer"
}

Return ONLY JSON.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const text = (message.content[0] as { type: string; text: string }).text;
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Company briefing failed" }, { status: 500 });
  }
}
