import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/helpers"
import Header from "@/components/Header"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "AI Tools" }

const tools = [
  {
    slug: "drinks",
    icon: "\ud83c\udf77",
    name: "Drinks Calculator",
    description: "Calculate exact bottles for your event",
    tier: "free" as const,
  },
  {
    slug: "budget",
    icon: "\u20b1",
    name: "Budget Advisor",
    description: "Smart budget allocation by category",
    tier: "free" as const,
  },
  {
    slug: "timeline",
    icon: "\ud83d\udcc5",
    name: "Timeline Generator",
    description: "Generate a minute-by-minute schedule",
    tier: "free" as const,
  },
  {
    slug: "seating",
    icon: "\ud83e\ude91",
    name: "Seating Optimizer",
    description: "Auto-assign guests to tables",
    tier: "free" as const,
  },
  {
    slug: "invitation",
    icon: "\u2709\ufe0f",
    name: "Invitation Writer",
    description: "AI-crafted invitations in seconds",
    tier: "pro" as const,
  },
  {
    slug: "speech",
    icon: "\ud83c\udf99\ufe0f",
    name: "Speech Writer",
    description: "Heartfelt speeches when words fail",
    tier: "pro" as const,
  },
]

export default async function AIToolsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  return (
    <div>
      <Header title="AI Tools" subtitle="Smart tools to help plan your perfect event" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/ai/${tool.slug}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h3 className="font-semibold text-lg">{tool.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
            {tool.tier === "free" ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mt-3 inline-block">
                Free
              </span>
            ) : (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mt-3 inline-block">
                Pro
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
