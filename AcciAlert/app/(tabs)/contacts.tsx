import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ContactsScreen() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callerNumber, setCallerNumber] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      number: "117",
      type: "Police",
      icon: "police-badge",
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

  useEffect(() => {
    if (!isCallActive || !isConnected) {
      return;
    }

    const timer = setInterval(() => {
      setCallSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCallActive, isConnected]);

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

  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const formatCallTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
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
          onPress={() => startDummyCall(contact.name, contact.number)}
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

      <View style={styles.infoTipsContainer}>

        <View style={styles.tipsHeader}>
          <MaterialCommunityIcons name="shield-check-outline" size={18} color="#1565C0" />
          <Text style={styles.tipsHeaderText}>Safety Tips</Text>
        </View>

        <View style={styles.tipsList}>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Stay calm and assess the situation</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Move to a safe location if possible</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Call the appropriate emergency number</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Provide clear location details</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Follow dispatcher instructions</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 20 }} />

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

          <Pressable style={styles.endCallButton} onPress={endDummyCall}>
            <MaterialCommunityIcons name="phone-hangup" size={28} color="#fff" />
          </Pressable>

          <Text style={styles.endCallLabel}>End Call</Text>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
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
  infoTipsContainer: {
    backgroundColor: "#eef6ff",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#d7e9ff",
  },
  
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipsHeaderText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0d47a1",
  },
  tipsList: {
    gap: 6,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipBullet: {
    width: 16,
    fontSize: 14,
    lineHeight: 20,
    color: "#1565C0",
    fontWeight: "700",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#24507f",
  },
});