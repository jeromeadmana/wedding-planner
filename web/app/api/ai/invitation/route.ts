import { auth } from "@/lib/auth"
import { generateText } from "@/lib/ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { eventType, names, date, venue, city, tone, language, style } = await req.json()

  if (!names) return NextResponse.json({ error: "Names are required" }, { status: 400 })

  const systemPrompt = `You are a professional invitation writer specializing in Filipino celebrations. Write beautiful, culturally appropriate invitations. Format the output as a complete invitation text ready to print or send. Include traditional Filipino elements when appropriate (e.g., "Ninong/Ninang" for weddings). Match the requested tone and language precisely.`

  const userPrompt = `Write a ${style} ${eventType} invitation with the following details:
- Names: ${names}
- Date: ${date || "TBA"}
- Venue: ${venue || "TBA"}
- City: ${city || ""}
- Tone: ${tone}
- Language: ${language}

Please write a complete, formatted invitation.`

  try {
    const result = await generateText(systemPrompt, userPrompt)
    return NextResponse.json({ text: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate invitation"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
