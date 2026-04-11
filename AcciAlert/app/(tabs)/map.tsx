import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseconfig";

// ─── Types ────────────────────────────────────────────────────────────────────

type Report = {
  id: string;
  type: string;
  severity: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  coordinates: string;
  description: string;
  icon: string;
  time: string;
  date: string;
  reporter: string;
  status: string;
};

// ─── Status colors ─────────────────────────────────────────────────────────────
// Pending = amber, In Progress = blue, Resolved = green

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase() ?? "";
  if (s === "pending")                                                    return "#F59E0B";
  if (s === "in progress" || s === "in-progress" || s === "inprogress")  return "#3B82F6";
  if (s === "resolved")                                                   return "#16A34A";
  return "#6B7280";
};

const getStatusBg = (status: string) => {
  const s = status?.toLowerCase() ?? "";
  if (s === "pending")                                                    return "#FEF3C7";
  if (s === "in progress" || s === "in-progress" || s === "inprogress")  return "#EFF6FF";
  if (s === "resolved")                                                   return "#F0FDF4";
  return "#F3F4F6";
};

// ─── Severity helpers ──────────────────────────────────────────────────────────

const getSeverityColor = (severity: string) => {
  const s = severity?.toLowerCase() ?? "";
  if (s.includes("critical")) return "#B71C1C";
  if (s.includes("high"))     return "#E65100";
  if (s.includes("medium"))   return "#F9A825";
  if (s.includes("low"))      return "#1976D2";
  return "#6B7280";
};

const getSeverityBg = (severity: string) => {
  const s = severity?.toLowerCase() ?? "";
  if (s.includes("critical")) return "#ffebee";
  if (s.includes("high"))     return "#fff3e0";
  if (s.includes("medium"))   return "#fffde7";
  if (s.includes("low"))      return "#e3f2fd";
  return "#F3F4F6";
};

const getSeverityLabel = (severity: string) => {
  const s = severity?.toLowerCase() ?? "";
  if (s.includes("critical")) return "Critical";
  if (s.includes("high"))     return "High";
  if (s.includes("medium"))   return "Medium";
  if (s.includes("low"))      return "Low";
  return severity || "Unknown";
};

// ─── Other helpers ─────────────────────────────────────────────────────────────

const getIconForType = (type: string): string => {
  const t = type?.toLowerCase() ?? "";
  if (t.includes("fire"))                              return "fire";
  if (t.includes("traffic") || t.includes("accident")) return "car-emergency";
  if (t.includes("pothole"))                           return "alert-circle";
  if (t.includes("debris"))                            return "alert-octagon";
  if (t.includes("flood"))                             return "water";
  if (t.includes("congestion"))                        return "car-multiple";
  if (t.includes("sign"))                              return "sign-caution";
  return "alert";
};

const formatTime = (ts: any): string => {
  if (!ts) return "Unknown";
  try {
    const date: Date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)    return "Just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day(s) ago`;
  } catch { return "Unknown"; }
};

