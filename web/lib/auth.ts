import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { pool } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      // Upsert user into wp_users — only on sign-in
      await pool.query(
        `INSERT INTO wp_users (email, name, avatar)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE
           SET name   = EXCLUDED.name,
               avatar = EXCLUDED.avatar`,
        [user.email, user.name ?? null, user.image ?? null]
      )
      return true
    },
    async jwt({ token, trigger }) {
      // Only hit the DB when the token is first created (sign-in)
      if (trigger === "signIn" && token.email) {
        const { rows } = await pool.query<{ id: string }>(
          "SELECT id FROM wp_users WHERE email = $1",
          [token.email]
        )
        token.userId = rows[0]?.id ?? null
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = (token.userId as string) ?? ""
      return session
    },
  },
})
