import { Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: { backgroundColor: "#F8F9FA" },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: "Farms",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="leaf" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mandi"
        options={{
          title: "Mandi",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="chart-line" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}