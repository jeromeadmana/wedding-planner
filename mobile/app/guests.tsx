import { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { fetchGuests } from "@/constants/api";

interface Guest {
  id: string;
  name: string;
  email: string;
  rsvp: "pending" | "confirmed" | "declined";
  plusOne: boolean;
  tableNumber?: number;
}

export default function GuestsScreen() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests()
      .then(setGuests)
      .catch(() => setGuests([]))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = guests.filter((g) => g.rsvp === "confirmed").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const declined = guests.filter((g) => g.rsvp === "declined").length;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row gap-3 mb-6">
          {[
            { label: "Confirmed", value: confirmed, color: "text-green-600", bg: "bg-green-50" },
            { label: "Pending", value: pending, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Declined", value: declined, color: "text-red-600", bg: "bg-red-50" },
          ].map(({ label, value, color, bg }) => (
            <View key={label} className={`${bg} rounded-xl p-4 flex-1`}>
              <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
              <Text className="text-xs text-gray-500">{label}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#be123c" />
        ) : (
          <View className="space-y-3">
            {guests.map((guest) => (
              <View key={guest.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="font-semibold text-gray-900">{guest.name}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${
                    guest.rsvp === "confirmed" ? "bg-green-100" :
                    guest.rsvp === "declined" ? "bg-red-100" : "bg-yellow-100"
                  }`}>
                    <Text className={`text-xs font-medium ${
                      guest.rsvp === "confirmed" ? "text-green-700" :
                      guest.rsvp === "declined" ? "text-red-700" : "text-yellow-700"
                    }`}>{guest.rsvp}</Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-sm">{guest.email}</Text>
                <View className="flex-row gap-4 mt-2">
                  <Text className="text-xs text-gray-400">+1: {guest.plusOne ? "Yes" : "No"}</Text>
                  {guest.tableNumber && (
                    <Text className="text-xs text-gray-400">Table {guest.tableNumber}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
