# Saya — Full Feature Plan

> Filipino-first event planning platform (weddings, debuts, birthdays, corporate)
> Web: Next.js 14 + Tailwind | Mobile: Expo + React Native | DB: PostgreSQL (wp_ prefix) | Storage: Cloudinary | Email: Resend | Auth: Google OAuth

---

## What's Already Built (Phase 1) ✅

- [x] Google OAuth (web via NextAuth, mobile via Expo AuthSession)
- [x] User upsert to `wp_users`
- [x] Event creation flow (`wp_events`) with slug generation
- [x] Dashboard shell with event switcher & stat cards
- [x] Public event website (`/e/[slug]`) with 5 themes + countdown
- [x] Landing page with pricing, features, testimonials
- [x] Sidebar navigation (10 items, some "coming soon")
- [x] Mobile: login, dashboard, tab navigation (5 tabs)
- [x] DB migration script with 16 tables
- [x] Middleware route protection (Edge-safe split config)

---

## Phase 2 — Core CRUD (Guests, Budget, Vendors, Timeline)

> Priority: HIGH — bread-and-butter features every event needs.

### 2A. Guest Management
**Web + Mobile | Tables: `wp_guests`, `wp_rsvps`**

- [ ] `GET /api/guests?eventId=X` — list guests with RSVP status
- [ ] `POST /api/guests` — add single guest (name, email, phone, group_tag, meal_pref, plus_one)
- [ ] `PUT /api/guests/:id` — edit guest details
- [ ] `DELETE /api/guests/:id` — remove guest (wp_ prefix, safe)
- [ ] `POST /api/guests/import` — bulk import from CSV/paste
- [ ] Wire up web `/guests` page with real data, filters (all/confirmed/pending/declined), search
- [ ] Group tags: family, friends, work, VIP, ninongs & ninangs
- [ ] Guest count stats on dashboard (confirmed vs total)
- [ ] Mobile: wire `/guests` tab to API

### 2B. RSVP System
**Web + Mobile | Tables: `wp_rsvps`**

- [ ] `POST /api/rsvp` — guest submits RSVP (via token from public event page)
- [ ] `GET /api/rsvp/:token` — fetch RSVP form for guest
- [ ] Generate unique RSVP tokens per guest (for email/SMS links)
- [ ] RSVP form on public event page (`/e/[slug]`) — confirm attendance, meal choice, message
- [ ] RSVP status update notifications (email via Resend)
- [ ] Dashboard: real-time RSVP tracker widget

### 2C. Budget Tracker
**Web + Mobile | Tables: `wp_budget_items`**

- [ ] `GET /api/budget?eventId=X` — list budget items with totals
- [ ] `POST /api/budget` — add budget item (category, description, estimated, actual, paid)
- [ ] `PUT /api/budget/:id` — update item
- [ ] `DELETE /api/budget/:id` — remove item
- [ ] Categories: venue, catering, photography, flowers, attire, music, decor, transport, misc
- [ ] Budget summary: estimated total vs actual vs paid vs remaining
- [ ] Wire up web `/budget` page with real data, category breakdown
- [ ] Mobile: wire `/budget` tab to API

### 2D. Vendor Management
**Web + Mobile | Tables: `wp_vendors`**

- [ ] `GET /api/vendors?eventId=X` — list vendors
- [ ] `POST /api/vendors` — add vendor (category, business_name, contact, phone, email, amount, deposit, status)
- [ ] `PUT /api/vendors/:id` — update vendor
- [ ] `DELETE /api/vendors/:id` — remove vendor
- [ ] Vendor statuses: contacted, quoted, booked, paid, completed
- [ ] Link vendors to budget items (vendor_id FK)
- [ ] Wire up web `/vendors` page
- [ ] Mobile: wire `/vendors` tab to API

### 2E. Timeline / Day-of Schedule
**Web + Mobile | Tables: `wp_timeline_events`**

- [ ] `GET /api/timeline?eventId=X` — list timeline items ordered by time
- [ ] `POST /api/timeline` — add timeline item (time, title, location, assignee, notes)
- [ ] `PUT /api/timeline/:id` — update item
- [ ] `DELETE /api/timeline/:id` — remove item
- [ ] Drag-to-reorder (update `order_index`)
- [ ] Wire up web `/timeline` page
- [ ] Mobile: wire `/timeline` tab to API

---

## Phase 3 — Checklist & Seating

### 3A. Event Checklist
**Web + Mobile | Table: `wp_checklist_items`**

