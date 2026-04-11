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

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    icon: "check-decagram",
    bullets: [
      "By using AcciAlert, users agree to follow all rules and policies of the application.",
    ],
  },
  {
    title: "2. Use of the Application",
    icon: "application-outline",
    bullets: [
      "Report only real accidents, hazards, or emergencies.",
      "Do not send false or misleading reports.",
      "Use the app in a responsible and respectful way.",
    ],
  },
  {
    title: "3. User Responsibilities",
    icon: "account-lock-outline",
    bullets: [
      "The accuracy of the reports they submit.",
      "Keeping their account information secure.",
      "Avoiding misuse of emergency features.",
    ],
  },
  {
    title: "4. Incident Reporting Rules",
    icon: "file-document-alert-outline",
    bullets: [
      "Reports must be true and based on actual events.",
      "False reports may lead to penalties or account suspension.",
      "Reports may be reviewed and verified by authorities.",
    ],
  },
  {
    title: "5. Verification System",
    icon: "shield-check-outline",
    bullets: [
      "Some users (officials or trusted members) can verify reports.",
      "Verified reports will be prioritized for response.",
    ],
  },
  {
    title: "6. Limitation of Liability",
    icon: "scale-balance",
    bullets: [
      "AcciAlert is only a reporting tool.",
      "The app does not guarantee emergency response time.",
      "The developers are not responsible for delays or damages.",
    ],
  },
  {
    title: "7. Account Suspension",
    icon: "account-cancel-outline",
    bullets: [
      "Accounts may be suspended if the user submits fake reports.",
      "Accounts may be suspended if the user abuses the system.",
      "Accounts may be suspended if the user violates any rules.",
    ],
  },
  {
    title: "8. Changes to Terms",
    icon: "update",
    bullets: [
      "The app may update these terms anytime. Users will be informed of major changes.",
    ],
  },
];

export default function TermsAndConditions() {
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
        <Text style={styles.headerTitle}>Terms and Conditions</Text>
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
          <MaterialCommunityIcons name="shield-check-outline" size={22} color="#1E5AA8" />
          <View style={styles.introTextWrap}>
            <Text style={styles.updatedText}>Last Updated: April 2026</Text>
            <Text style={styles.introText}>
              These terms explain how AcciAlert works and how everyone can help keep the app safe, accurate, and useful.
            </Text>
          </View>
        </View>

        {termsSections.map((section) => (
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

        <TouchableOpacity
          style={styles.agreeButton}
          onPress={() => router.replace("/(tabs)/profile" as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.agreeButtonText}>I Understand and Agree</Text>
        </TouchableOpacity>
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
  agreeButton: {
    marginTop: 6,
    backgroundColor: "#CC0000",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  agreeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
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