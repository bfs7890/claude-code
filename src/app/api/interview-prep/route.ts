import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { jobTitle, jobDescription, requirements, seekerBackground } = await req.json();

  const prompt = `You are an expert interview coach preparing a job seeker for a specific interview.

**ROLE:** ${jobTitle}
**JOB DESCRIPTION:** ${jobDescription}
**REQUIREMENTS:** ${requirements.join(", ")}
**SEEKER BACKGROUND:** ${seekerBackground}

Generate 6 highly likely interview questions for this specific role and provide tailored answers.

Return ONLY valid JSON array:
[
  {
    "question": "Tell me about a time you led a front-end architecture decision",
    "category": "Behavioural",
    "suggestedAnswer": "Tailored answer based on the seeker's background (2-3 sentences, STAR format)",
    "tip": "One specific delivery tip for this question"
  }
]

Categories: Technical, Behavioural, Situational, Culture Fit, Leadership, Role-specific.
Mix categories. Return ONLY the JSON array.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const text = (message.content[0] as { type: string; text: string }).text;
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Interview prep failed" }, { status: 500 });
  }
}
