import { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { fetchTimeline } from "@/constants/api";

interface TimelineItem {
  id: string;
  task: string;
  dueDate: string;
  completed: boolean;
  category: string;
}

export default function TimelineScreen() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = items.filter((i) => i.completed).length;
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-gray-500">Progress</Text>
            <Text className="text-xs font-medium text-gray-700">
              {completed}/{items.length} tasks
            </Text>
          </View>
          <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-3 bg-rose-500 rounded-full"
              style={{ width: items.length > 0 ? `${(completed / items.length) * 100}%` : "0%" }}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#be123c" />
        ) : (
          <View className="space-y-4">
            {categories.map((cat) => {
              const catItems = items.filter((i) => i.category === cat);
              return (
                <View key={cat} className="bg-white rounded-xl border border-gray-100 p-4">
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {cat}
                  </Text>
                  <View className="space-y-3">
                    {catItems.map((item) => (
                      <View key={item.id} className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                          <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                            item.completed ? "bg-rose-500 border-rose-500" : "border-gray-300"
                          }`}>
                            {item.completed && (
                              <Text className="text-white text-xs font-bold">✓</Text>
                            )}
                          </View>
                          <Text className={`text-sm flex-1 ${
                            item.completed ? "line-through text-gray-400" : "text-gray-800"
                          }`}>
                            {item.task}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-400 ml-2">{item.dueDate}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
