import { query } from "@/lib/db"
import { notFound, redirect } from "next/navigation"

interface Props {
  params: { domain: string }
}

// Custom domain routing: saya.ph middleware rewrites unknown hostnames to this route.
// We look up the event by custom_domain and redirect to the canonical /e/[slug] page.
export default async function CustomDomainPage({ params }: Props) {
  const { rows } = await query<{ slug: string }>(
    "SELECT slug FROM wp_events WHERE custom_domain = $1",
    [params.domain]
  )

  if (!rows[0]) notFound()

  redirect(`/e/${rows[0].slug}`)
}
