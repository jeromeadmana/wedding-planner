import { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { fetchBudget } from "@/constants/api";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimated: number;
  actual: number;
  paid: boolean;
}

export default function BudgetScreen() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const totalEstimated = items.reduce((s, i) => s + i.estimated, 0);
  const totalActual = items.reduce((s, i) => s + i.actual, 0);
  const pct = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row gap-3 mb-4">
          {[
            { label: "Budget", value: totalEstimated, color: "text-gray-900" },
            { label: "Spent", value: totalActual, color: "text-rose-600" },
          ].map(({ label, value, color }) => (
            <View key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex-1">
              <Text className="text-xs text-gray-500">{label}</Text>
              <Text className={`text-xl font-bold ${color}`}>${value.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-gray-500">Budget used</Text>
            <Text className="text-xs font-medium text-gray-700">{pct}%</Text>
          </View>
          <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <View className="h-3 bg-rose-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#be123c" />
        ) : (
          <View className="space-y-3">
            {items.map((item) => (
              <View key={item.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="font-semibold text-gray-900">{item.category}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${item.paid ? "bg-green-100" : "bg-gray-100"}`}>
                    <Text className={`text-xs font-medium ${item.paid ? "text-green-700" : "text-gray-500"}`}>
                      {item.paid ? "Paid" : "Unpaid"}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-500 mb-2">{item.description}</Text>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Est: ${item.estimated.toLocaleString()}</Text>
                  <Text className="text-xs text-gray-600 font-medium">
                    Actual: {item.actual > 0 ? `$${item.actual.toLocaleString()}` : "—"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
