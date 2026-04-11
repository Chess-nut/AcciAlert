import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fullName, setFullName] = useState('User');

  useEffect(() => {
  const user = auth.currentUser;
  console.log("Current user:", user); // Debug: Check if user is logged in
  if (user) {
    const userDoc = doc(db, 'users', user.uid);
    getDoc(userDoc).then((docSnap) => {
      console.log("Document snapshot:", docSnap.exists(), docSnap.data()); // Debug: Check if doc exists and data
      if (docSnap.exists()) {
        setFullName(docSnap.data().fullName || 'User');
      } else {
        console.log("User document does not exist");
      }
    }).catch((error) => {
      console.error("Error fetching user data:", error);
    });
  } else {
    console.log("No current user");
  }
}, []);




  
  const profileMenuItems = [
    {
      icon: "account",
      label: "Personal Information",
      description: "View and edit your profile",
      color: "#1565C0",
      bgColor: "#e3f2fd",
      route: "/PersonalInformation",
    },
    {
      icon: "phone",
      label: "Emergency Contacts",
      description: "Manage your emergency contacts",
      color: "#2E7D32",
      bgColor: "#e8f5e9",
    },
  ];

  const supportMenuItems = [
    {
      icon: "bell",
      label: "Notifications",
      description: notificationsEnabled ? "Enabled" : "Disabled",
      color: "#7B1FA2",
      bgColor: "#f3e5f5",
      toggle: true,
    },
    {
      icon: "file-multiple",
      label: "Terms & Conditions",
      description: "Read our terms and policies",
      color: "#555",
      bgColor: "#f5f5f5",
      route: "/TermsAndConditions",
    },
    {
      icon: "shield-lock",
      label: "Privacy Policy",
      description: "Your privacy matters to us",
      color: "#555",
      bgColor: "#f5f5f5",
      route: "/PrivacyPolicy",
    },
  ];

    const handleLogout = async () => {
      try {
        console.log("LOGOUT: start");
        await signOut(auth);
        console.log("LOGOUT: signed out");

        try {
          await AsyncStorage.clear();
          console.log("LOGOUT: storage cleared");
        } catch (storageError) {
          console.warn("LOGOUT: storage clear failed", storageError);
        }

        setFullName("User");
        setNotificationsEnabled(true);

        router.push("/login");
        console.log("LOGOUT: navigation called");
      } catch (error) {
        console.error("Logout failed:", error);
        Alert.alert("Logout failed", (error as Error).message);
      }
    };

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={() => {
        if (item.toggle) setNotificationsEnabled(!notificationsEnabled);
        if (item.route) router.push(item.route);
      }}
      activeOpacity={0.75}
    >
      <View style={[styles.menuIconBox, { backgroundColor: item.bgColor }]}>
        <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{item.label}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      {item.toggle ? (
        <View style={[styles.togglePill, notificationsEnabled && styles.togglePillOn]}>
          <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobOn]} />
        </View>
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <View style={styles.profileImage}>
            <MaterialCommunityIcons name="account-circle" size={72} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4caf50" />
          </View>
        </View>
        <Text style={styles.profileName}>{fullName}</Text>
        <View style={styles.verifiedRow}>
          <MaterialCommunityIcons name="shield-check" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.profileEmail}>Verified User</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>5</Text>
            <Text style={styles.headerStatLabel}>Reports</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>2</Text>
            <Text style={styles.headerStatLabel}>Resolved</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>40%</Text>
            <Text style={styles.headerStatLabel}>Rate</Text>
          </View>
        </View>
      </View>

      {/* Profile Menu */}
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.menuCard}>
        {profileMenuItems.map(renderMenuItem)}
      </View>

      {/* Support Menu */}
      <Text style={styles.sectionLabel}>Support & Settings</Text>
      <View style={styles.menuCard}>
        {supportMenuItems.map(renderMenuItem)}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => void handleLogout()}>
        <MaterialCommunityIcons name="logout" size={20} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    backgroundColor: "#B71C1C",
    paddingBottom: 24,
    alignItems: "center",
    paddingTop: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.5,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  profileEmail: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  headerStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 20,
  },
  headerStat: {
    alignItems: "center",
    minWidth: 50,
  },
  headerStatNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  headerStatLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "600",
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  menuCard: {
    backgroundColor: "white",
    marginHorizontal: 12,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomColor: "#f5f5f5",
    borderBottomWidth: 1,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  menuDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  togglePill: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ccc",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  togglePillOn: {
    backgroundColor: "#B71C1C",
    alignItems: "flex-end",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  toggleKnobOn: {},
  logoutButton: {
    backgroundColor: "#B71C1C",
    marginHorizontal: 12,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 2,
  },
  logoutText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});