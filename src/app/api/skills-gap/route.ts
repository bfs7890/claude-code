import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { seekerSkills, jobRequirements, jobTitle } = await req.json();

  const prompt = `You are a career development expert and skills analyst.

Analyse the gap between a job seeker's current skills and a job's requirements.

**JOB TITLE:** ${jobTitle}

**JOB REQUIREMENTS:**
${jobRequirements.join(", ")}

**SEEKER'S CURRENT SKILLS:**
${seekerSkills.join(", ")}

Return ONLY valid JSON matching this structure:
{
  "presentSkills": ["skill1"],
  "missingSkills": ["skill1"],
  "gapScore": 78,
  "summary": "You have 78% of the required skills. 3 key skills missing.",
  "learningPath": [
    { "skill": "GraphQL", "resource": "Apollo GraphQL official docs + Fullstack tutorial", "duration": "2 weeks" }
  ]
}

gapScore is 0-100 (100 = perfect match). learningPath only for missingSkills. Return ONLY JSON.`;

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
    return NextResponse.json({ error: "Skills gap analysis failed" }, { status: 500 });
  }
}
