import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

// Firebase
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

// ─── Constants ────────────────────────────────────────────────────────────────

const incidentTypes = [
  "Fire",
  "Traffic Accident",
  "Pothole",
  "Road Debris",
  "Flooding",
  "Broken Traffic Sign",
  "Others",
];

const severityLevels = [
  { label: "Critical - Emergency", value: "critical", color: "#D32F2F" },
  { label: "High - Urgent",        value: "high",     color: "#F57C00" },
  { label: "Medium - Moderate",    value: "medium",   color: "#FBC02D" },
  { label: "Low - Minor",          value: "low",      color: "#1976D2" },
];

const teleportLandmarks = [
  { name: "SM North EDSA", latitude: 14.6549, longitude: 121.0314 },
  { name: "UP Diliman", latitude: 14.6541, longitude: 121.0646 },
  { name: "Quezon Memorial Circle", latitude: 14.6507, longitude: 121.0488 },
  { name: "Eastwood City", latitude: 14.6108, longitude: 121.0520 },
  { name: "Araneta City Cubao", latitude: 14.6206, longitude: 121.0521 },
];

const formatLocationAddress = (address: Record<string, any>) => {
  const streetName =
    address.road ||
    address.street ||
    address.pedestrian ||
    address.residential ||
    address.footway ||
    address.path ||
    address.cycleway ||
    "";

  const streetLine = [address.house_number, streetName].filter(Boolean).join(" ");
  const localArea = [
    address.barangay,
    address.suburb,
    address.neighbourhood,
    address.village,
    address.quarter,
  ].find(Boolean) || "";
  const cityLine = address.city || address.town || address.municipality || address.county || "";
  const country = address.country || "";

  const parts = [streetLine, localArea, cityLine, country].filter(Boolean);
  return parts.join(", ");
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportIncidentScreen() {
  const router = useRouter();

  // Form fields
  const [locationText, setLocationText]   = useState("");
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [incidentType, setIncidentType]   = useState("");
  const [severity, setSeverity]           = useState("");
  const [description, setDescription]    = useState("");
  const [fullName, setFullName]           = useState("");
  const [contact, setContact]             = useState("");
  const [photoUri, setPhotoUri]           = useState<string | null>(null);
  const [teleportPickerVisible, setTeleportPickerVisible] = useState(false);

  // UI state
  const [activeDropdown, setActiveDropdown] = useState<"type" | "severity" | null>(null);
  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [savedReportId, setSavedReportId] = useState("");

  const typeSelectorRef     = useRef<View | null>(null);
  const severitySelectorRef = useRef<View | null>(null);

  // Prefill reporter details from the user profile saved at signup.
  useEffect(() => {
    let isMounted = true;

    const prefillReporterDetails = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!isMounted || !userDocSnap.exists()) return;

        const userData = userDocSnap.data() as { fullName?: string; phone?: string };

        const fallbackName = user.displayName ?? "";
        const fallbackPhone = user.phoneNumber ?? "";

        setFullName((prev) => (prev.trim() ? prev : (userData.fullName ?? fallbackName).trim()));
        setContact((prev) => (prev.trim() ? prev : (userData.phone ?? fallbackPhone).trim()));
      } catch (error) {
        console.warn("Unable to prefill reporter details:", error);
      }
    };

    prefillReporterDetails();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateForm = (): string | null => {
    if (!locationText.trim()) return "Please enter or detect a location.";
    if (!incidentType)        return "Please select an incident type.";
    if (!severity)            return "Please select a severity level.";
    if (!fullName.trim())     return "Please enter your full name.";
    if (!contact.trim())      return "Please enter a contact number.";
    return null;
  };

  // ─── Location ───────────────────────────────────────────────────────────────

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission needed", "Please allow location access to autofill your current location.");
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = currentPosition.coords;

      // Save the raw coords — will be stored in Firestore
      setLocationCoords({ latitude, longitude });

      // Try Nominatim reverse geocoding for human-readable address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "Accept-Language": "en", "User-Agent": "AcciAlertApp/1.0" } }
        );
        const data = await response.json();
        if (data?.address) {
          const formattedAddress = formatLocationAddress(data.address);
          if (formattedAddress) { setLocationText(formattedAddress); return; }
        }
      } catch { /* fall through */ }

      // Fallback: expo-location reverse geocode
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place  = places[0];
      if (place) {
        const streetParts = [place.streetNumber, place.street].filter(Boolean).join(" ");
        const localArea = [place.district, place.subregion, place.region].find(Boolean) || "";
        const country = place.isoCountryCode || "";
        const parts = [streetParts, localArea, place.city, country].filter(Boolean);
        if (parts.length > 0) { setLocationText(parts.join(", ")); return; }
      }

      // Last resort: raw coords string
      setLocationText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } catch {
      Alert.alert("Location unavailable", "Unable to get your current location right now.");
    }
  };

  const handleTeleportToLandmark = (landmark: { name: string; latitude: number; longitude: number }) => {
    setLocationCoords({ latitude: landmark.latitude, longitude: landmark.longitude });
    setLocationText(`${landmark.name}, Quezon City, Metro Manila, Philippines`);
    setTeleportPickerVisible(false);
  };

  // ─── Camera ─────────────────────────────────────────────────────────────────

  const handleUseCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera permission needed", "Please allow camera access to capture a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Camera unavailable", "Unable to open the camera right now.");
    }
  };

  // ─── Submit → Save to Firestore ─────────────────────────────────────────────

  const handleSubmit = async () => {
    // 1. Validate
    const error = validateForm();
    if (error) { Alert.alert("Missing information", error); return; }

    // 2. Get logged-in user
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in before submitting a report.");
      router.replace("/login");
      return;
    }

    setSubmitting(true);

    try {
      // 3. Build the document — matches your requested data structure exactly
      const reportData = {
        // Link to the logged-in user
        userId: user.uid,

        // Incident details
        incidentType,                          // e.g. "Traffic Accident"
        severity,                              // e.g. "Critical - Emergency"
        description: description.trim(),

        // Location: store both the human-readable string AND raw coords
        location: {
          address:   locationText.trim(),
          latitude:  locationCoords?.latitude  ?? null,
          longitude: locationCoords?.longitude ?? null,
        },

        // Reporter info
        reporterName:  fullName.trim(),
        contactNumber: contact.trim(),

        // Photo (local URI — replace with a Storage URL if you add Firebase Storage later)
        imageUri: photoUri ?? null,

        // Status starts as Pending (feeds your dashboard stats)
        status: "Pending",

        // Firestore server-side timestamp (most reliable)
        timestamp: serverTimestamp(),
      };

      // 4. Add to the "reports" collection — Firestore auto-generates the document ID
      const docRef = await addDoc(collection(db, "reports"), reportData);

      setSavedReportId(docRef.id);
      setSubmitted(true);

    } catch (err: any) {
      console.error("Firestore save error:", err);
      Alert.alert(
        "Submission failed",
        err?.message ?? "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Reset form ─────────────────────────────────────────────────────────────

  const handleReportAnother = () => {
    setLocationText("");
    setLocationCoords(null);
    setIncidentType("");
    setSeverity("");
    setDescription("");
    setFullName("");
    setContact("");
    setPhotoUri(null);
    setSubmitted(false);
    setSavedReportId("");
  };

  // ─── Success Screen ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <View style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Report Submitted</Text>
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <MaterialCommunityIcons name="check-circle" size={72} color="#2E7D32" />
          </View>
          <Text style={styles.successTitle}>Report Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your incident report has been saved and authorities will be notified shortly.
          </Text>

          <View style={styles.successIdBox}>
            <Text style={styles.successIdLabel}>Report ID</Text>
            <Text style={styles.successIdValue} numberOfLines={1} ellipsizeMode="middle">
              {savedReportId}
            </Text>
          </View>

          <View style={styles.successDetailBox}>
            {[
              { icon: "alert-circle-outline", label: "Type",     value: incidentType },
              { icon: "gauge",                label: "Severity", value: severity },
              { icon: "map-marker-outline",   label: "Location", value: locationText },
              { icon: "clock-outline",        label: "Status",   value: "Pending" },
            ].map((item) => (
              <View key={item.label} style={styles.successDetailRow}>
                <MaterialCommunityIcons name={item.icon as any} size={16} color="#B71C1C" />
                <Text style={styles.successDetailLabel}>{item.label}:</Text>
                <Text style={styles.successDetailValue} numberOfLines={1}>{item.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.successPrimaryBtn} onPress={() => router.replace("/(tabs)" as any)}>
            <MaterialCommunityIcons name="home" size={18} color="#fff" />
            <Text style={styles.successPrimaryBtnText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.successSecondaryBtn} onPress={handleReportAnother}>
            <Text style={styles.successSecondaryBtnText}>Report Another Incident</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Main Form ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.page}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.push("/(tabs)" as any)}>
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Dropdown overlay */}
      {activeDropdown && (
        <Pressable style={styles.dropdownBackdrop} onPress={() => setActiveDropdown(null)}>
          <View style={[styles.optionList, { top: dropdownLayout.top, left: dropdownLayout.left, width: dropdownLayout.width }]}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {activeDropdown === "type" ? (
                incidentTypes.map((item) => (
                  <TouchableOpacity key={item} style={styles.optionItem} onPress={() => { setIncidentType(item); setActiveDropdown(null); }}>
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                severityLevels.map((item) => (
                  <TouchableOpacity key={item.value} style={styles.optionItem} onPress={() => { setSeverity(item.label); setActiveDropdown(null); }}>
                    <View style={styles.severityRow}>
                      <View style={[styles.severityDot, { backgroundColor: item.color }]} />
                      <Text style={styles.optionText}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      )}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── Location ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Location <Text style={styles.required}>*</Text></Text>
          <View style={styles.locationRow}>
            <TextInput
              style={styles.locationInput}
              placeholder="Type address or tap pin for GPS"
              placeholderTextColor="#999"
              value={locationText}
              onChangeText={(t) => { setLocationText(t); setLocationCoords(null); }}
            />
            <TouchableOpacity style={styles.locationButton} onPress={handleUseCurrentLocation}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {__DEV__ && (
            <TouchableOpacity
              style={styles.teleportButton}
              onPress={() => setTeleportPickerVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="map-marker-path" size={16} color="#B71C1C" />
              <Text style={styles.teleportButtonText}>Teleport (Dev)</Text>
            </TouchableOpacity>
          )}
          {locationCoords && (
            <Text style={styles.coordsHint}>
              📍 {locationCoords.latitude.toFixed(5)}, {locationCoords.longitude.toFixed(5)}
            </Text>
          )}
          <Text style={styles.caption}>Tap the pin icon to use your current GPS location.</Text>
        </View>

        {/* ── Incident Type ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Incident Type <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            ref={typeSelectorRef}
            style={styles.selector}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              setDropdownLayout((prev) => ({ ...prev, top: y + height + 16, left: x, width }));
            }}
            onPress={() => {
              setActiveDropdown(activeDropdown === "type" ? null : "type");
              setTimeout(() => {
                typeSelectorRef.current?.measureInWindow((x, y, width, height) => {
                  setDropdownLayout({ top: y + height, left: x, width, height });
                });
              }, 0);
            }}
          >
            <Text style={[styles.selectorText, !incidentType && styles.placeholderText]}>
              {incidentType || "Select incident type"}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#444" />
          </TouchableOpacity>
        </View>

        {/* ── Severity ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>How serious is it? <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            ref={severitySelectorRef}
            style={styles.selector}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              setDropdownLayout((prev) => ({ ...prev, top: y + height + 16, left: x, width }));
            }}
            onPress={() => {
              setActiveDropdown(activeDropdown === "severity" ? null : "severity");
              setTimeout(() => {
                severitySelectorRef.current?.measureInWindow((x, y, width, height) => {
                  setDropdownLayout({ top: y + height, left: x, width, height });
                });
              }, 0);
            }}
          >
            <Text style={[styles.selectorText, !severity && styles.placeholderText]}>
              {severity || "Select severity"}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#444" />
          </TouchableOpacity>
        </View>

        {/* ── Description ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what happened..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* ── Name & Contact ── */}
        <View style={styles.rowGroup}>
          <View style={styles.flexField}>
            <Text style={styles.fieldLabel}>Your Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={styles.flexField}>
            <Text style={styles.fieldLabel}>Contact <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="09XX-XXX-XXXX"
              placeholderTextColor="#999"
              keyboardType={Platform.OS === "ios" ? "number-pad" : "phone-pad"}
              value={contact}
              onChangeText={setContact}
            />
          </View>
        </View>

        {/* ── Photo ── */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <MaterialCommunityIcons name="camera-outline" size={40} color="#999" />
            <TouchableOpacity style={styles.photoButton} onPress={handleUseCamera}>
              <Text style={styles.photoButtonText}>
                {photoUri ? "Retake photo" : "Upload photo from camera"}
              </Text>
            </TouchableOpacity>
            {photoUri && (
              <View style={styles.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setPhotoUri(null)}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="#B71C1C" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ── Required note ── */}
        <Text style={styles.requiredNote}><Text style={styles.required}>*</Text> Required fields</Text>

        {/* ── Submit Button ── */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={teleportPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTeleportPickerVisible(false)}
      >
        <Pressable style={styles.teleportBackdrop} onPress={() => setTeleportPickerVisible(false)}>
          <Pressable style={styles.teleportSheet} onPress={() => {}}>
            <View style={styles.teleportHandle} />
            <Text style={styles.teleportTitle}>Teleport to a landmark</Text>
            <Text style={styles.teleportSubtitle}>
              Pick a local landmark to auto-fill latitude and longitude.
            </Text>

            <View style={styles.teleportList}>
              {teleportLandmarks.map((landmark) => (
                <TouchableOpacity
                  key={landmark.name}
                  style={styles.teleportItem}
                  onPress={() => handleTeleportToLandmark(landmark)}
                  activeOpacity={0.85}
                >
                  <View style={styles.teleportItemIcon}>
                    <MaterialCommunityIcons name="map-marker-radius" size={18} color="#fff" />
                  </View>
                  <View style={styles.teleportItemText}>
                    <Text style={styles.teleportItemName}>{landmark.name}</Text>
                    <Text style={styles.teleportItemCoords}>
                      {landmark.latitude.toFixed(4)}, {landmark.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#bbb" />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page:          { flex: 1, backgroundColor: "#fafafa" },
  headerBar:     { backgroundColor: "#B71C1C", paddingTop: 48, paddingBottom: 18, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle:   { color: "#fff", fontSize: 20, fontWeight: "bold" },
  closeButton:   { padding: 8 },
  content:       { padding: 16 },
  fieldGroup:    { marginBottom: 20 },
  fieldLabel:    { marginBottom: 10, color: "#333", fontWeight: "600" },
  required:      { color: "#B71C1C", fontWeight: "700" },
  requiredNote:  { fontSize: 12, color: "#999", marginBottom: 16, marginTop: 4 },

  // Location
  locationRow:   { flexDirection: "row", alignItems: "center", gap: 10 },
  locationInput: { flex: 1, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 14, paddingVertical: 14, color: "#222" },
  locationButton:{ width: 50, height: 50, borderRadius: 14, backgroundColor: "#B71C1C", justifyContent: "center", alignItems: "center" },
  coordsHint:    { marginTop: 6, fontSize: 11, color: "#B71C1C", fontWeight: "600" },
  caption:       { marginTop: 6, color: "#666", fontSize: 12 },
  teleportButton: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", backgroundColor: "#fff3f3", borderWidth: 1, borderColor: "#f3d0d0", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  teleportButtonText: { color: "#B71C1C", fontSize: 12, fontWeight: "700" },

  teleportBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  teleportSheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 22, maxHeight: "70%" },
  teleportHandle: { alignSelf: "center", width: 44, height: 4, borderRadius: 999, backgroundColor: "#ddd", marginBottom: 14 },
  teleportTitle: { fontSize: 18, fontWeight: "800", color: "#1a1a1a", textAlign: "center" },
  teleportSubtitle: { fontSize: 13, color: "#666", textAlign: "center", marginTop: 6, marginBottom: 16, lineHeight: 18 },
  teleportList: { gap: 10 },
  teleportItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: "#fafafa", borderWidth: 1, borderColor: "#eee" },
  teleportItemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#B71C1C", justifyContent: "center", alignItems: "center" },
  teleportItemText: { flex: 1 },
  teleportItemName: { fontSize: 14, fontWeight: "800", color: "#1a1a1a" },
  teleportItemCoords: { marginTop: 2, fontSize: 12, color: "#777" },

  // Dropdowns
  selector:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  selectorText:     { color: "#222", fontSize: 15 },
  placeholderText:  { color: "#999" },
  optionList:       { position: "absolute", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, overflow: "hidden", maxHeight: 240, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, zIndex: 30 },
  dropdownScroll:   { maxHeight: 240 },
  dropdownBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.06)", zIndex: 20 },
  optionItem:       { paddingHorizontal: 14, paddingVertical: 14 },
  optionText:       { color: "#333", fontSize: 15 },
  severityRow:      { flexDirection: "row", alignItems: "center", gap: 10 },
  severityDot:      { width: 12, height: 12, borderRadius: 6 },

  // Text fields
  textArea:  { minHeight: 100, backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, color: "#222" },
  rowGroup:  { flexDirection: "row", gap: 12, marginBottom: 20 },
  flexField: { flex: 1 },
  input:     { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: "#222" },

  // Photo
  photoSection:    { marginTop: 4, marginBottom: 20 },
  photoContainer:  { borderWidth: 1, borderStyle: "dashed", borderColor: "#bbb", borderRadius: 16, padding: 24, alignItems: "center", backgroundColor: "#fff" },
  photoButton:     { marginTop: 18, width: "100%", backgroundColor: "#f8f8f8", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  photoButtonText: { color: "#444", fontWeight: "700" },
  photoPreviewWrap:{ marginTop: 16, width: "100%", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#ddd", position: "relative" },
  photoPreview:    { width: "100%", height: 180 },
  removePhotoBtn:  { position: "absolute", top: 8, right: 8, backgroundColor: "#fff", borderRadius: 12 },

  // Submit
  submitButton:     { marginTop: 8, backgroundColor: "#B71C1C", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, elevation: 4, shadowColor: "#B71C1C", shadowOpacity: 0.3, shadowRadius: 8 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Success screen
  successContainer:     { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  successIconCircle:    { width: 120, height: 120, borderRadius: 60, backgroundColor: "#e8f5e9", justifyContent: "center", alignItems: "center", marginBottom: 20, borderWidth: 2, borderColor: "#c8e6c9" },
  successTitle:         { fontSize: 26, fontWeight: "800", color: "#1a1a1a", marginBottom: 8 },
  successSubtitle:      { fontSize: 14, color: "#777", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  successIdBox:         { backgroundColor: "#f5f5f5", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, width: "100%", marginBottom: 20 },
  successIdLabel:       { fontSize: 11, color: "#aaa", fontWeight: "700", marginBottom: 4, letterSpacing: 0.5 },
  successIdValue:       { fontSize: 13, color: "#555", fontWeight: "600", fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  successDetailBox:     { width: "100%", backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#eee", gap: 10 },
  successDetailRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  successDetailLabel:   { fontSize: 13, fontWeight: "700", color: "#444", width: 70 },
  successDetailValue:   { fontSize: 13, color: "#666", flex: 1 },
  successPrimaryBtn:    { backgroundColor: "#B71C1C", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", paddingVertical: 15, borderRadius: 14, elevation: 4, shadowColor: "#B71C1C", shadowOpacity: 0.3, shadowRadius: 8 },
  successPrimaryBtnText:{ color: "#fff", fontSize: 16, fontWeight: "800" },
  successSecondaryBtn:  { marginTop: 14, paddingVertical: 8 },
  successSecondaryBtnText: { fontSize: 14, color: "#B71C1C", fontWeight: "700" },
});