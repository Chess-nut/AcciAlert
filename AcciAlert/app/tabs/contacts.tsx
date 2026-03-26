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

export default function ContactsScreen() {
  const contacts = [
    {
      name: "Emergency Hotline",
      number: "911",
      type: "Primary Emergency",
      icon: "phone-in-talk",
      color: "#B71C1C",
      bgColor: "#ffebee",
    },
    {
      name: "Police Hotline",
      number: "911",
      type: "Police",
      icon: "police-badge",
      color: "#1565C0",
      bgColor: "#e3f2fd",
    },
    {
      name: "PNP Hotline",
      number: "117",
      type: "PNP Direct Line",
      icon: "shield-outline",
      color: "#1565C0",
      bgColor: "#e3f2fd",
    },
    {
      name: "BFP Hotline",
      number: "116",
      type: "Bureau of Fire Protection",
      icon: "fire-truck",
      color: "#E65100",
      bgColor: "#fff3e0",
    },
    {
      name: "Red Cross",
      number: "143",
      type: "Medical / Disaster Response",
      icon: "hospital-box",
      color: "#C62828",
      bgColor: "#ffebee",
    },
    {
      name: "MMDA Traffic",
      number: "136",
      type: "Traffic Management",
      icon: "traffic-light",
      color: "#2E7D32",
      bgColor: "#e8f5e9",
    },
  ];

  const handleCall = (number: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Dial ${number}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call Now", onPress: () => Linking.openURL(`tel:${number}`) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.banner}>
        <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#B71C1C" />
        <Text style={styles.bannerText}>
          In life-threatening emergencies, call <Text style={{ fontWeight: '800' }}>911</Text> immediately.
        </Text>
      </View>

      <Text style={styles.header}>Emergency Services</Text>
      <Text style={styles.subheader}>Tap any contact to call directly</Text>

      {contacts.map((contact, index) => (
        <TouchableOpacity
          key={index}
          style={styles.contactCard}
          onPress={() => handleCall(contact.number, contact.name)}
          activeOpacity={0.8}
        >
          <View style={[styles.contactIcon, { backgroundColor: contact.bgColor }]}>
            <MaterialCommunityIcons
              name={contact.icon as any}
              size={28}
              color={contact.color}
            />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactType}>{contact.type}</Text>
          </View>
          <View style={styles.callSection}>
            <View style={[styles.callButton, { backgroundColor: contact.color }]}>
              <MaterialCommunityIcons name="phone" size={16} color="#fff" />
              <Text style={styles.phoneNumber}>{contact.number}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.noteCard}>
        <MaterialCommunityIcons name="information-outline" size={18} color="#1565C0" />
        <Text style={styles.noteText}>
          Save these numbers ahead of time. During emergencies, every second counts.
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
    padding: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#B71C1C",
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  header: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subheader: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  contactType: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },
  callSection: {
    alignItems: "flex-end",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#1565C0",
    lineHeight: 18,
  },
});