const formatDate = (ts: any): string => {
  if (!ts) return "Unknown";
  try {
    const date: Date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-PH", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch { return "Unknown"; }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const router = useRouter();
  const [reports, setReports]         = useState<Report[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const webViewRef = useRef<any>(null);

  // ─── Firestore listener ────────────────────────────────────────────────────
  // reportincident.tsx saves:
  //   incidentType, severity, description
  //   location: { address, latitude, longitude }   ← nested object
  //   reporterName, contactNumber
  //   status: "Pending"
  //   timestamp: serverTimestamp()                 ← field is "timestamp", not "createdAt"

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mapped: Report[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data() as Record<string, any>;

          // Location is a nested object: { address, latitude, longitude }
          const locationObj = d.location ?? {};
          const lat: number | null =
            locationObj.latitude  ?? d.locationCoords?.latitude  ?? d.latitude  ?? null;
          const lng: number | null =
            locationObj.longitude ?? d.locationCoords?.longitude ?? d.longitude ?? null;
          const address: string =
            typeof locationObj === "string"
              ? locationObj
              : (locationObj.address ?? d.locationText ?? "Unknown location");

          // Timestamp field is "timestamp"; fall back to "createdAt" for old docs
          const ts = d.timestamp ?? d.createdAt ?? null;

          return {
            id:          docSnap.id,
            type:        d.incidentType ?? d.type ?? "Unknown",
            severity:    d.severity     ?? "low",
            location:    address,
            latitude:    lat,
            longitude:   lng,
            coordinates: lat != null && lng != null
              ? `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
              : "No coordinates",
            description: d.description ?? "",
            icon:        getIconForType(d.incidentType ?? d.type ?? ""),
            time:        formatTime(ts),
            date:        formatDate(ts),
            reporter:    d.reporterName ?? d.fullName ?? d.reporter ?? "Anonymous",
            status:      d.status ?? "Pending",
          };
        });

        setReports(mapped);
        setLoading(false);
      },
      (error) => {
        console.error("Map: Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ─── Search filter ─────────────────────────────────────────────────────────

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.location.toLowerCase().includes(q)    ||
        r.type.toLowerCase().includes(q)        ||
        r.description.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [searchQuery, reports]);

  // ─── Map HTML ─────────────────────────────────────────────────────────────

  const generateMapHTML = () => {
    const mappable = filteredReports.filter((r) => r.latitude != null && r.longitude != null);
    const center = mappable.length > 0
      ? [mappable[0].latitude!, mappable[0].longitude!]
      : [14.6091, 121.0159];

    // Map pins use STATUS color
    const markersJSON = JSON.stringify(
      mappable.map((r) => ({
        lat:         r.latitude,
        lng:         r.longitude,
        title:       r.type,
        description: r.location,
        severity:    getSeverityLabel(r.severity),
        status:      r.status,
        color:       getStatusColor(r.status),
      }))
    );

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>*{margin:0;padding:0;}#map{height:100vh;width:100%;}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var markers = ${markersJSON};
    var map = L.map('map').setView(${JSON.stringify(center)}, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'© OpenStreetMap contributors', maxZoom:19
    }).addTo(map);
    markers.forEach(function(m){
      var c = L.circleMarker([m.lat,m.lng],{
        radius:12, fillColor:m.color, color:'#fff',
        weight:2, opacity:1, fillOpacity:0.9
      }).addTo(map);
      c.bindPopup(
        '<div style="text-align:center;min-width:160px;">'+
        '<strong style="font-size:13px;">'+m.title+'</strong><br>'+
        '<small style="color:#666;">'+m.description+'</small><br>'+
        '<span style="color:'+m.color+';font-weight:bold;font-size:11px;">'+m.status+'</span>'+
        ' &middot; <small style="color:#888;">'+m.severity+'</small>'+
        '</div>'
      );
    });
  </script>
</body>
</html>`;
  };

  // ─── Navigate to detail ────────────────────────────────────────────────────

  const handleViewFullReport = (r: Report) => {
    router.push({
      pathname: "/incidentdetail",
      params: {
        id: r.id, type: r.type, severity: r.severity,
        location: r.location, latitude: r.latitude ?? "",
        longitude: r.longitude ?? "", coordinates: r.coordinates,
        description: r.description, icon: r.icon,
        time: r.time, date: r.date, reporter: r.reporter, status: r.status,
      },
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* Map */}
      <WebView
        ref={webViewRef}
        style={styles.mapContainer}
        source={{ html: generateMapHTML() }}
        scrollEnabled zoomEnabled scalesPageToFit
      />

      {/* Status legend */}
      <View style={styles.legend}>
        {[
          { label: "Pending",     color: "#F59E0B" },
          { label: "In Progress", color: "#3B82F6" },
          { label: "Resolved",    color: "#16A34A" },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* List */}
      <ScrollView style={styles.incidentsList} showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location, type, or status..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Header row */}
        <View style={styles.listHeader}>
          <Text style={styles.incidentsTitle}>
            {searchQuery ? "Search Results" : "All Reports"}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {loading ? "…" : `${filteredReports.length} total`}
            </Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#B71C1C" size="large" />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No reports found</Text>
            <Text style={styles.noResultsSubtext}>
              {searchQuery
                ? "Try a different search term"
                : "No incident reports submitted yet"}
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[
                styles.incidentCard,
                selectedId === report.id && styles.incidentCardSelected,
              ]}
              onPress={() => setSelectedId(selectedId === report.id ? null : report.id)}
              activeOpacity={0.85}
            >
              {/* Severity bar */}
              <View style={[styles.severityBar, { backgroundColor: getSeverityColor(report.severity) }]} />

              {/* Icon */}
              <View style={[styles.incidentIconBox, { backgroundColor: getSeverityBg(report.severity) }]}>
                <MaterialCommunityIcons
                  name={report.icon as any}
                  size={22}
                  color={getSeverityColor(report.severity)}
                />
              </View>

              {/* Info */}
              <View style={styles.incidentInfo}>

                {/* Type + severity */}
                <View style={styles.incidentTopRow}>
                  <Text style={styles.incidentType} numberOfLines={1}>{report.type}</Text>
                  <View style={[styles.severityChip, { backgroundColor: getSeverityBg(report.severity) }]}>
                    <Text style={[styles.severityChipText, { color: getSeverityColor(report.severity) }]}>
                      {getSeverityLabel(report.severity)}
                    </Text>
                  </View>
                </View>

                {/* Location + time */}
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color="#B71C1C" />
                  <Text style={styles.incidentLocation} numberOfLines={1}>{report.location}</Text>
                  <Text style={styles.incidentTime}>• {report.time}</Text>
                </View>

                {/* Status badge — always visible */}
                <View style={styles.statusBadgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBg(report.status) }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(report.status) }]} />
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(report.status) }]}>
                      {report.status}
                    </Text>
                  </View>
                </View>

                {/* Expanded details */}
                {selectedId === report.id && (
                  <View style={styles.expandedInfo}>
                    <Text style={styles.incidentCoordinates}>📍 {report.coordinates}</Text>
                    {!!report.description && (
                      <Text style={styles.incidentDescription}>{report.description}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => handleViewFullReport(report)}
                    >
                      <Text style={styles.detailsButtonText}>View Full Report</Text>
                      <MaterialCommunityIcons name="arrow-right" size={16} color="#B71C1C" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <MaterialCommunityIcons
                name={selectedId === report.id ? "chevron-up" : "chevron-down"}
                size={20}
                color="#ccc"
              />
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#f5f5f5" },
  mapContainer: { height: 280, backgroundColor: "#e8e8e8", borderBottomColor: "#d0d0d0", borderBottomWidth: 1, overflow: "hidden" },

  legend:     { flexDirection: "row", justifyContent: "center", gap: 16, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#555", fontWeight: "600" },

  incidentsList: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },

  loadingBox:  { alignItems: "center", paddingVertical: 40, gap: 10 },
  loadingText: { color: "#aaa", fontSize: 13, fontWeight: "600" },

  listHeader:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  incidentsTitle: { fontSize: 16, fontWeight: "800", color: "#1a1a1a" },
  countBadge:     { backgroundColor: "#B71C1C", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  countText:      { color: "#fff", fontSize: 11, fontWeight: "700" },

  incidentCard:         { backgroundColor: "white", padding: 14, borderRadius: 12, marginBottom: 10, flexDirection: "row", alignItems: "flex-start", gap: 10, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  incidentCardSelected: { borderWidth: 1.5, borderColor: "#B71C1C" },
  severityBar:          { width: 4, borderRadius: 2, minHeight: 60, alignSelf: "stretch" },
  incidentIconBox:      { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  incidentInfo:         { flex: 1 },

  incidentTopRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  incidentType:     { fontSize: 14, fontWeight: "700", color: "#1a1a1a", flex: 1, marginRight: 6 },
  severityChip:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  severityChipText: { fontSize: 11, fontWeight: "700" },

  locationRow:      { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  incidentLocation: { fontSize: 12, color: "#666", fontWeight: "500", flex: 1 },
  incidentTime:     { fontSize: 11, color: "#aaa" },

  statusBadgeRow: { flexDirection: "row", marginTop: 6 },
  statusBadge:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusDot:      { width: 7, height: 7, borderRadius: 4 },
  statusBadgeText:{ fontSize: 11, fontWeight: "700" },

  expandedInfo:        { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0", gap: 6 },
  incidentCoordinates: { fontSize: 11, color: "#999" },
  incidentDescription: { fontSize: 13, color: "#555", lineHeight: 18 },
  detailsButton:       { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  detailsButtonText:   { fontSize: 13, color: "#B71C1C", fontWeight: "700" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 12, borderRadius: 10, marginBottom: 16, height: 42, gap: 8, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  searchInput:     { flex: 1, fontSize: 14, color: "#1a1a1a", paddingVertical: 8 },

  noResultsContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  noResultsText:      { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  noResultsSubtext:   { fontSize: 13, color: "#999", textAlign: "center", paddingHorizontal: 20 },
});