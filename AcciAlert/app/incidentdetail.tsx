import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

export default function IncidentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webViewRef = useRef<any>(null);

  // Parse incident data from params
  const incident = {
    id: parseInt(params.id as string) || 0,
    type: params.type as string || "Unknown",
    severity: params.severity as string || "Low",
    location: params.location as string || "Unknown Location",
    latitude: parseFloat(params.latitude as string) || 0,
    longitude: parseFloat(params.longitude as string) || 0,
    coordinates: params.coordinates as string || "0° N, 0° E",
    description: params.description as string || "",
    icon: params.icon as string || "alert",
    time: params.time as string || "Unknown time",
    date: params.date as string || "Unknown date",
    reporter: params.reporter as string || "Anonymous",
    status: params.status as string || "Reported",
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "#B71C1C";
      case "Medium":
        return "#E65100";
      case "Low":
        return "#F9A825";
      default:
        return "#2E7D32";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "#ffebee";
      case "Medium":
        return "#fff3e0";
      case "Low":
        return "#fffde7";
      default:
        return "#e8f5e9";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported":
        return "#1976D2";
      case "In Review":
        return "#F57C00";
      case "Resolved":
        return "#388E3C";
      default:
        return "#666";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "Reported":
        return "#E3F2FD";
      case "In Review":
        return "#FFF3E0";
      case "Resolved":
        return "#E8F5E9";
      default:
        return "#f5f5f5";
    }
  };

  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          #map { height: 100vh; width: 100%; }
          .leaflet-popup-content { font-size: 12px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${incident.latitude}, ${incident.longitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const circleMarker = L.circleMarker([${incident.latitude}, ${incident.longitude}], {
            radius: 15,
            fillColor: '${getSeverityColor(incident.severity)}',
            color: '#fff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(map);

          circleMarker.bindPopup(\`
            <div style="text-align: center; min-width: 180px;">
              <strong style="font-size: 14px;">${incident.type}</strong><br>
              <small style="color: #666;">${incident.location}</small><br>
              <small style="color: ${getSeverityColor(incident.severity)}; font-weight: bold;">${incident.severity}</small>
            </div>
          \`).openPopup();
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapSection}>
          <WebView
            ref={webViewRef}
            style={styles.mapContainer}
            source={{ html: generateMapHTML() }}
            scrollEnabled={true}
            zoomEnabled={true}
            scalesPageToFit={true}
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Type and Severity */}
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={incident.icon as any}
                size={28}
                color={getSeverityColor(incident.severity)}
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.incidentType}>{incident.type}</Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getSeverityBg(incident.severity) },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getSeverityColor(incident.severity) },
                    ]}
                  >
                    {incident.severity}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getStatusBg(incident.status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getStatusColor(incident.status) },
                    ]}
                  >
                    {incident.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#B71C1C" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{incident.location}</Text>
              </View>
            </View>
          </View>

          {/* Coordinates */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#1976D2" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Coordinates</Text>
                <Text style={styles.infoValue}>{incident.coordinates}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="text-box" size={20} color="#F57C00" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.infoValue}>{incident.description}</Text>
              </View>
            </View>
          </View>

          {/* Reporter Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={20} color="#388E3C" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Reported By</Text>
                <Text style={styles.infoValue}>{incident.reporter}</Text>
              </View>
            </View>
          </View>

          {/* Time Info */}
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.timeLabel}>{incident.date}</Text>
            </View>
            <View style={styles.timeItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.timeLabel}>{incident.time}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="phone" size={18} color="#B71C1C" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="share-variant" size={18} color="#B71C1C" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="flag" size={18} color="#B71C1C" />
              <Text style={styles.actionButtonText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  content: {
    flex: 1,
  },
  mapSection: {
    height: 320,
    backgroundColor: "#e8e8e8",
    borderBottomColor: "#d0d0d0",
    borderBottomWidth: 1,
    overflow: "hidden",
  },
  mapContainer: {
    flex: 1,
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cardHeader: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  incidentType: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 13,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#B71C1C",
    fontWeight: "700",
  },
});
