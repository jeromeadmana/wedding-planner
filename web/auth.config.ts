import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Edge-safe auth config — NO imports from lib/db.ts or any Node.js-only module.
// Used by middleware.ts which runs in Edge Runtime.
export const authConfig: NextAuthConfig = {
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/events")
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl))
      }
      return true
    },
  },
}
