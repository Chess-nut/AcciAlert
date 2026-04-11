import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const webViewRef = useRef<any>(null);

  const incidents = [
    {
      id: 1,
      type: "Traffic Accident",
      severity: "Critical",
      location: "Gen. Luna St.",
      latitude: 14.6091,
      longitude: 121.0159,
      coordinates: "14.6091° N, 121.0159° E",
      description: "Multi-vehicle collision blocking two lanes",
      icon: "car-emergency",
      time: "2 hrs ago",
    },
    {
      id: 2,
      type: "Pothole",
      severity: "Medium",
      location: "Jones Ave",
      latitude: 14.5994,
      longitude: 121.0322,
      coordinates: "14.5994° N, 121.0322° E",
      description: "Large pothole causing delays and vehicle damage",
      icon: "alert-circle",
      time: "1 hr ago",
    },
    {
      id: 3,
      type: "Congestion",
      severity: "Low",
      location: "EDSA",
      latitude: 14.6042,
      longitude: 121.0322,
      coordinates: "14.6042° N, 121.0322° E",
      description: "Heavy traffic volume, expect 30-min delays",
      icon: "car-multiple",
      time: "30 min ago",
    },
    {
      id: 4,
      type: "Road Flooding",
      severity: "Medium",
      location: "España Blvd.",
      latitude: 14.6097,
      longitude: 120.9897,
      coordinates: "14.6097° N, 120.9897° E",
      description: "Knee-deep floodwater, road impassable",
      icon: "water",
      time: "45 min ago",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "#B71C1C";
      case "Medium": return "#E65100";
      case "Low": return "#F9A825";
      default: return "#2E7D32";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "Critical": return "#ffebee";
      case "Medium": return "#fff3e0";
      case "Low": return "#fffde7";
      default: return "#e8f5e9";
    }
  };

  const generateMapHTML = () => {
    const markersJSON = JSON.stringify(
      incidents.map((incident) => ({
        id: incident.id,
        lat: incident.latitude,
        lng: incident.longitude,
        title: incident.type,
        description: incident.location,
        severity: incident.severity,
        color: getSeverityColor(incident.severity),
      }))
    );

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
          const markers = ${markersJSON};
          const defaultCenter = [14.6091, 121.0159];
          
          const map = L.map('map').setView(defaultCenter, 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          markers.forEach(marker => {
            const circleMarker = L.circleMarker([marker.lat, marker.lng], {
              radius: 12,
              fillColor: marker.color,
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9
            }).addTo(map);

            circleMarker.bindPopup(\`
              <div style="text-align: center; min-width: 150px;">
                <strong>\${marker.title}</strong><br>
                <small style="color: #666;">\${marker.description}</small><br>
                <small style="color: \${marker.color}; font-weight: bold;">\${marker.severity}</small>
              </div>
            \`);
          });
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      {/* OpenStreetMap */}
      <WebView
        ref={webViewRef}
        style={styles.mapContainer}
        source={{ html: generateMapHTML() }}
        scrollEnabled={true}
        zoomEnabled={true}
        scalesPageToFit={true}
      />

      {/* Incidents List */}
      <ScrollView style={styles.incidentsList} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Text style={styles.incidentsTitle}>Nearby Incidents</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{incidents.length} active</Text>
          </View>
        </View>

        {incidents.map((incident) => (
          <TouchableOpacity
            key={incident.id}
            style={[
              styles.incidentCard,
              selectedId === incident.id && styles.incidentCardSelected,
            ]}
            onPress={() => setSelectedId(selectedId === incident.id ? null : incident.id)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.severityBar,
                { backgroundColor: getSeverityColor(incident.severity) },
              ]}
            />
            <View style={[styles.incidentIconBox, { backgroundColor: getSeverityBg(incident.severity) }]}>
              <MaterialCommunityIcons
                name={incident.icon as any}
                size={22}
                color={getSeverityColor(incident.severity)}
              />
            </View>
            <View style={styles.incidentInfo}>
              <View style={styles.incidentTopRow}>
                <Text style={styles.incidentType}>{incident.type}</Text>
                <View style={[styles.severityChip, { backgroundColor: getSeverityBg(incident.severity) }]}>
                  <Text style={[styles.severityChipText, { color: getSeverityColor(incident.severity) }]}>
                    {incident.severity}
                  </Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={13} color="#B71C1C" />
                <Text style={styles.incidentLocation}>{incident.location}</Text>
                <Text style={styles.incidentTime}>• {incident.time}</Text>
              </View>
              {selectedId === incident.id && (
                <View style={styles.expandedInfo}>
                  <Text style={styles.incidentCoordinates}>
                    📍 {incident.coordinates}
                  </Text>
                  <Text style={styles.incidentDescription}>{incident.description}</Text>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View Full Report</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color="#B71C1C" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <MaterialCommunityIcons
              name={selectedId === incident.id ? "chevron-up" : "chevron-down"}
              size={20}
              color="#ccc"
            />
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mapContainer: {
    height: 300,
    backgroundColor: "#e8e8e8",
    borderBottomColor: "#d0d0d0",
    borderBottomWidth: 1,
    overflow: "hidden",
  },
  incidentsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  incidentsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  countBadge: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  incidentCard: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  incidentCardSelected: {
    borderWidth: 1.5,
    borderColor: "#B71C1C",
  },
  severityBar: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    minHeight: 40,
  },
  incidentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  incidentType: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  severityChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  incidentLocation: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  incidentTime: {
    fontSize: 11,
    color: "#aaa",
  },
  expandedInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 6,
  },
  incidentCoordinates: {
    fontSize: 11,
    color: "#999",
  },
  incidentDescription: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  detailsButtonText: {
    fontSize: 13,
    color: "#B71C1C",
    fontWeight: "700",
  },
});