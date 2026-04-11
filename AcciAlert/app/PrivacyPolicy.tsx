import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const privacySections = [
  {
    title: "1. Information Collected",
    icon: "shield-account-outline",
    bullets: [
      "Name and contact details.",
      "Location (GPS).",
      "Incident reports and activity.",
      "Device information.",
    ],
  },
  {
    title: "2. Use of Information",
    icon: "database-cog-outline",
    bullets: [
      "Send reports to authorities.",
      "Improve emergency response.",
      "Provide notifications.",
      "Maintain system security.",
    ],
  },
  {
    title: "3. Location Data",
    icon: "map-marker-outline",
    bullets: [
      "The app uses GPS to get your real-time location.",
      "Location is only used for reporting incidents.",
    ],
  },
  {
    title: "4. Data Sharing",
    icon: "share-variant-outline",
    bullets: [
      "Your data may be shared with barangay officials.",
      "Your data may be shared with emergency responders such as police, fire, and medical teams.",
      "The app will not sell your personal data.",
    ],
  },
  {
    title: "5. Data Security",
    icon: "lock-check-outline",
    bullets: [
      "User data is protected using secure systems (e.g., Firebase).",
      "Only authorized users can access sensitive information.",
    ],
  },
  {
    title: "6. User Rights",
    icon: "account-check-outline",
    bullets: [
      "View your data.",
      "Request correction of wrong data.",
      "Request account deletion.",
    ],
  },
  {
    title: "7. Data Retention",
    icon: "clock-outline",
    bullets: [
      "Data is stored only as long as needed for system use.",
      "Old or inactive data may be deleted.",
    ],
  },
  {
    title: "8. Changes to Privacy Policy",
    icon: "file-document-edit-outline",
    bullets: [
      "The policy may be updated when needed. Users will be notified of major changes.",
    ],
  },
];

export default function PrivacyPolicy() {
  const router = useRouter();
  const scrollRef = React.useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.75}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setShowScrollTop(event.nativeEvent.contentOffset.y > 280)}
        scrollEventThrottle={16}
      >
        <View style={styles.introBox}>
          <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#1E5AA8" />
          <View style={styles.introTextWrap}>
            <Text style={styles.updatedText}>Last Updated: April 2026</Text>
            <Text style={styles.introText}>
              We respect your privacy and only use your information to support safer, faster emergency reporting.
            </Text>
          </View>
        </View>

        {privacySections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons name={section.icon as any} size={20} color="#CC0000" />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.bulletList}>
              {section.bullets.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#CC0000" />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {showScrollTop && (
        <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop} activeOpacity={0.9}>
          <MaterialCommunityIcons name="arrow-up" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#CC0000",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  introBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#EAF3FF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8E7FB",
    marginBottom: 16,
  },
  introTextWrap: {
    flex: 1,
  },
  updatedText: {
    fontSize: 12,
    color: "#6A7A90",
    marginBottom: 6,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#35506B",
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E9E9E9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF2F2",
    borderWidth: 1,
    borderColor: "#F4D4D4",
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#1c1c1c",
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#30343A",
  },
  scrollTopButton: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#CC0000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
});