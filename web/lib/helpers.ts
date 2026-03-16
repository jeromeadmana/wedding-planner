import { query } from "./db"

// Re-export client-safe utilities so server pages can import from one place
export { formatCurrency } from "./format"

interface ActiveEvent {
  id: string
  title: string
  event_type: string
}

export async function getActiveEvent(userId: string): Promise<ActiveEvent | null> {
  const { rows } = await query<ActiveEvent>(
    `SELECT id, title, event_type FROM wp_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId]
  )
  return rows[0] ?? null
}
