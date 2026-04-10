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
    { emoji: "🚨", label: "Emergency 911", number: "911" },
    { emoji: "👮", label: "Police", number: "117" },
    { emoji: "🚒", label: "Fire Dept", number: "116" },
    { emoji: "🚑", label: "Ambulance", number: "143" },
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

  const handleDial = (number: string) => {
    console.log(number);
  };

  const styles = StyleSheet.create({
    containerWrapper: {
      flex: 1,
    },
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
    quickDialContainer: {
      backgroundColor: "#fff1f1",
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "#ef9a9a",
      padding: 14,
    },
    quickDialHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    quickDialTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1a1a1a",
    },
    quickDialGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    emergencyButton: {
      width: "48%",
      minHeight: 120,
      backgroundColor: "#fff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#f0f0f0",
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    emergencyEmoji: {
      fontSize: 30,
      lineHeight: 34,
    },
    emergencyLabel: {
      color: "#444",
      fontWeight: "600",
      fontSize: 12,
      textAlign: "center",
    },
    emergencyNumber: {
      color: "#B71C1C",
      fontSize: 14,
      fontWeight: "800",
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
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#B71C1C",
      justifyContent: "center",
      alignItems: "center",
      elevation: 8,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });

  return (
    <View style={styles.containerWrapper}>
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
        <View style={styles.quickDialContainer}>
          <View style={styles.quickDialHeader}>
            <MaterialCommunityIcons name="phone" size={20} color="#B71C1C" />
            <Text style={styles.quickDialTitle}>Quick Emergency Dial</Text>
          </View>

          <View style={styles.quickDialGrid}>
            {emergencyItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.emergencyButton}
                onPress={() => handleDial(item.number)}
                activeOpacity={0.85}
              >
                <Text style={styles.emergencyEmoji}>{item.emoji}</Text>
                <Text style={styles.emergencyLabel}>{item.label}</Text>
                <Text style={styles.emergencyNumber}>{item.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
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

    <TouchableOpacity style={styles.fab} onPress={() => router.push('/reportincident')}>
      <MaterialCommunityIcons name="plus" size={32} color="#fff" />
    </TouchableOpacity>
    </View>
  );
}