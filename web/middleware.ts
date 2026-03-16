import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Use the Edge-safe config only — no pg/Node.js imports here
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
