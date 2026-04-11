import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebaseconfig";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  totalReports: number;
  resolvedReports: number;
  violations: number;
  createdAt: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserListScreen() {
  const [users, setUsers]             = useState<AdminUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  // ─── Firestore listener ────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      async (snapshot) => {
        const mapped: AdminUser[] = await Promise.all(
          snapshot.docs.map(async (entry) => {
            const data = entry.data() as {
              fullName?:   string;
              email?:      string;
              phone?:      string;
              violations?: number;
              createdAt?:  { toDate?: () => Date } | null;
            };

            // Format join date
            let createdAt = "Unknown";
            try {
              if (data.createdAt && typeof data.createdAt.toDate === "function") {
                const date = data.createdAt.toDate();
                createdAt = date.toLocaleDateString("en-PH", {
                  year: "numeric", month: "short", day: "numeric",
                });
              }
            } catch { /* ignore */ }

            // Fetch report counts
            let totalReports    = 0;
            let resolvedReports = 0;
            try {
              const reportsSnap = await getDocs(
                query(collection(db, "reports"), where("userId", "==", entry.id))
              );
              totalReports    = reportsSnap.size;
              resolvedReports = reportsSnap.docs.filter(
                (r) => r.data().status === "Resolved"
              ).length;
            } catch { /* ignore */ }

            return {
              id:              entry.id,
              fullName:        data.fullName?.trim()  || "Unnamed User",
              email:           data.email?.trim()     || "No email",
              phone:           data.phone?.trim()     || "No phone",
              violations:      data.violations        ?? 0,
              totalReports,
              resolvedReports,
              createdAt,
            };
          })
        );

        setUsers(mapped);
        setLoading(false);
      },
      (error) => {
        console.error("UserList load error:", error);
        Alert.alert(
          "Permission Error",
          "Could not load users. Make sure your Firestore rules allow admin read access.\n\nError: " + error.message
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ─── Delete user + all their reports ──────────────────────────────────────
  // Uses a batch write so it's atomic — either everything deletes or nothing does.

  const deleteUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      const batch = writeBatch(db);

      // 1. Delete all reports by this user
      const reportsSnap = await getDocs(
        query(collection(db, "reports"), where("userId", "==", userId))
      );
      reportsSnap.docs.forEach((r) => batch.delete(r.ref));

      // 2. Delete the user document
      batch.delete(doc(db, "users", userId));

      await batch.commit();
    } catch (error) {
      console.error("Delete user error:", error);
      Alert.alert("Delete failed", "Unable to remove this user. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDeleteUser = (user: AdminUser) => {
    Alert.alert(
      "Remove User Account",
      `Remove "${user.fullName}" (${user.email})?\n\nThis will permanently delete their profile and all ${user.totalReports} report(s) they submitted.\n\nNote: Their Firebase Auth login must be removed separately from the Firebase Console.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => void deleteUser(user.id),
        },
      ]
    );
  };

  // ─── Search filter ─────────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)    ||
        u.phone.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // ─── Totals ────────────────────────────────────────────────────────────────

  const totalReports  = users.reduce((sum, u) => sum + u.totalReports,  0);
  const totalResolved = users.reduce((sum, u) => sum + u.resolvedReports, 0);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registered Users</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? "Loading..." : `${users.length} user${users.length !== 1 ? "s" : ""} registered`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        {!loading && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-group" size={20} color="#CC0000" />
              <Text style={styles.statValue}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="file-document-multiple" size={20} color="#CC0000" />
              <Text style={styles.statValue}>{totalReports}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#CC0000" />
              <Text style={styles.statValue}>{totalResolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={19} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone…"
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#CC0000" size="large" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>👤</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery.length > 0 ? "No users found" : "No users yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.length > 0
                ? `No results for "${searchQuery}".`
                : "Registered users will appear here once they sign up."}
            </Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {filteredUsers.map((user) => (
              <View key={user.id} style={[
                styles.userCard,
                user.violations > 0 && styles.userCardFlagged,
              ]}>

                {/* Top row */}
                <View style={styles.cardTopRow}>
                  <View style={[
                    styles.avatar,
                    user.violations > 0 && styles.avatarFlagged,
                  ]}>
                    <Text style={styles.avatarLetter}>
                      {user.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userMeta}>
                    <Text style={styles.userName} numberOfLines={1}>{user.fullName}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>

                    {/* Violations badge — shown only if > 0 */}
                    {user.violations > 0 && (
                      <View style={styles.violationsBadge}>
                        <MaterialCommunityIcons name="alert-circle" size={12} color="#fca5a5" />
                        <Text style={styles.violationsText}>
                          Violated rules {user.violations}×
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDeleteUser(user)}
                    disabled={deletingId === user.id}
                    activeOpacity={0.75}
                  >
                    {deletingId === user.id ? (
                      <ActivityIndicator size="small" color="#fecaca" />
                    ) : (
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#fecaca" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Details */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="phone-outline" size={13} color="#64748b" />
                    <Text style={styles.detailText} numberOfLines={1}>{user.phone}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="calendar-outline" size={13} color="#64748b" />
                    <Text style={styles.detailText}>{user.createdAt}</Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.userStatsRow}>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatNum}>{user.totalReports}</Text>
                    <Text style={styles.userStatLabel}>Reports</Text>
                  </View>
                  <View style={styles.userStatDivider} />
                  <View style={styles.userStat}>
                    <Text style={styles.userStatNum}>{user.resolvedReports}</Text>
                    <Text style={styles.userStatLabel}>Resolved</Text>
                  </View>
                  <View style={styles.userStatDivider} />
                  <View style={styles.userStat}>
                    <Text style={[styles.userStatNum, user.violations > 0 && { color: "#f87171" }]}>
                      {user.violations}
                    </Text>
                    <Text style={styles.userStatLabel}>Violations</Text>
                  </View>
                </View>

              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: "#0b1220" },

  header:         { backgroundColor: "#111827", paddingHorizontal: 18, paddingTop: 56, paddingBottom: 18 },
  headerTitle:    { color: "#fff", fontSize: 24, fontWeight: "800" },
  headerSubtitle: { marginTop: 4, color: "#9ca3af", fontSize: 13 },

  content: { padding: 16, paddingBottom: 40 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: "#111827", borderRadius: 12,
    borderWidth: 1, borderColor: "#1f2937",
    paddingVertical: 14, alignItems: "center", gap: 4,
  },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "800" },
  statLabel: { color: "#64748b", fontSize: 11, fontWeight: "600", textAlign: "center" },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0f172a", borderRadius: 12,
    borderWidth: 1, borderColor: "#334155",
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14,
  },
  searchInput: { flex: 1, color: "#e2e8f0", fontSize: 13, paddingVertical: 0 },

  loadingBox:    { alignItems: "center", paddingVertical: 40, gap: 10 },
  loadingText:   { color: "#aab1be", fontSize: 13, fontWeight: "600" },
  emptyBox:      { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyEmoji:    { fontSize: 40, marginBottom: 12 },
  emptyTitle:    { color: "#e2e8f0", fontSize: 16, fontWeight: "800", marginBottom: 6 },
  emptySubtitle: { color: "#64748b", fontSize: 13, textAlign: "center" },

  userList: { gap: 12 },

  userCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#253041",
    padding: 14,
  },
  userCardFlagged: {
    borderColor: "#7f1d1d",
  },

  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#CC0000",
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  avatarFlagged: {
    backgroundColor: "#7f1d1d",
  },
  avatarLetter: { color: "#fff", fontSize: 18, fontWeight: "800" },
  userMeta:     { flex: 1 },
  userName:     { color: "#fff", fontSize: 14, fontWeight: "700" },
  userEmail:    { marginTop: 2, color: "#94a3b8", fontSize: 12 },

  violationsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "#3f1111",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  violationsText: {
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: "700",
  },

  deleteBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#3f1111",
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },

  divider: { height: 1, backgroundColor: "#1f2937", marginVertical: 12 },

  detailsGrid: { flexDirection: "row", gap: 16, marginBottom: 12 },
  detailItem:  { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  detailText:  { color: "#64748b", fontSize: 12, fontWeight: "500", flex: 1 },

  userStatsRow: {
    flexDirection: "row",
    backgroundColor: "#0b1220",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingVertical: 10,
  },
  userStat:        { flex: 1, alignItems: "center" },
  userStatNum:     { color: "#fff", fontSize: 16, fontWeight: "800" },
  userStatLabel:   { color: "#64748b", fontSize: 11, fontWeight: "600", marginTop: 2 },
  userStatDivider: { width: 1, backgroundColor: "#1f2937" },
});