import { ScrollView, Text, View, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useAuth } from "../context/auth"

const BRAND = "#be185d"

export default function DashboardScreen() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const statCards = [
    { label: "Guests",   value: "—", sub: "add your first",  route: "/guests",   bg: "#fdf2f8", accent: BRAND },
    { label: "Budget",   value: "₱0", sub: "tracked",        route: "/budget",   bg: "#fff7ed", accent: "#f97316" },
    { label: "Vendors",  value: "—", sub: "add vendors",      route: "/vendors",  bg: "#f0fdf4", accent: "#15803d" },
    { label: "Tasks",    value: "—", sub: "set up checklist", route: "/timeline", bg: "#eff6ff", accent: "#1d4ed8" },
  ]

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <StatusBar style="light" />

      {/* Welcome banner */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-neutral-900">
          Welcome, {user?.name?.split(" ")[0] ?? "there"} 🌸
        </Text>
        <Text className="text-neutral-500 text-sm mt-0.5">
          Your event overview
        </Text>
      </View>

      {/* Create event CTA */}
      <TouchableOpacity
        className="mx-4 mt-3 rounded-xl p-4 flex-row items-center gap-3"
        style={{ backgroundColor: BRAND }}
        activeOpacity={0.9}
      >
        <Text className="text-white text-2xl">+</Text>
        <View>
          <Text className="text-white font-semibold">Create your event</Text>
          <Text className="text-white/70 text-xs">Set up your event on the web dashboard</Text>
        </View>
      </TouchableOpacity>

      {/* Stats grid */}
      <View className="flex-row flex-wrap gap-3 px-4 mt-4">
        {statCards.map(({ label, value, sub, route, bg, accent }) => (
          <TouchableOpacity
            key={label}
            className="rounded-xl p-4 flex-1 min-w-[45%]"
            style={{ backgroundColor: bg }}
            onPress={() => router.push(route as never)}
            activeOpacity={0.8}
          >
            <Text className="text-xs text-neutral-500 mb-1">{label}</Text>
            <Text className="text-2xl font-bold" style={{ color: accent }}>{value}</Text>
            <Text className="text-xs text-neutral-400 mt-0.5">{sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Placeholder sections */}
      <View className="mx-4 mt-4 bg-white rounded-xl border border-neutral-100 p-4 mb-4">
        <Text className="font-semibold text-neutral-800 mb-1">Recent RSVPs</Text>
        <Text className="text-sm text-neutral-400">
          RSVPs will appear here once you set up your guest list on the web dashboard.
        </Text>
      </View>

      <TouchableOpacity
        onPress={signOut}
        className="mx-4 mb-8 py-3 rounded-xl border border-neutral-200 items-center"
        activeOpacity={0.8}
      >
        <Text className="text-sm text-neutral-500">Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
