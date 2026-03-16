import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import * as WebBrowser from "expo-web-browser"
import { API_BASE_URL } from "../constants/api"

export default function PhotosScreen() {
  const webUrl = API_BASE_URL.replace("/api", "")

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <View className="items-center mb-8">
          <Text className="text-5xl mb-4">📷</Text>
          <Text className="text-2xl font-bold text-neutral-800 mb-2">Saya Shots</Text>
          <Text className="text-neutral-500 text-center text-sm leading-relaxed max-w-xs">
            Capture every moment. Share QR codes with your guests and collect all event photos in one place.
          </Text>
        </View>

        <TouchableOpacity
          className="bg-pink-700 rounded-xl py-4 px-6 items-center mb-4"
          onPress={() => WebBrowser.openBrowserAsync(`${webUrl}/shots`)}
        >
          <Text className="text-white font-semibold text-base">Manage Photo Sessions</Text>
          <Text className="text-pink-200 text-xs mt-1">Open in browser</Text>
        </TouchableOpacity>

        <View className="bg-pink-50 rounded-xl p-5 border border-pink-100">
          <Text className="font-semibold text-neutral-700 mb-2">How it works</Text>
          <View className="space-y-3">
            <View className="flex-row items-start gap-3">
              <Text className="text-lg">1.</Text>
              <Text className="text-sm text-neutral-600 flex-1">Create a photo session from the dashboard</Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg">2.</Text>
              <Text className="text-sm text-neutral-600 flex-1">Share the QR code with your guests</Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg">3.</Text>
              <Text className="text-sm text-neutral-600 flex-1">Guests scan and take photos — no app needed</Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg">4.</Text>
              <Text className="text-sm text-neutral-600 flex-1">Reveal all photos after the event!</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
