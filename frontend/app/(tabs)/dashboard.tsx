import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);

  const API = "http://10.0.2.2:5000/api/dashboard";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = await AsyncStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const profileRes = await fetch(`${API}/profile`, { headers });
      const profileData = await profileRes.json();
      setUser(profileData);

      const farmsRes = await fetch(`${API}/farms`, { headers });
      const farmsData = await farmsRes.json();
      setFarms(farmsData.farms);

      if (farmsData.farms.length > 0) {
        const farmId = farmsData.farms[0].id;
        const [cropsRes, actRes] = await Promise.all([
          fetch(`${API}/crops/${farmId}`, { headers }),
          fetch(`${API}/activities/${farmId}`, { headers }),
        ]);
        
        const cropsData = await cropsRes.json();
        const actData = await actRes.json();
        
        setCrops(cropsData.crops);
        setActivities(actData.activities);
      }

      const priceRes = await fetch(`${API}/market-prices`, { headers });
      const priceData = await priceRes.json();
      setPrices(priceData.market_prices);

      setLoading(false);
    } catch (error) {
      console.log("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text style={styles.loadingText}>Growing your data...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || "Farmer"}! 🌿</Text>
            <Text style={styles.subGreeting}>{user?.role} • Optimized for today</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
          </View>
        </View>

        {/* Quick Stats Summary */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statNumber}>{farms.length}</Text>
            <Text style={styles.statLabel}>Farms</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statNumber}>{crops.length}</Text>
            <Text style={styles.statLabel}>Active Crops</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statNumber}>{activities.length}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
        </View>

        {/* Section: Your Farms */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Farms</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {farms.map((farm) => (
            <View key={farm.id} style={styles.farmCard}>
              <View style={styles.farmIconBadge} />
              <Text style={styles.cardTitle}>{farm.name}</Text>
              <Text style={styles.cardSubtitle}>📍 {farm.location}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{farm.fields} Fields</Text></View>
            </View>
          ))}
        </ScrollView>

        {/* Section: Market Trends */}
        <Text style={styles.sectionTitle}>Market Trends</Text>
        <View style={styles.priceContainer}>
          {prices.map((p, index) => (
            <View key={index} style={styles.priceRow}>
              <Text style={styles.priceCrop}>{p.crop}</Text>
              <View style={styles.priceRight}>
                <Text style={styles.priceValue}>₹{p.price}</Text>
                <Text style={styles.priceUnit}>/unit</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Section: Recent Activities */}
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {activities.map((act) => (
          <View key={act.id} style={styles.activityCard}>
            <View style={styles.activityIndicator} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityType}>{act.activity_type}</Text>
              <Text style={styles.activityDesc}>{act.description}</Text>
              <Text style={styles.activityDate}>{act.activity_date}</Text>
            </View>
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#666" },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },
  greeting: { fontSize: 24, fontWeight: "800", color: "#1B5E20" },
  subGreeting: { fontSize: 14, color: "#666", marginTop: 4 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  avatarText: { color: "white", fontSize: 20, fontWeight: "bold" },

  // Stats
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  statCard: { width: "30%", padding: 15, borderRadius: 16, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },

  // Sections
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  seeAll: { color: "#2E7D32", fontWeight: "600" },

  // Farm Cards (Horizontal)
  horizontalScroll: { marginBottom: 25 },
  farmCard: {
    backgroundColor: "white",
    width: 200,
    padding: 20,
    borderRadius: 20,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  farmIconBadge: { width: 40, height: 4, backgroundColor: "#2E7D32", borderRadius: 2, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#555" },

  // Market Prices
  priceContainer: { backgroundColor: "white", borderRadius: 20, padding: 15, marginBottom: 25 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  priceCrop: { fontSize: 15, fontWeight: "600", color: "#444" },
  priceRight: { flexDirection: "row", alignItems: "baseline" },
  priceValue: { fontSize: 16, fontWeight: "bold", color: "#2E7D32" },
  priceUnit: { fontSize: 12, color: "#999", marginLeft: 2 },

  // Activities
  activityCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  activityIndicator: { width: 4, height: 40, backgroundColor: "#A5D6A7", borderRadius: 2, marginRight: 15 },
  activityType: { fontSize: 15, fontWeight: "bold", color: "#333" },
  activityDesc: { fontSize: 13, color: "#666", marginVertical: 2 },
  activityDate: { fontSize: 11, color: "#AAA" },
});