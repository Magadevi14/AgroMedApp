import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FarmDetails() {
  const { farmId, farmName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const API = `http://10.0.2.2:5000/api/dashboard`;

  useEffect(() => {
    loadFarmDetails();
  }, []);

  const loadFarmDetails = async () => {
    try {
      const cropsRes = await fetch(`${API}/crops/${farmId}`);
      const cropsData = await cropsRes.json();
      setCrops(cropsData.crops || []);

      const actRes = await fetch(`${API}/activities/${farmId}`);
      const actData = await actRes.json();
      setActivities(actData.activities || []);

      setLoading(false);
    } catch (err) {
      console.log("Error loading farm details:", err);
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading farm details...</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>{farmName}</Text>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#2E7D32" }]}
            onPress={() => router.push(`/add-crop.tsx`)}
          >
            <Text style={styles.buttonText}>Add Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#FFA726" }]}
            onPress={() => router.push(`/add-activity?farmId=${farmId}`)}
          >
            <Text style={styles.buttonText}>Add Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Crops List */}
        <Text style={styles.sectionTitle}>Crops</Text>
        {crops.length === 0 ? (
          <Text style={styles.emptyText}>No crops added yet.</Text>
        ) : (
          crops.map((crop) => (
            <View key={crop.id} style={styles.card}>
              <Text style={styles.cardTitle}>{crop.name}</Text>
              <Text style={styles.cardSubtitle}>Planted: {formatDate(crop.planting_date)}</Text>
            </View>
          ))
        )}

        {/* Recent Activities */}
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>No activities recorded.</Text>
        ) : (
          activities.slice(0, 3).map((act) => (
            <View key={act.id} style={styles.card}>
              <Text style={styles.cardTitle}>{act.activity_type}</Text>
              <Text style={styles.cardSubtitle}>{act.description}</Text>
              <Text style={styles.date}>{formatDate(act.activity_date)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", color: "#1B5E20", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginVertical: 10 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  date: { fontSize: 12, color: "#999", marginTop: 4 },
  emptyText: { color: "#888", fontStyle: "italic", marginBottom: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#666" },
});