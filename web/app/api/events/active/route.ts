import { auth } from "@/lib/auth"
import { getActiveEvent } from "@/lib/helpers"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const event = await getActiveEvent(session.user.id)
  if (!event) return NextResponse.json({ error: "No active event" }, { status: 404 })

  return NextResponse.json(event)
}
