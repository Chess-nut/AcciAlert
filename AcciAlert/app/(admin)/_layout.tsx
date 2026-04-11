import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminLayout() {
  const router = useRouter();
  const [accessState, setAccessState] = useState<"checking" | "granted" | "denied">("checking");

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        const isAdmin = await AsyncStorage.getItem("isAdmin");
        if (mounted && isAdmin === "true") {
          setAccessState("granted");
          return;
        }

        if (mounted) {
          setAccessState("denied");
          router.replace("/login" as any);
        }
      } catch {
        if (mounted) {
          setAccessState("denied");
          router.replace("/login" as any);
        }
      }
    };

    void checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (accessState !== "granted") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#111827" }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#a0a8b8",
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "#1f2937",
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="AdminDashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="UserList"
        options={{
          title: "User List",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AdminSettings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
