import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { db } from "../../firebaseconfig";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportStatus = "Pending" | "In Progress" | "Resolved";

type AdminReport = {
  id: string;
  incidentType: string;
  severity: string;
  status: ReportStatus;
  imageUri: string | null;
  locationName: string;
  description: string;
  reporterName: string;
  contactNumber: string;
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: ReportStatus; icon: string; activeColor: string }[] = [
  { label: "Pending",     icon: "timer-sand",     activeColor: "#F57C00" },
  { label: "In Progress", icon: "progress-clock",  activeColor: "#1976D2" },
  { label: "Resolved",    icon: "check-circle",    activeColor: "#2E7D32" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [reports, setReports]           = useState<AdminReport[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState<"All" | ReportStatus>("All");
  const [searchQuery, setSearchQuery]   = useState("");
  const [savingId, setSavingId]         = useState<string | null>(null);

  // ─── Real-time Firestore listener ─────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const mapped: AdminReport[] = snapshot.docs.map((item) => {
          const data = item.data() as {
            incidentType?: string;
            severity?: string;
            status?: string;
            imageUri?: string | null;
            description?: string;
            reporterName?: string;
            contactNumber?: string;
            location?: { address?: string; latitude?: number | null; longitude?: number | null };
          };

          let locationName = "Location not specified";
          if (data.location?.address?.trim()) {
            locationName = data.location.address.trim();
          } else if (
            typeof data.location?.latitude === "number" &&
            typeof data.location?.longitude === "number"
          ) {
            locationName = `${data.location.latitude.toFixed(5)}, ${data.location.longitude.toFixed(5)}`;
          }

          const rawStatus = data.status ?? "Pending";
          const status: ReportStatus =
            rawStatus === "Resolved"    ? "Resolved"    :
            rawStatus === "In Progress" ? "In Progress" :
            "Pending";

          return {
            id:            item.id,
            incidentType:  data.incidentType ?? "Unknown Incident",
            severity:      data.severity     ?? "High",
            status,
            imageUri:      typeof data.imageUri === "string" && data.imageUri.trim().length > 0
                             ? data.imageUri : null,
            locationName,
            description:   data.description?.trim()   || "No description.",
            reporterName:  data.reporterName?.trim()  || "Anonymous",
            contactNumber: data.contactNumber?.trim() || "No contact",
          };
        });

        setReports(mapped);
        setLoading(false);
      },
      (error) => {
        console.error("Admin reports load error:", error);
        Alert.alert("Load failed", "Unable to load reports. Check Firestore rules.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ─── Update status in Firestore ───────────────────────────────────────────

  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setSavingId(reportId);
    try {
      await updateDoc(doc(db, "reports", reportId), { status: newStatus });
    } catch (error) {
      console.error("Update status error:", error);
      Alert.alert("Update failed", "Unable to update report status. Check Firestore rules.");
    } finally {
      setSavingId(null);
    }
  };

  // ─── Delete report ────────────────────────────────────────────────────────

  const deleteReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, "reports", reportId));
    } catch (error) {
      console.error("Delete report error:", error);
      Alert.alert("Delete failed", "Unable to remove this report.");
    }
  };

  const confirmDelete = (reportId: string) => {
    Alert.alert("Delete Report", "Remove this report as fake/spam?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deleteReport(reportId) },
    ]);
  };

  // ─── Filtered list ────────────────────────────────────────────────────────

  const visibleReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports.filter((r) => {
      const matchesStatus = filterStatus === "All" || r.status === filterStatus;
      const matchesSearch =
        q.length === 0 ||
        r.incidentType.toLowerCase().includes(q)  ||
        r.locationName.toLowerCase().includes(q)  ||
        r.severity.toLowerCase().includes(q)      ||
        r.status.toLowerCase().includes(q)        ||
        r.reporterName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [reports, filterStatus, searchQuery]);

  // ─── Stats ────────────────────────────────────────────────────────────────

  const totalCount      = reports.length;
  const pendingCount    = reports.filter(r => r.status === "Pending").length;
  const inProgressCount = reports.filter(r => r.status === "In Progress").length;
  const resolvedCount   = reports.filter(r => r.status === "Resolved").length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage reports and moderation</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/(admin)/AdminSettings" as any)}
        >
          <MaterialCommunityIcons name="cog" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: "Total",       value: totalCount,      color: "#fff"     },
            { label: "Pending",     value: pendingCount,    color: "#F57C00"  },
            { label: "In Progress", value: inProgressCount, color: "#1976D2"  },
            { label: "Resolved",    value: resolvedCount,   color: "#2E7D32"  },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Status filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(["All", "Pending", "In Progress", "Resolved"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filterStatus === tab && styles.filterChipActive]}
              onPress={() => setFilterStatus(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, filterStatus === tab && styles.filterChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={19} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by type, location, reporter…"
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Report list */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#CC0000" size="large" />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : visibleReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.length > 0
                ? `No results for "${searchQuery}".`
                : `No ${filterStatus !== "All" ? filterStatus + " " : ""}reports yet.`}
            </Text>
          </View>
        ) : (
          <View style={styles.reportList}>
            {visibleReports.map((report) => {
              const isSaving = savingId === report.id;

              return (
                <View key={report.id} style={styles.reportCard}>

                  {/* Image or placeholder */}
                  {report.imageUri ? (
                    <Image
                      source={{ uri: report.imageUri }}
                      style={styles.reportImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialCommunityIcons name="image-off-outline" size={28} color="#374151" />
                      <Text style={styles.imagePlaceholderText}>No photo</Text>
                    </View>
                  )}

                  {/* Incident type + severity */}
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.reportType} numberOfLines={1}>{report.incidentType}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.severity) }]}>
                      <Text style={styles.severityBadgeText}>{normalizeSeverity(report.severity)}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={styles.reportDescription} numberOfLines={2}>{report.description}</Text>

                  {/* Location */}
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText} numberOfLines={1}>{report.locationName}</Text>
                  </View>

                  {/* Reporter */}
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>{report.reporterName}</Text>
                    <MaterialCommunityIcons name="phone-outline" size={14} color="#64748b" style={{ marginLeft: 10 }} />
                    <Text style={styles.infoText}>{report.contactNumber}</Text>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* ── 3-way status control ── */}
                  <Text style={styles.statusLabel}>Update Status</Text>
                  <View style={styles.statusRow}>
                    {STATUS_OPTIONS.map((opt) => {
                      const isActive = report.status === opt.label;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.statusBtn,
                            isActive && { backgroundColor: opt.activeColor, borderColor: opt.activeColor },
                          ]}
                          onPress={() => {
                            if (!isActive) void updateStatus(report.id, opt.label);
                          }}
                          disabled={isSaving}
                          activeOpacity={0.8}
                        >
                          {isSaving && isActive ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <MaterialCommunityIcons
                                name={opt.icon as any}
                                size={14}
                                color={isActive ? "#fff" : "#64748b"}
                              />
                              <Text style={[styles.statusBtnText, isActive && styles.statusBtnTextActive]}>
                                {opt.label}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Delete */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(report.id)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={15} color="#fecaca" />
                    <Text style={styles.deleteText}>Delete Fake / Spam</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeSeverity(s: string) {
  const v = s.toLowerCase();
  if (v.includes("critical")) return "Critical";
  if (v.includes("high"))     return "High";
  if (v.includes("medium"))   return "Medium";
  if (v.includes("low"))      return "Low";
  return s;
}

function getSeverityColor(s: string) {
  const v = s.toLowerCase();
  if (v.includes("critical")) return "#7f1d1d";
  if (v.includes("high"))     return "#78350f";
  if (v.includes("medium"))   return "#713f12";
  if (v.includes("low"))      return "#1e3a5f";
  return "#374151";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: "#0b1220" },

  // Header
  header: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle:    { color: "#fff", fontSize: 24, fontWeight: "800" },
  headerSubtitle: { marginTop: 4, color: "#9ca3af", fontSize: 13 },
  settingsBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#1f2937", borderWidth: 1, borderColor: "#374151",
    justifyContent: "center", alignItems: "center",
  },

  content: { padding: 16, paddingBottom: 40 },

  // Stats
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: "#111827", borderRadius: 12,
    borderWidth: 1, borderColor: "#1f2937",
    paddingVertical: 12, alignItems: "center", gap: 4,
  },
  statLabel: { color: "#64748b", fontSize: 10, fontWeight: "700", textAlign: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },

  // Filter chips
  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 14, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "#1f2937", borderWidth: 1, borderColor: "#374151",
  },
  filterChipActive:     { backgroundColor: "#CC0000", borderColor: "#CC0000" },
  filterChipText:       { color: "#9ca3af", fontSize: 12, fontWeight: "700" },
  filterChipTextActive: { color: "#fff" },

  // Search
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0f172a", borderRadius: 12,
    borderWidth: 1, borderColor: "#334155",
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14,
  },
  searchInput: { flex: 1, color: "#e2e8f0", fontSize: 13, paddingVertical: 0 },

  // Loading / empty
  loadingBox:    { alignItems: "center", paddingVertical: 40, gap: 10 },
  loadingText:   { color: "#aab1be", fontSize: 13, fontWeight: "600" },
  emptyBox:      { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyEmoji:    { fontSize: 40, marginBottom: 12 },
  emptyTitle:    { color: "#e2e8f0", fontSize: 16, fontWeight: "800", marginBottom: 6 },
  emptySubtitle: { color: "#64748b", fontSize: 13, textAlign: "center" },

  // Report list
  reportList: { gap: 14 },

  // Report card
  reportCard: {
    backgroundColor: "#111827", borderRadius: 16,
    borderWidth: 1, borderColor: "#253041", padding: 14,
  },

  // Image
  reportImage: { width: "100%", height: 160, borderRadius: 12, marginBottom: 12, backgroundColor: "#0f172a" },
  imagePlaceholder: {
    width: "100%", height: 100, borderRadius: 12, marginBottom: 12,
    backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#1f2937",
    justifyContent: "center", alignItems: "center", gap: 6,
  },
  imagePlaceholderText: { color: "#374151", fontSize: 12, fontWeight: "600" },

  // Card content
  cardTitleRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 },
  reportType:     { color: "#fff", fontSize: 16, fontWeight: "800", flex: 1 },
  severityBadge:  { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  severityBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  reportDescription: { color: "#64748b", fontSize: 13, lineHeight: 19, marginBottom: 10 },
  infoRow:        { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  infoText:       { color: "#94a3b8", fontSize: 12, fontWeight: "600", flex: 1 },

  cardDivider:  { height: 1, backgroundColor: "#1f2937", marginVertical: 12 },

  // ── 3-way status control ──
  statusLabel: { color: "#9ca3af", fontSize: 11, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  statusRow:   { flexDirection: "row", gap: 8, marginBottom: 12 },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statusBtnText:       { color: "#64748b", fontSize: 11, fontWeight: "800" },
  statusBtnTextActive: { color: "#fff" },

  // Delete
  deleteButton: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#3f1111",
  },
  deleteText: { color: "#fecaca", fontSize: 12, fontWeight: "700" },
});