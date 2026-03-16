import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"

export const metadata: Metadata = {
  title: { default: "Saya", template: "%s · Saya" },
  description: "Plan your event. Feel the saya.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
