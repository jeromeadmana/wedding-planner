# Wedding Planner

A full-stack wedding planning app with a **web dashboard** and **mobile app**.

## Project Structure

```
wedding-planner/
├── web/      # Next.js 14 + Tailwind CSS (web dashboard + API)
└── mobile/   # React Native + Expo (iOS & Android)
```

---

## Web App

**Stack:** Next.js 14 (App Router), Tailwind CSS, TypeScript

### Setup & Run

```bash
cd web
npm install
npm run dev
```

Opens at **http://localhost:3000**

### Pages

| Route | Description |
|---|---|
| `/` | Dashboard with stats overview |
| `/guests` | Guest list with RSVP status |
| `/budget` | Budget tracker with progress bar |
| `/vendors` | Vendor cards |
| `/timeline` | Checklist grouped by category |

### API Routes

| Endpoint | Methods |
|---|---|
| `/api/guests` | GET, POST |
| `/api/budget` | GET, POST |
| `/api/vendors` | GET, POST |
| `/api/timeline` | GET, POST |

---

## Mobile App

**Stack:** React Native, Expo SDK 51, Expo Router, NativeWind (Tailwind)

### Setup & Run

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `i` for iOS simulator / `a` for Android emulator.

### Screens

- Dashboard, Guests, Budget, Vendors, Timeline (tab navigation)

### API Connection

The mobile app calls the web API at `http://localhost:3000/api`.
For Android emulator, update `constants/api.ts` to use `http://10.0.2.2:3000/api`.

---

## Data

The web app uses an in-memory store (`web/lib/db.ts`) seeded with sample data. Replace with a real database (PostgreSQL, SQLite, etc.) as needed.
