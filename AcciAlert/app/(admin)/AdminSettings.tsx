import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseconfig";

export default function AdminSettingsScreen() {
  const router = useRouter();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [disableNewReports, setDisableNewReports] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await signOut(auth).catch(() => {
        // Admin shortcut may not have an auth session; ignore signout errors.
      });
      await AsyncStorage.multiRemove(["isAdmin", "adminSession"]);
    } catch (error) {
      console.error("Admin logout error:", error);
    } finally {
      setIsLoggingOut(false);
      router.replace("/login" as any);
    }
  };

  const handleLogout = () => {
    if (isLoggingOut) return;

    Alert.alert(
      "Exit Admin Panel",
      "Are you sure you want to exit the Admin Panel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => void performLogout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#CC0000" />
            </View>
            <Text style={styles.sectionTitle}>Admin Profile</Text>
          </View>

          <Text style={styles.profileName}>System Administrator</Text>
          <Text style={styles.profileEmail}>acciaclert123</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="cog" size={20} color="#CC0000" />
            </View>
            <Text style={styles.sectionTitle}>App Control</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Maintenance Mode</Text>
              <Text style={styles.toggleSubtitle}>Temporarily restrict normal app usage.</Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: "#374151", true: "#7f1d1d" }}
              thumbColor={maintenanceMode ? "#CC0000" : "#e5e7eb"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Disable New Reports</Text>
              <Text style={styles.toggleSubtitle}>Stop users from submitting fresh incidents.</Text>
            </View>
            <Switch
              value={disableNewReports}
              onValueChange={setDisableNewReports}
              trackColor={{ false: "#374151", true: "#7f1d1d" }}
              thumbColor={disableNewReports ? "#CC0000" : "#e5e7eb"}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapDanger}>
              <MaterialCommunityIcons name="logout" size={20} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && { opacity: 0.7 }]}
            onPress={handleLogout}
            activeOpacity={0.85}
            disabled={isLoggingOut}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#fff" />
            <Text style={styles.logoutText}>{isLoggingOut ? "Logging out..." : "Logout of Admin Panel"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121826" },
  header: {
    backgroundColor: "#121826",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#20283a",
  },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSpacer: { width: 40, height: 40 },
  content: { padding: 16, gap: 14 },
  card: {
    backgroundColor: "#1B2230",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#273042",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#121826",
    borderWidth: 1,
    borderColor: "#2a3448",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapDanger: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#CC0000",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: { color: "#fff", fontSize: 15, fontWeight: "800" },
  profileName: { color: "#fff", fontSize: 18, fontWeight: "800" },
  profileEmail: { marginTop: 4, color: "#9ca3af", fontSize: 13 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  toggleSubtitle: { marginTop: 4, color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  divider: { height: 1, backgroundColor: "#273042", marginVertical: 14 },
  logoutButton: {
    backgroundColor: "#CC0000",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});