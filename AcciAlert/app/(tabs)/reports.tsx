import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ReportsScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const reports = [
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
      date: "04/11/2026",
      reporter: "John Doe",
      status: "Reported",
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
      date: "04/11/2026",
      reporter: "Jane Smith",
      status: "In Review",
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
      date: "04/11/2026",
      reporter: "Traffic Department",
      status: "Resolved",
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
      date: "04/11/2026",
      reporter: "City Council",
      status: "In Review",
    },
    {
      id: 5,
      type: "Road Debris",
      severity: "Low",
      location: "Makati Ave",
      latitude: 14.5533,
      longitude: 121.0235,
      coordinates: "14.5533° N, 121.0235° E",
      description: "Broken glass and debris scattered on roadway",
      icon: "alert-octagon",
      time: "15 min ago",
      date: "04/11/2026",
      reporter: "Anonymous",
      status: "Reported",
    },
  ];

  // Filter reports based on search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;

    const query = searchQuery.toLowerCase();
    return reports.filter(
      (report) =>
        report.location.toLowerCase().includes(query) ||
        report.type.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        report.reporter.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleViewDetails = (report: typeof reports[0]) => {
    router.push({
      pathname: "/incidentdetail",
      params: {
        id: report.id,
        type: report.type,
        severity: report.severity,
        location: report.location,
        latitude: report.latitude,
        longitude: report.longitude,
        coordinates: report.coordinates,
        description: report.description,
        icon: report.icon,
        time: report.time,
        date: report.date,
        reporter: report.reporter,
        status: report.status,
      },
    });
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.reportsList} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location, type, reporter..."
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.reportsTitle}>
            {searchQuery ? "Search Results" : "All Reports"}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredReports.length} total</Text>
          </View>
        </View>

        {filteredReports.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <MaterialCommunityIcons name="magnify" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No reports found</Text>
            <Text style={styles.noResultsSubtext}>
              Try searching for a different location or reporter
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[
                styles.reportCard,
                selectedId === report.id && styles.reportCardSelected,
              ]}
              onPress={() => setSelectedId(selectedId === report.id ? null : report.id)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.severityBar,
                  { backgroundColor: getSeverityColor(report.severity) },
                ]}
              />
              <View
                style={[
                  styles.reportIconBox,
                  { backgroundColor: getSeverityBg(report.severity) },
                ]}
              >
                <MaterialCommunityIcons
                  name={report.icon as any}
                  size={22}
                  color={getSeverityColor(report.severity)}
                />
              </View>

              <View style={styles.reportInfo}>
                <View style={styles.reportTopRow}>
                  <Text style={styles.reportType}>{report.type}</Text>
                  <View
                    style={[
                      styles.severityChip,
                      { backgroundColor: getSeverityBg(report.severity) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityChipText,
                        { color: getSeverityColor(report.severity) },
                      ]}
                    >
                      {report.severity}
                    </Text>
                  </View>
                </View>

                <View style={styles.locationRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color="#B71C1C" />
                  <Text style={styles.reportLocation}>{report.location}</Text>
                  <Text style={styles.reportTime}>• {report.time}</Text>
                </View>

                {selectedId === report.id && (
                  <View style={styles.expandedInfo}>
                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Status:</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusBg(report.status) },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: getStatusColor(report.status) }]}
                        >
                          {report.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Reporter:</Text>
                      <Text style={styles.expandedValue}>{report.reporter}</Text>
                    </View>

                    <Text style={styles.reportCoordinates}>📍 {report.coordinates}</Text>
                    <Text style={styles.reportDescription}>{report.description}</Text>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleViewDetails(report)}
                      >
                        <MaterialCommunityIcons name="eye" size={16} color="#B71C1C" />
                        <Text style={styles.actionButtonText}>View Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
                        <MaterialCommunityIcons name="share-variant" size={16} color="#666" />
                        <Text style={styles.actionButtonTextSecondary}>Share</Text>
                      </TouchableOpacity>
                    </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  reportsList: {
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
  reportsTitle: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    height: 42,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    paddingVertical: 8,
  },
  reportCard: {
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
  reportCardSelected: {
    borderWidth: 1.5,
    borderColor: "#B71C1C",
  },
  severityBar: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    minHeight: 40,
  },
  reportIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  reportInfo: {
    flex: 1,
  },
  reportTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportType: {
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
  reportLocation: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  reportTime: {
    fontSize: 11,
    color: "#aaa",
  },
  expandedInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 8,
  },
  expandedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expandedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    minWidth: 70,
  },
  expandedValue: {
    fontSize: 12,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  reportCoordinates: {
    fontSize: 11,
    color: "#999",
  },
  reportDescription: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    backgroundColor: "#ffebee",
    borderRadius: 8,
  },
  actionButtonSecondary: {
    backgroundColor: "#f5f5f5",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#B71C1C",
    fontWeight: "700",
  },
  actionButtonTextSecondary: {
    fontSize: 12,
    color: "#666",
    fontWeight: "700",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  noResultsSubtext: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
