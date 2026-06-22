import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { baseCV, jobDescription, jobRequirements, jobTitle } = await req.json();

  const prompt = `You are an expert CV writer and career coach.

Given the job seeker's base CV and a specific job posting, rewrite and tailor the CV to maximise relevance and match score.

**JOB TITLE:** ${jobTitle}

**JOB DESCRIPTION:**
${jobDescription}

**KEY REQUIREMENTS:**
${jobRequirements.join(", ")}

**BASE CV:**
${JSON.stringify(baseCV, null, 2)}

Your task:
1. Rewrite the professional summary to speak directly to this role
2. Reorder and enhance experience bullet points to highlight relevant achievements
3. Add or reorder skills to match the job requirements
4. Quantify achievements where possible
5. Use keywords from the job description naturally

Return a JSON object with this exact structure:
{
  "summary": "tailored summary text",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "...",
      "role": "...",
      "startDate": "...",
      "endDate": "...",
      "bullets": ["bullet1", "bullet2"]
    }
  ],
  "matchScore": 85,
  "keyChanges": ["change1", "change2", "change3"],
  "coverNote": "A 2-sentence personalised cover note for this application"
}

Return ONLY valid JSON, no markdown.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const result = JSON.parse(text);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI tailoring failed" }, { status: 500 });
  }
}
