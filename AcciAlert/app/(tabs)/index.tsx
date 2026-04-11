import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, limit, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseconfig";

type RecentReport = {
  id: string;
  emoji: string;
  incidentType: string;
  status: string;
  severity: string;
  imageUri?: string | null;
  description: string;
  address: string;
  fullName: string;
  contactNumber: string;
  timeAgo: string;
};

type FirestoreReport = {
  incidentType?: string;
  status?: string;
  severity?: string;
  imageUri?: string | null;
  description?: string;
  location?: {
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  reporterName?: string;
  contactNumber?: string;
  timestamp?: Timestamp;
};

export default function HomeScreen() {
  const router = useRouter();
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [totalReports, setTotalReports] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callerNumber, setCallerNumber] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emergencyItems = [
    { emoji: "🚨", label: "Emergency 911", number: "911" },
    { emoji: "👮", label: "Police", number: "117" },
    { emoji: "🚒", label: "Fire Dept", number: "116" },
    { emoji: "🚑", label: "Ambulance", number: "143" },
  ];

  // ─── Real-time listener: fetch all public reports ──────────────────────────
  useEffect(() => {
    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("timestamp", "desc"),
      limit(8)
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((reportDoc) => {
          const data = reportDoc.data() as FirestoreReport;
          const incidentType = data.incidentType ?? "Incident";
          const normalizedSeverity = normalizeSeverity(data.severity);

          // Use the human-readable address if available, otherwise fall back to coords
          const location = data.location;
          let addressText = "Location not specified";
          if (location?.address && location.address.trim().length > 0) {
            addressText = location.address.trim();
          } else if (typeof location?.latitude === "number" && typeof location?.longitude === "number") {
            addressText = `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
          }

          return {
            id: reportDoc.id,
            emoji: getIncidentEmoji(incidentType),
            incidentType,
            status: data.status ?? "Pending",
            severity: normalizedSeverity,
            imageUri: typeof data.imageUri === "string" && data.imageUri.trim().length > 0 ? data.imageUri.trim() : null,
            description: data.description?.trim() || "No description provided.",
            address: addressText,
            fullName: data.reporterName?.trim() || "Anonymous",
            contactNumber: data.contactNumber?.trim() || "No contact",
            timeAgo: formatTimeAgo(data.timestamp),
          };
        });

        setRecentReports(items);
        setTotalReports(snapshot.size);
        setReportsLoading(false);
      },
      (error) => {
        console.warn("Failed to load recent reports:", error);
        setReportsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isCallActive || !isConnected) {
      return;
    }

    const timer = setInterval(() => {
      setCallSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCallActive, isConnected]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const startDummyCall = (name: string, number: string) => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    setCallerName(name);
    setCallerNumber(number);
    setCallSeconds(0);
    setIsConnected(false);
    setIsCallActive(true);

    connectionTimeoutRef.current = setTimeout(() => {
      setIsConnected(true);
      connectionTimeoutRef.current = null;
    }, 1200);
  };

  const endDummyCall = () => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    setIsCallActive(false);
    setIsConnected(false);
    setCallerName("");
    setCallerNumber("");
    setCallSeconds(0);
  };

  const formatCallTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const getIncidentEmoji = (incidentType: string) => {
    const n = incidentType.toLowerCase();
    if (n.includes("traffic accident")) return "🚗";
    if (n.includes("fire")) return "🔥";
    if (n.includes("pothole")) return "🛣️";
    if (n.includes("flood")) return "🌊";
    if (n.includes("debris")) return "🚧";
    if (n.includes("broken")) return "🚦";
    return "⚠️";
  };

  const normalizeSeverity = (severity?: string) => {
    const v = severity?.toLowerCase() ?? "";
    if (v.includes("critical")) return "Critical";
    if (v.includes("high")) return "High";
    if (v.includes("medium")) return "Medium";
    if (v.includes("low")) return "Low";
    return "High";
  };

  const formatTimeAgo = (timestamp?: Timestamp) => {
    if (!timestamp) return "just now";
    const now = Date.now();
    const createdAt = timestamp.toDate().getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now - createdAt) / 1000));
    if (elapsedSeconds < 60) return "just now";
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const getSeverityColor = (level: string) => {
    if (level === "Critical") return "#D32F2F";
    if (level === "High") return "#F57C00";
    if (level === "Medium") return "#FBC02D";
    if (level === "Low") return "#1976D2";
    return "#F57C00";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Resolved") return "check-circle";
    if (status === "In Progress") return "progress-clock";
    return "timer-sand";
  };

  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.containerWrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
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
        </View>

        {/* Stats Row — now live from Firestore */}
        <View style={styles.statsContainer}>
          {[
            { icon: "file-document-multiple", number: String(totalReports), label: "Total Reports" },
            { icon: "check-circle", number: String(recentReports.filter(r => r.status === "Resolved").length), label: "Resolved" },
            { icon: "alert-circle-outline", number: String(recentReports.filter(r => r.status === "Pending").length), label: "Pending" },
          ].map((stat) => (
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
                  onPress={() => startDummyCall(item.label, item.number)}
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

        {/* Recent Reports — live from Firestore, visible to all users */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/reports" as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {reportsLoading ? (
            <Text style={styles.recentMetaText}>Loading recent reports...</Text>
          ) : recentReports.length === 0 ? (
            <Text style={styles.recentMetaText}>No reports yet. Be the first to report!</Text>
          ) : (
            <View style={styles.recentList}>
              {recentReports.map((report) => {
                const severityColor = getSeverityColor(report.severity);
                return (
                  <View key={report.id} style={styles.reportCard}>
                    {/* Card Header */}
                    <View style={styles.reportCardHeader}>
                      <Text style={styles.reportTitle}>{`${report.emoji} ${report.incidentType}`}</Text>
                      <View style={styles.statusBadge}>
                        <MaterialCommunityIcons name={getStatusIcon(report.status) as any} size={11} color="#7a7a7a" />
                        <Text style={styles.statusBadgeText}>{report.status}</Text>
                      </View>
                    </View>

                    {/* Severity Badge */}
                    <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                      <Text style={styles.severityBadgeText}>{report.severity}</Text>
                    </View>

                    {report.imageUri ? (
                      <View style={styles.reportImageWrap}>
                        <Image source={{ uri: report.imageUri }} style={styles.reportImage} resizeMode="cover" />
                      </View>
                    ) : null}

                    {/* Description */}
                    <Text style={styles.reportDescription} numberOfLines={2}>
                      {report.description}
                    </Text>

                    {/* Location — shows the address string */}
                    <View style={styles.locationRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={15} color="#6a6a6a" />
                      <Text style={styles.locationText} numberOfLines={1}>{report.address}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Footer */}
                    <View style={styles.footerStack}>
                      <View style={styles.footerRow}>
                        <MaterialCommunityIcons name="account-outline" size={15} color="#7b7b7b" />
                        <Text style={styles.footerText}>{report.fullName}</Text>
                      </View>
                      <View style={styles.footerRow}>
                        <MaterialCommunityIcons name="phone-outline" size={15} color="#7b7b7b" />
                        <Text style={styles.footerText}>{report.contactNumber}</Text>
                      </View>
                      <View style={styles.footerRow}>
                        <MaterialCommunityIcons name="clock-outline" size={15} color="#7b7b7b" />
                        <Text style={styles.footerText}>{report.timeAgo}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={isCallActive} animationType="slide" transparent={false} onRequestClose={endDummyCall}>
        <View style={styles.callModalContainer}>
          <View style={styles.callModalTop}>
            <Text style={styles.callLabel}>Calling {callerName}...</Text>
            <Text style={styles.callNumber}>{callerNumber}</Text>
            <View style={styles.connectionRow}>
              <View style={[styles.connectionDot, isConnected && styles.connectionDotActive]} />
              <Text style={styles.connectionText}>{isConnected ? "Connected" : "Connecting..."}</Text>
            </View>
            <Text style={styles.callTimer}>{formatCallTime(callSeconds)}</Text>
          </View>

          <View style={styles.callControlsRow}>
            <View style={styles.callControlButton}>
              <MaterialCommunityIcons name="microphone-off" size={24} color="#fff" />
              <Text style={styles.callControlText}>Mute</Text>
            </View>
            <View style={styles.callControlButton}>
              <MaterialCommunityIcons name="dialpad" size={24} color="#fff" />
              <Text style={styles.callControlText}>Keypad</Text>
            </View>
            <View style={styles.callControlButton}>
              <MaterialCommunityIcons name="volume-high" size={24} color="#fff" />
              <Text style={styles.callControlText}>Speaker</Text>
            </View>
          </View>

          <View style={styles.endCallSection}>
            <Pressable style={styles.endCallButton} onPress={endDummyCall}>
              <MaterialCommunityIcons name="phone-hangup" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.endCallLabel}>End Call</Text>
          </View>
        </View>
      </Modal>

      {/* FAB — Report Incident */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/reportincident" as any)}>
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  containerWrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  callModalContainer: {
    flex: 1,
    backgroundColor: "#1f1f1f",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 48,
  },
  callModalTop: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  callLabel: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  callNumber: {
    marginTop: 10,
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#757575",
  },
  connectionDotActive: {
    backgroundColor: "#43a047",
  },
  connectionText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  callTimer: {
    marginTop: 18,
    fontSize: 54,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  callControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "84%",
    maxWidth: 360,
  },
  callControlButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  callControlText: {
    marginTop: 6,
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  endCallSection: {
    alignItems: "center",
  },
  endCallButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#d32f2f",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  endCallLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },

  // Header
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
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  appName: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", letterSpacing: 0.5 },
  tagline: { fontSize: 12, color: "#888", marginTop: 2 },
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
  sosText: { color: "#fff", fontWeight: "800", fontSize: 14, letterSpacing: 1 },

  // Stats
  statsContainer: { flexDirection: "row", padding: 16, gap: 12 },
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
  statNumber: { fontSize: 22, fontWeight: "800", color: "#B71C1C" },
  statLabel: { fontSize: 10, color: "#999", fontWeight: "600", textAlign: "center" },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 20 },

  // Emergency Dial
  quickDialContainer: {
    backgroundColor: "#fff1f1",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ef9a9a",
    padding: 14,
  },
  quickDialHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  quickDialTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  quickDialGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
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
  emergencyEmoji: { fontSize: 30, lineHeight: 34 },
  emergencyLabel: { color: "#444", fontWeight: "600", fontSize: 12, textAlign: "center" },
  emergencyNumber: { color: "#B71C1C", fontSize: 14, fontWeight: "800", textAlign: "center" },

  // Recent Reports
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1f1f1f" },
  viewAllText: { color: "#B71C1C", fontWeight: "700", fontSize: 13 },
  recentList: { gap: 12, paddingBottom: 6 },
  recentMetaText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: 14,
  },

  // Report Card
  reportCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 15,
    padding: 14,
  },
  reportCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  reportTitle: { flex: 1, fontSize: 16, color: "#161616", fontWeight: "800" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
  },
  statusBadgeText: { color: "#666", fontSize: 11, fontWeight: "700" },
  severityBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  severityBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  reportImageWrap: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ececec",
    marginBottom: 10,
  },
  reportImage: {
    width: "100%",
    height: 170,
    backgroundColor: "#f0f0f0",
  },
  reportDescription: { color: "#6f6f6f", fontSize: 13, lineHeight: 19, marginBottom: 10 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  locationText: { color: "#5f5f5f", fontSize: 12, fontWeight: "600", flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#efefef", marginBottom: 10 },
  footerStack: { gap: 8 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  footerText: { color: "#515151", fontSize: 12, fontWeight: "600" },

  // FAB
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