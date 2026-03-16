import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { useAuth } from "../context/auth"
import { StatusBar } from "expo-status-bar"

export default function LoginScreen() {
  const { signIn, loading } = useAuth()

  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <StatusBar style="dark" />

      {/* Brand */}
      <Text className="text-5xl mb-3">🌸</Text>
      <Text className="text-4xl font-bold text-neutral-900 mb-1">Saya</Text>
      <Text className="text-neutral-500 text-sm mb-12">Plan your event. Feel the saya.</Text>

      {loading ? (
        <ActivityIndicator color="#be185d" size="large" />
      ) : (
        <TouchableOpacity
          onPress={signIn}
          className="w-full flex-row items-center justify-center gap-3 bg-white border border-neutral-200 rounded-xl py-4 px-6 shadow-sm"
          activeOpacity={0.8}
        >
          {/* Google logo */}
          <Text className="text-lg">G</Text>
          <Text className="text-neutral-700 font-medium">Continue with Google</Text>
        </TouchableOpacity>
      )}

      <Text className="mt-8 text-xs text-neutral-400 text-center">
        By signing in you agree to our terms of service.{"\n"}
        Free up to 30 guests — no card required.
      </Text>
    </View>
  )
}
