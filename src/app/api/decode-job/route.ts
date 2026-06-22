import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { jobTitle, jobDescription, requirements } = await req.json();

  const prompt = `You are a brutally honest career advisor who decodes job postings for job seekers.

Analyse this job posting and reveal the truth behind the language used.

**JOB TITLE:** ${jobTitle}
**DESCRIPTION:** ${jobDescription}
**REQUIREMENTS:** ${requirements.join(", ")}

Return ONLY valid JSON:
{
  "plainSummary": "In plain English, what this job actually is (2-3 sentences)",
  "redFlags": ["warning signal found in the posting"],
  "greenFlags": ["positive signal found in the posting"],
  "cultureSignals": ["what the language reveals about company culture"],
  "realRequirements": ["skills you MUST have to get hired"],
  "niceToHave": ["skills listed but probably not dealbreakers"],
  "overallRating": 82,
  "verdict": "One punchy sentence: is this worth applying to and why"
}

overallRating is 0-100. Be honest about red flags. Return ONLY JSON.`;

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
    return NextResponse.json({ error: "Job decode failed" }, { status: 500 });
  }
}
