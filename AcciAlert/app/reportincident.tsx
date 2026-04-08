import React, { useRef, useState } from "react";
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
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

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
  { label: "High - Urgent", value: "high", color: "#F57C00" },
  { label: "Medium - Moderate", value: "medium", color: "#FBC02D" },
  { label: "Low - Minor", value: "low", color: "#1976D2" },
];

export default function ReportIncidentScreen() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [incidentType, setIncidentType] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<"type" | "severity" | null>(null);
  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const typeSelectorRef = useRef<View | null>(null);
  const severitySelectorRef = useRef<View | null>(null);

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

    // Try Nominatim (OpenStreetMap) reverse geocoding first
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "Accept-Language": "en", "User-Agent": "IncidentReporterApp/1.0" } }
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
        const city = addr.city || addr.town || addr.municipality || addr.suburb || "";
        const region = addr.state || addr.province || "";
        const country = addr.country || "";
        const parts = [street, city, region, country].filter(Boolean);

        if (parts.length > 0) {
          setLocation(parts.join(", "));
          return;
        }
      }
    } catch {
      // Nominatim failed, fall through to expo-location
    }

    // Fallback: expo-location reverse geocode
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = places[0];

    if (place) {
      const streetParts = [place.streetNumber, place.street].filter(Boolean).join(" ");
      const parts = [streetParts, place.city, place.region, place.country].filter(Boolean);
      if (parts.length > 0) {
        setLocation(parts.join(", "));
        return;
      }
    }

    setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
  } catch {
    Alert.alert("Location unavailable", "Unable to get your current location right now.");
  }
};

  const handleUseCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Camera permission needed", "Please allow camera access to capture a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Camera unavailable", "Unable to open the camera right now.");
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/(tabs)')}>
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {activeDropdown && (
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setActiveDropdown(null)}
        >
          <View
            style={[
              styles.optionList,
              {
                top: dropdownLayout.top,
                left: dropdownLayout.left,
                width: dropdownLayout.width,
              },
            ]}
          >
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {activeDropdown === "type" ? (
                incidentTypes.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.optionItem}
                    onPress={() => {
                      setIncidentType(item);
                      setActiveDropdown(null);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                severityLevels.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.optionItem}
                    onPress={() => {
                      setSeverity(item.label);
                      setActiveDropdown(null);
                    }}
                  >
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
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Location</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={styles.locationInput}
              placeholder="GPS Coordinates"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={styles.locationButton} onPress={handleUseCurrentLocation}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.caption}>
            Tap the pin icon to use your current location.
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Incident Type</Text>
          <TouchableOpacity
            ref={typeSelectorRef}
            style={styles.selector}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
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

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>How serious is it?</Text>
          <TouchableOpacity
            ref={severitySelectorRef}
            style={styles.selector}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
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

        <View style={styles.rowGroup}>
          <View style={styles.flexField}>
            <Text style={styles.fieldLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={styles.flexField}>
            <Text style={styles.fieldLabel}>Contact</Text>
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

        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <MaterialCommunityIcons name="camera-outline" size={40} color="#999" />
            <TouchableOpacity style={styles.photoButton} onPress={handleUseCamera}>
              <Text style={styles.photoButtonText}>Upload photo from camera</Text>
            </TouchableOpacity>
            {photoUri && (
              <View style={styles.photoPreviewWrap}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  headerBar: {
    backgroundColor: "#B71C1C",
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    marginBottom: 10,
    color: "#333",
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#222",
  },
  locationButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
  },
  caption: {
    marginTop: 8,
    color: "#666",
    fontSize: 12,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectorText: {
    color: "#222",
    fontSize: 15,
  },
  placeholderText: {
    color: "#999",
  },
  optionList: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: 240,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 30,
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.06)",
    zIndex: 20,
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionText: {
    color: "#333",
    fontSize: 15,
  },
  severityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textArea: {
    minHeight: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    color: "#222",
  },
  rowGroup: {
    flexDirection: "row",
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#222",
  },
  photoSection: {
    marginTop: 10,
  },
  photoContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#bbb",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  photoLabel: {
    marginTop: 14,
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  photoButton: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#f8f8f8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#444",
    fontWeight: "700",
  },
  photoPreviewWrap: {
    marginTop: 16,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  photoPreview: {
    width: "100%",
    height: 180,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#B71C1C",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});