- [ ] `GET /api/checklist?eventId=X` — list items grouped by category
- [ ] `POST /api/checklist` — add item (title, category, due_date, notes)
- [ ] `PUT /api/checklist/:id` — update / toggle done
- [ ] `DELETE /api/checklist/:id` — remove item
- [ ] `POST /api/checklist/template` — populate from event-type template (wedding = 80+ items, debut = 40+)
- [ ] Categories: 12 months out, 9 months, 6 months, 3 months, 1 month, 1 week, day-of
- [ ] Pin important items
- [ ] Progress bar on dashboard
- [ ] Web page: `/checklist`
- [ ] Mobile: new tab or screen

### 3B. Seating Planner
**Web only (visual canvas) | Tables: `wp_tables`, `wp_seat_assignments`**

- [ ] `GET /api/seating?eventId=X` — list tables with assigned guests
- [ ] `POST /api/tables` — add table (name, capacity)
- [ ] `PUT /api/tables/:id` — rename / resize
- [ ] `DELETE /api/tables/:id` — remove table
- [ ] `POST /api/seating/assign` — assign guest to table
- [ ] `DELETE /api/seating/assign/:id` — unassign
- [ ] Drag-and-drop visual canvas (HTML5 drag or react-dnd)
- [ ] Unassigned guests sidebar
- [ ] Table capacity warnings
- [ ] Web page: `/seating`
- [ ] Mobile: read-only view of assignments

---

## Phase 4 — Saya Shots (Photo Sharing) ⭐

> Unique differentiator. Guests scan QR → take photos → all photos go to couple's album. After the event, couple "reveals" all photos to everyone.

**Web + Mobile | Tables: `wp_photo_sessions`, `wp_photos` | Storage: Cloudinary**

### 4A. Session Management (Couple/Planner side)
- [ ] `POST /api/shots/sessions` — create photo session (session_name, event_id)
- [ ] `GET /api/shots/sessions?eventId=X` — list sessions
- [ ] `PUT /api/shots/sessions/:id` — update session (toggle active, set reveal_at)
- [ ] Generate unique QR code per session (encodes URL: `/shots/[qr_token]`)
- [ ] QR code display/download (PNG, printable for table cards)
- [ ] Photo moderation: approve/hide photos before reveal
- [ ] Reveal toggle: make all photos visible to all guests
- [ ] Web page: `/shots` (manage sessions, view photos grid)

### 4B. Guest Camera (Public side — no auth)
- [ ] Public page: `/shots/[qr_token]` — no login required
- [ ] Guest enters their name (stored with each photo)
- [ ] Camera access via browser (MediaDevices API / `<input type="file" capture>`)
- [ ] Upload to Cloudinary folder: `saya/events/{event_id}/shots/{session_id}/`
- [ ] Save metadata to `wp_photos` (cloudinary_public_id, cloudinary_url, guest_name)
- [ ] Real-time photo feed (couple sees new photos as they come in)
- [ ] Mobile app: dedicated "Saya Shots" tab with native camera integration

### 4C. Post-Event Gallery
- [ ] `/shots/[qr_token]/gallery` — view all revealed photos
- [ ] Download individual photos (Cloudinary transformations for quality)
- [ ] Download all as ZIP (Cloudinary bulk download or server-side zip)
- [ ] Share to social media

---

## Phase 5 — Event Website Builder

> Enhance the existing `/e/[slug]` public page into a full website builder.

**Web | Table: `wp_wedding_pages`**

- [ ] Web page: `/website` — WYSIWYG-ish editor for couple's event page
- [ ] Sections (toggleable):
  - [ ] Hero with cover photo (upload to Cloudinary)
  - [ ] Our Story (rich text)
  - [ ] Event Schedule (ceremony, reception, after-party with times & venues)
  - [ ] Gallery (photo grid, upload to Cloudinary)
  - [ ] RSVP form (connected to `wp_rsvps`)
  - [ ] Gift Registry / Cash Gift (GCash QR, bank details)
  - [ ] Guestbook (messages from guests)
  - [ ] Entourage (wedding party list)
- [ ] 5 themes: Classic, Beach, Garden, Boho, Modern (already defined)
- [ ] Custom domain support (already has `wp_events.custom_domain`)
- [ ] Mobile-responsive preview
- [ ] Share link button

---

## Phase 6 — AI Tools

> Smart assistants. Available on Complete & Pro plans.

**Web | No new tables (uses existing data)**

- [ ] `/ai/invitation` — Invitation Writer (input: event type, names, date, tone, language; output: formatted invitation)
- [ ] `/ai/budget` — Budget Advisor (input: total budget, guest count, city; output: category allocation)
- [ ] `/ai/speech` — Speech Writer (input: role, couple names, anecdotes; output: speech draft)
- [ ] `/ai/drinks` — Drinks Calculator (input: guest count, duration; output: bottle counts + cost in ₱)
- [ ] `/ai/timeline` — Timeline Generator (input: ceremony time, reception; output: minute-by-minute schedule)
- [ ] `/ai/seating` — Seating Optimizer (input: guest list + groups, table sizes; output: optimized assignments)

