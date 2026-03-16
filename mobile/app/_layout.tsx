import "../global.css"
import { Tabs, Redirect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { View, ActivityIndicator } from "react-native"
import { AuthProvider, useAuth } from "../context/auth"

type IoniconName = React.ComponentProps<typeof Ionicons>["name"]

const BRAND = "#be185d"

const tabs: { name: string; title: string; icon: IoniconName; activeIcon: IoniconName }[] = [
  { name: "index",    title: "Dashboard",   icon: "home-outline",       activeIcon: "home" },
  { name: "guests",   title: "Guests",      icon: "people-outline",     activeIcon: "people" },
  { name: "budget",   title: "Budget",      icon: "wallet-outline",     activeIcon: "wallet" },
  { name: "vendors",  title: "Vendors",     icon: "storefront-outline", activeIcon: "storefront" },
  { name: "timeline", title: "Timeline",    icon: "calendar-outline",   activeIcon: "calendar" },
]

function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/login" />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: "#a1a1aa",
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#f4f4f5" },
        headerStyle: { backgroundColor: BRAND },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        headerTitle: "🌸 Saya",
      }}
    >
      {tabs.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? activeIcon : icon} size={size} color={color} />
            ),
          }}
        />
      ))}
      {/* Hide login from tab bar */}
      <Tabs.Screen name="login" options={{ href: null }} />
    </Tabs>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}
