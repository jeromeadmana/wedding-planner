/**
 * Saya DB Migration
 * Run: npx tsx scripts/migrate.ts
 *
 * Rules:
 *  - Only CREATE / ALTER — never DROP unless wp_ prefixed
 *  - All tables use wp_ prefix
 */

import { Pool } from "pg"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
})

async function migrate() {
  const client = await pool.connect()
  try {
    console.log("🔌 Connected to database")
    await client.query("BEGIN")

    // ── Users ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_users (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email      TEXT UNIQUE NOT NULL,
        name       TEXT,
        avatar     TEXT,
        role       TEXT NOT NULL DEFAULT 'organizer',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_users")

    // ── Events ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_events (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id               UUID NOT NULL REFERENCES wp_users(id) ON DELETE CASCADE,
        title                 TEXT NOT NULL,
        event_type            TEXT NOT NULL DEFAULT 'wedding',
        date                  DATE,
        venue                 TEXT,
        city                  TEXT,
        guest_count_estimate  INT,
        cover_photo_url       TEXT,
        slug                  TEXT UNIQUE NOT NULL,
        custom_domain         TEXT UNIQUE,
        is_website_live       BOOLEAN NOT NULL DEFAULT false,
        website_theme         TEXT NOT NULL DEFAULT 'classic',
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_events")

    // ── Guests ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_guests (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id    UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        email       TEXT,
        phone       TEXT,
        group_tag   TEXT,
        meal_pref   TEXT,
        plus_one    BOOLEAN NOT NULL DEFAULT false,
        notes       TEXT,
        invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_guests")

    // ── RSVPs ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_rsvps (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guest_id     UUID NOT NULL REFERENCES wp_guests(id) ON DELETE CASCADE,
        event_id     UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        token        TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
        status       TEXT NOT NULL DEFAULT 'pending',
        meal_choice  TEXT,
        message      TEXT,
        responded_at TIMESTAMPTZ
      )
    `)
    console.log("✅ wp_rsvps")

    // ── Vendors ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_vendors (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id        UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        category        TEXT NOT NULL,
        business_name   TEXT NOT NULL,
        contact_name    TEXT,
        phone           TEXT,
        email           TEXT,
        contract_amount NUMERIC(12,2),
        deposit_paid    NUMERIC(12,2) DEFAULT 0,
        balance         NUMERIC(12,2) DEFAULT 0,
        status          TEXT NOT NULL DEFAULT 'inquired',
        notes           TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_vendors")

    // ── Budget Items ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_budget_items (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id       UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        vendor_id      UUID REFERENCES wp_vendors(id) ON DELETE SET NULL,
        category       TEXT NOT NULL,
        description    TEXT NOT NULL,
        estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
        actual_cost    NUMERIC(12,2) DEFAULT 0,
        paid           BOOLEAN NOT NULL DEFAULT false,
        notes          TEXT,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_budget_items")

    // ── Checklist ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_checklist_items (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id   UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        title      TEXT NOT NULL,
        category   TEXT,
        due_date   DATE,
        is_done    BOOLEAN NOT NULL DEFAULT false,
        is_pinned  BOOLEAN NOT NULL DEFAULT false,
        notes      TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_checklist_items")

    // ── Timeline ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_timeline_events (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id    UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        time        TIME,
        title       TEXT NOT NULL,
        location    TEXT,
        assignee    TEXT,
        notes       TEXT,
        order_index INT NOT NULL DEFAULT 0
      )
    `)
    console.log("✅ wp_timeline_events")

    // ── Seating ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_tables (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id   UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        capacity   INT NOT NULL DEFAULT 8,
        notes      TEXT
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_seat_assignments (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id   UUID NOT NULL REFERENCES wp_tables(id) ON DELETE CASCADE,
        guest_id   UUID NOT NULL REFERENCES wp_guests(id) ON DELETE CASCADE,
        UNIQUE(guest_id)
      )
    `)
    console.log("✅ wp_tables + wp_seat_assignments")

    // ── Photo Sessions (Saya Shots) ────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_photo_sessions (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id     UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        session_name TEXT NOT NULL DEFAULT 'Wedding Day',
        qr_token     TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
        is_active    BOOLEAN NOT NULL DEFAULT false,
        reveal_at    TIMESTAMPTZ,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_photo_sessions")

    // ── Photos ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_photos (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id          UUID NOT NULL REFERENCES wp_photo_sessions(id) ON DELETE CASCADE,
        event_id            UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        guest_name          TEXT NOT NULL,
        cloudinary_public_id TEXT NOT NULL,
        cloudinary_url      TEXT NOT NULL,
        thumbnail_url       TEXT,
        media_type          TEXT NOT NULL DEFAULT 'photo',
        caption             TEXT,
        is_visible          BOOLEAN NOT NULL DEFAULT false,
        taken_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_photos")

    // ── Wedding Pages ──────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_wedding_pages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id        UUID UNIQUE NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        theme           TEXT NOT NULL DEFAULT 'classic',
        hero_photo_url  TEXT,
        our_story_text  TEXT,
        events_json     JSONB DEFAULT '[]'::jsonb,
        gallery_urls    TEXT[] DEFAULT '{}',
        registry_link   TEXT,
        is_live         BOOLEAN NOT NULL DEFAULT false,
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_wedding_pages")

    // ── Subscriptions ──────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_subscriptions (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id          UUID NOT NULL REFERENCES wp_events(id) ON DELETE CASCADE,
        modules           TEXT[] NOT NULL DEFAULT '{"checklist"}',
        billing_cycle     TEXT NOT NULL DEFAULT 'monthly',
        next_billing_date DATE,
        status            TEXT NOT NULL DEFAULT 'active',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_subscriptions")

    // ── Payments ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wp_payments (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES wp_users(id) ON DELETE CASCADE,
        event_id    UUID REFERENCES wp_events(id) ON DELETE SET NULL,
        amount      NUMERIC(12,2) NOT NULL,
        currency    TEXT NOT NULL DEFAULT 'PHP',
        module      TEXT,
        status      TEXT NOT NULL DEFAULT 'pending',
        gcash_ref   TEXT,
        paid_at     TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    console.log("✅ wp_payments")

    await client.query("COMMIT")
    console.log("\n🎉 Migration complete — all wp_ tables ready")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("❌ Migration failed:", err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
