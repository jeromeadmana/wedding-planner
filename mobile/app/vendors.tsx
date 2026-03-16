import { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { fetchVendors } from "@/constants/api";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  price: number;
  booked: boolean;
  notes: string;
}

export default function VendorsScreen() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors()
      .then(setVendors)
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {loading ? (
          <ActivityIndicator color="#be123c" />
        ) : (
          <View className="space-y-4">
            {vendors.map((vendor) => (
              <View key={vendor.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="font-semibold text-gray-900 text-base">{vendor.name}</Text>
                    <Text className="text-sm text-gray-500">{vendor.category}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${vendor.booked ? "bg-green-100" : "bg-gray-100"}`}>
                    <Text className={`text-xs font-medium ${vendor.booked ? "text-green-700" : "text-gray-500"}`}>
                      {vendor.booked ? "Booked" : "Pending"}
                    </Text>
                  </View>
                </View>

                <View className="space-y-1">
                  <Text className="text-sm text-gray-600">👤 {vendor.contact}</Text>
                  <Text className="text-sm text-gray-600">✉️ {vendor.email}</Text>
                  <Text className="text-sm text-gray-600">📞 {vendor.phone}</Text>
                  <Text className="text-sm font-semibold text-gray-900 mt-2">
                    💰 ${vendor.price.toLocaleString()}
                  </Text>
                </View>

                {vendor.notes ? (
                  <Text className="text-xs text-gray-400 italic mt-2">{vendor.notes}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
