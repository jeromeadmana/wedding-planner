"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  href: string
  label: string
  icon: string
  soon?: boolean
}

const navItems: NavItem[] = [
  { href: "/dashboard",        label: "Dashboard",     icon: "▦" },
  { href: "/guests",           label: "Guests",        icon: "👥" },
  { href: "/budget",           label: "Budget",        icon: "₱" },
  { href: "/vendors",          label: "Vendors",       icon: "🏪" },
  { href: "/timeline",         label: "Timeline",      icon: "📅" },
  { href: "/checklist",        label: "Checklist",     icon: "✓", soon: true },
  { href: "/seating",          label: "Seating",       icon: "🪑", soon: true },
  { href: "/website",          label: "Event Website", icon: "🌐", soon: true },
  { href: "/shots",            label: "Saya Shots",    icon: "📷" },
  { href: "/ai",               label: "AI Tools",      icon: "✨", soon: true },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-display font-bold text-white tracking-wide">Saya</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon, soon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={soon ? "#" : href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              } ${soon ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span className="w-5 text-center text-base leading-none">{icon}</span>
              <span className="flex-1">{label}</span>
              {soon && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white/70 font-normal">
                  soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <span className="w-5 text-center">↩</span>
            Sign out
          </button>
        </form>
        <p className="mt-3 text-center text-white/30 text-xs">© 2025 Saya</p>
      </div>
    </aside>
  )
}
