import { auth } from "@/lib/auth"
import { generateText } from "@/lib/ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, coupleNames, anecdotes, tone, duration, language } = await req.json()

  if (!coupleNames) return NextResponse.json({ error: "Couple/celebrant names are required" }, { status: 400 })

  const systemPrompt = `You are a warm, experienced speech writer specializing in Filipino celebrations. Write heartfelt, engaging speeches that resonate with Filipino family values and culture. Include natural transitions and pacing notes. The speech should feel personal and authentic, not generic. When writing in Filipino or Taglish, use natural conversational Tagalog.`

  const userPrompt = `Write a ${tone} ${role} speech for ${coupleNames}'s celebration.
Target duration: ${duration} minutes
Language: ${language}

Personal anecdotes and details to include:
${anecdotes || "No specific anecdotes provided — write a general but warm speech."}

Please write a complete speech with natural pacing. Include [pause] markers where the speaker should take a breath or pause for effect.`

  try {
    const result = await generateText(systemPrompt, userPrompt)
    return NextResponse.json({ text: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate speech"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