---

## Phase 7 — Payments (PayMongo Placeholder)

> Modular pricing: clients choose what they need. Build UI/structure now, wire PayMongo later.

**Web | Tables: `wp_subscriptions`, `wp_payments`**

### Pricing Model (Per Module)
| Module | Free Tier | Pro (per event) |
|--------|-----------|-----------------|
| Guest Management | Up to 50 guests | Unlimited |
| Budget Tracker | Basic | Full analytics |
| Vendor Management | Up to 5 | Unlimited |
| Checklist | Basic template | AI-powered |
| Seating Planner | Up to 5 tables | Unlimited + AI |
| Event Website | Basic theme | Custom domain + all themes |
| Saya Shots | 50 photos | Unlimited + ZIP download |
| AI Tools | — | All 6 tools |

- [ ] `/pricing` page with module picker
- [ ] `POST /api/payments/checkout` — PayMongo placeholder (returns mock session)
- [ ] `POST /api/payments/webhook` — PayMongo webhook handler (placeholder)
- [ ] Module access check middleware (check `wp_subscriptions.modules` JSONB)
- [ ] Subscription management page in dashboard
- [ ] GCash QR payment flow (PayMongo GCash source)

---

## Phase 8 — Mobile Feature Parity

> Bring mobile up to speed with web features.

- [ ] Guest CRUD screens (add/edit/delete)
- [ ] Budget CRUD screens
- [ ] Vendor CRUD screens
- [ ] Timeline CRUD screens
- [ ] Checklist screen
- [ ] Saya Shots: native camera + upload flow
- [ ] Push notifications (Expo Notifications) for RSVP updates
- [ ] Offline support with AsyncStorage queue (sync when online)
- [ ] Deep linking for QR codes (open Saya Shots in app if installed)

---

## Database Rules (CRITICAL)

1. **Prefix**: ALL tables use `wp_` prefix
2. **Shared DB**: Other apps' tables exist — do NOT touch them
3. **NO DROP/DELETE** on non-wp_ tables — only CREATE and ALTER on wp_ tables
4. **DELETE** is only allowed on rows within wp_ tables
5. **Migrations**: Use `web/scripts/migrate.ts` — append-only (no destructive changes)

---

## Environment Variables

> All secrets stored in `web/.env.local` (gitignored — never commit).
> See `web/.env.example` for the template.

```env
DATABASE_URL=           # Aiven PostgreSQL connection string
GOOGLE_CLIENT_ID=       # Google Cloud Console
GOOGLE_CLIENT_SECRET=   # Google Cloud Console
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=           # http://localhost:3000 (dev) or production URL
CLOUDINARY_URL=         # cloudinary://key:secret@cloud
CLOUDINARY_CLOUD_NAME=  # Cloudinary dashboard
CLOUDINARY_API_KEY=     # Cloudinary dashboard
CLOUDINARY_API_SECRET=  # Cloudinary dashboard
RESEND_API_KEY=         # Resend dashboard
PAYMONGO_SECRET_KEY=    # PayMongo dashboard (placeholder for now)
PAYMONGO_PUBLIC_KEY=    # PayMongo dashboard (placeholder for now)
```

---

## Web Route Map

```
/                        Landing page (public)
/login                   Google OAuth
/dashboard               Main dashboard
/guests                  Guest management
/budget                  Budget tracker
/vendors                 Vendor manager
/timeline                Day-of timeline
/checklist               Event checklist
/seating                 Seating planner
/website                 Event page builder
/shots                   Saya Shots manager
/ai                      AI tools hub
/billing                 Plans & payments
/events/new              Create new event

/e/[slug]                Public event website (no login)
/shots/[qr_token]        Public guest camera (no login)
/shots/[qr_token]/gallery  Post-event photo gallery (no login)
/rsvp/[token]            Public RSVP form (no login)
```

---

## Mobile Screen Map

```
Tab 1: Dashboard     — countdown, quick stats, pinned checklist
Tab 2: Guests        — guest list, RSVP status, add guest
Tab 3: Saya Shots    — QR scanner + camera + gallery
Tab 4: Budget        — spend summary, quick-add expense
Tab 5: More          — vendors, checklist, timeline, settings
```

---

## Recommended Build Order

1. **Phase 2** — Core CRUD (Guests → Budget → Vendors → Timeline)
2. **Phase 4** — Saya Shots (unique differentiator, build early)
3. **Phase 3** — Checklist & Seating
4. **Phase 5** — Event Website Builder
5. **Phase 7** — Payments structure
6. **Phase 6** — AI Tools (nice-to-have, build last)
7. **Phase 8** — Mobile parity (ongoing, alongside each phase)
