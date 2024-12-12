import React, { useState, useEffect } from "react";
import { Divider, Spin } from "antd";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useBins from "../hooks/useBins"; // Custom hook for fetching bin data

// Function to get the latest data
const getLatestData = (data) => {
  const latestData = {};
  data.forEach((item) => {
    const existingItem = latestData[item.deviceId];
    if (!existingItem || new Date(item.timestamp) > new Date(existingItem.timestamp)) {
      latestData[item.deviceId] = item;
    }
  });
  console.log(latestData)
  return Object.values(latestData);
};

// Function to get the bin icon based on level and selection status
const getBinIcon = (binLevel, isSelected = false) => {
  if (isSelected) {
    return L.icon({
      iconUrl: "/selected-bin.png", // Custom icon for selected bins
      iconSize: [35, 35],
      iconAnchor: [17.5, 35],
    });
  }
  if (binLevel < 70) {
    return L.icon({
      iconUrl: "/green-bin.png",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  }
  if (binLevel >= 70 && binLevel < 95) {
    return L.icon({
      iconUrl: "/yellow-bin.png",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  }
  return L.icon({
    iconUrl: "/red-bin.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// CenterMap Component
const CenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 10); // Adjust zoom level as needed
    }
  }, [location, map]);
  return null;
};

export function BinMap({ textColor, theme }) {
  const { binData, loading, error } = useBins();
  const [searchParams] = useSearchParams();
  const [selectedBin, setSelectedBin] = useState(null); // Track selected bin
  const deviceId = searchParams.get("deviceId"); // Get deviceId from URL query

  // Effect to update selectedBin based on query parameter
  useEffect(() => {
    if (binData && deviceId) {
      const bin = binData.find((b) => b.deviceId === deviceId);
      setSelectedBin(bin || null);
    }
  }, [binData, deviceId]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "200px" }}>
        <Spin size="large" />
        <p style={{ color: textColor, padding: "15px" }}>Loading bin data...</p>
      </div>
    );

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  if (!binData || binData.length === 0) {
    return <p style={{ color: textColor }}>No bin data available.</p>;
  }

  const latestBins = getLatestData(binData); // Extract the latest data for each bin

  return (
    <div style={{ overflowY: "auto", height: "100vh", padding: "20px", backgroundColor: theme }}>
      <Divider style={{ borderColor: "#0044cc", color: textColor, backgroundColor: theme }}>
        Latest Bin Locations
      </Divider>
      <MapContainer
        center={
          selectedBin && selectedBin.latitude && selectedBin.longitude
            ? [selectedBin.latitude, selectedBin.longitude]
            : [15.712966, 129.523953] // Default center
        }
        zoom={selectedBin ? 10 : 2} // Adjust zoom dynamically
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selectedBin && selectedBin.latitude && selectedBin.longitude && (
          <CenterMap location={[selectedBin.latitude, selectedBin.longitude]} />
        )}
        {latestBins.map((bin) => {
          const { latitude, longitude, deviceId, height, temperature, fullAlarm, fireAlarm, tiltAlarm, batteryAlarm, voltage, timestamp } = bin;

          if (latitude && longitude) {
            const isSelected = selectedBin && selectedBin.deviceId === deviceId;

            return (
              <Marker
                key={deviceId}
                position={[latitude, longitude]}
                icon={getBinIcon(height, isSelected)}
                eventHandlers={{
                  click: () => setSelectedBin(bin),
                }}
              >
                <Tooltip direction="top" offset={[0, -30]} opacity={1}>
                  <div style={{ color: "black", textAlign: "center" }}>
                    <strong>Device ID:</strong> {deviceId} <br />
                    <strong>Level:</strong> {height}% <br />
                    <strong>Temperature:</strong> {temperature} °C <br />
                    <strong>Full Alarm:</strong> {fullAlarm} <br />
                    <strong>Fire Alarm:</strong> {fireAlarm} <br />
                    <strong>Tilt Alarm:</strong> {tiltAlarm} <br />
                    <strong>Battery Alarm:</strong> {batteryAlarm} <br />
                    <strong>Voltage:</strong> {voltage} V <br />
                    <strong>Last Update:</strong> {new Date(timestamp).toLocaleString()} <br />
                    <strong>Location:</strong> ({latitude}, {longitude})
                  </div>
                </Tooltip>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}

export default BinMap;
