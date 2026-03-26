import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const emergencyItems = [
    { label: "Police", number: "911", icon: "police-badge", color: "#1565C0" },
    { label: "Ambulance", number: "911", icon: "medical-bag", color: "#2E7D32" },
    { label: "Fire Dept", number: "911", icon: "fire-truck", color: "#B71C1C" },
  ];

  const quickStats = [
    { number: "5", label: "Total Reports", icon: "file-document-multiple" },
    { number: "2", label: "Resolved", icon: "check-circle" },
    { number: "40%", label: "Success Rate", icon: "chart-line" },
  ];

  const handleCall = (number: string, label: string) => {
    Alert.alert(
      `Call ${label}`,
      `Do you want to call ${number}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => Linking.openURL(`tel:${number}`) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="shield-check" size={44} color="#B71C1C" />
          </View>
          <View>
            <Text style={styles.appName}>AcciAlert</Text>
            <Text style={styles.tagline}>Road Safety Response</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.sosButton} onPress={() => handleCall("911", "Emergency")}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#fff" />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        {quickStats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <MaterialCommunityIcons name={stat.icon as any} size={22} color="#B71C1C" />
            <Text style={styles.statNumber}>{stat.number}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Emergency Dial */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Emergency Dial</Text>
        {emergencyItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.emergencyButton, { backgroundColor: item.color }]}
            onPress={() => handleCall(item.number, item.label)}
            activeOpacity={0.85}
          >
            <View style={styles.emergencyIconWrapper}>
              <MaterialCommunityIcons name={item.icon as any} size={26} color="#fff" />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyLabel}>{item.label}</Text>
              <Text style={styles.emergencyNumber}>Tap to call {item.number}</Text>
            </View>
            <MaterialCommunityIcons name="phone" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/reports')}>
            <MaterialCommunityIcons name="plus-circle" size={32} color="#B71C1C" />
            <Text style={styles.actionLabel}>Report Incident</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/map')}>
            <MaterialCommunityIcons name="map-marker-radius" size={32} color="#B71C1C" />
            <Text style={styles.actionLabel}>View Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/contacts')}>
            <MaterialCommunityIcons name="phone-in-talk" size={32} color="#B71C1C" />
            <Text style={styles.actionLabel}>Contacts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/profile')}>
            <MaterialCommunityIcons name="account-cog" size={32} color="#B71C1C" />
            <Text style={styles.actionLabel}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Alert Banner */}
      <View style={styles.alertBanner}>
        <MaterialCommunityIcons name="alert" size={20} color="#fff" />
        <Text style={styles.alertText}>
          Active incident on Gen. Luna St. — Multi-vehicle collision
        </Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    backgroundColor: "#fff5f5",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffcdd2",
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  sosButton: {
    backgroundColor: "#B71C1C",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    elevation: 3,
  },
  sosText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#B71C1C",
  },
  statLabel: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  emergencyButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  emergencyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyLabel: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  emergencyNumber: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  alertBanner: {
    backgroundColor: "#E53935",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
});