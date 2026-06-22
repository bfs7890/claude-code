import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { jobTitle, location, offeredSalary, yearsExperience, skills } = await req.json();

  const prompt = `You are a salary negotiation expert helping a job seeker negotiate their offer.

**ROLE:** ${jobTitle}
**LOCATION:** ${location}
**OFFER RECEIVED:** ${offeredSalary}
**YEARS EXPERIENCE:** ${yearsExperience}
**KEY SKILLS:** ${skills.join(", ")}

Provide negotiation advice with market data context.

Return ONLY valid JSON:
{
  "marketMin": "£55,000",
  "marketMax": "£85,000",
  "marketMid": "£70,000",
  "counterOffer": "£78,000",
  "emailScript": "Full email they can send to negotiate — professional but confident tone",
  "tactics": ["specific negotiation tactic to use in this situation"],
  "leverage": ["leverage point the seeker has in this negotiation"]
}

Be realistic with market data for the role and location. Return ONLY JSON.`;

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
    return NextResponse.json({ error: "Negotiation advice failed" }, { status: 500 });
  }
}
