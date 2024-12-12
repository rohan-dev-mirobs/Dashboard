import useBins from "../hooks/useBins"; // Import the useBins hook
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Divider, Spin } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Thresholds
const BATTERY_LEVEL_THRESHOLD = 15;
const BIN_LEVEL_THRESHOLD = 95;
const TEMPERATURE_THRESHOLD = 45;

// Function to get the latest data for each bin
const getLatestData = (data) => {
  const latestData = {};
  data.forEach((item) => {
    const existingItem = latestData[item.deviceId];
    if (!existingItem || new Date(item.lastUpdated) > new Date(existingItem.lastUpdated)) {
      latestData[item.deviceId] = item;
    }
  });
  return Object.values(latestData);
};

// Function to calculate the usage data for the line chart based on alerts
const calculateUsageData = (bins) => {
  const alertData = bins.reduce((acc, bin) => {
    const date = new Date(bin.lastUpdated).toLocaleDateString("en-US");
    const isAlert =
      bin.batteryLevel < BATTERY_LEVEL_THRESHOLD ||
      bin.binLevel >= BIN_LEVEL_THRESHOLD ||
      bin.temperature >= TEMPERATURE_THRESHOLD;

    if (isAlert) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(alertData).map(([date, alerts]) => ({
    time: date,
    alerts,
  }));
};

// Calculate bin statuses for summary cards
const calculateBinStatuses = (bins) => {
  let online = 0;
  let offline = 0;
  let alertBins = 0;

  bins.forEach((bin) => {
    const isAlert =
      bin.batteryLevel < BATTERY_LEVEL_THRESHOLD ||
      bin.binLevel >= BIN_LEVEL_THRESHOLD ||
      bin.temperature >= TEMPERATURE_THRESHOLD;

    if (isAlert) {
      alertBins++;
    }
    if (bin.status === "ON") {
      online++;
    } else {
      offline++;
    }
  });

  return { online, offline, alertBins, totalBins: bins.length };
};

// Generate bin icons
const getBinIcon = (level) => {
  if (level < 70) {
    return L.icon({
      iconUrl: "/green-bin.png",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  }
  if (level >= 70 && level < 90) {
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

// Component
export const Dashboard = ({ textColor, theme }) => {
  const { binData, loading, error } = useBins(); // Use the hook for bin data

  // Show a loading spinner or error message if data is not yet loaded
  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: 'auto', padding: '20px' }} />;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  const latestBins = getLatestData(binData); // Get the latest data for each bin
  const usageData = calculateUsageData(latestBins); // Alerts data for the line chart
  const { online, offline, alertBins, totalBins } = calculateBinStatuses(latestBins); // Summary data

  return (
    <div style={{ overflowY: "auto", height: "100vh", padding: "20px", backgroundColor: theme }}>
      <div className="dash-items" style={{ color: textColor, backgroundColor: theme }}>
        {/* Bins Summary */}
        <Divider style={{ borderColor: "#0044cc", color: textColor, backgroundColor: theme }}>
          Bins Summary
        </Divider>
        <Row justify="space-around" style={{ color: textColor, backgroundColor: theme }}>
          <Col span={5}>
            <Card title="Total Bins" bordered={false} style={{ color: "black" }}>
              <CheckCircleOutlined style={{ fontSize: "24px", color: "#52c41a" }} /> {totalBins}
            </Card>
          </Col>
          <Col span={5}>
            <Card title="Total Online Bins" bordered={false} style={{ color: "black" }}>
              <CheckCircleOutlined style={{ fontSize: "24px", color: "#52c41a" }} /> {online}
            </Card>
          </Col>
          <Col span={5}>
            <Card title="Total Offline Bins" bordered={false} style={{ color: "#ff4d4f" }}>
              <CloseCircleOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} /> {offline}
            </Card>
          </Col>
          <Col span={5}>
            <Card title="Total Alert Bins" bordered={false} style={{ color: "#faad14" }}>
              <WarningOutlined style={{ fontSize: "24px", color: "#faad14" }} /> {alertBins}
            </Card>
          </Col>
        </Row>

        {/* Bin Usage Line Chart */}
        <Divider style={{ borderColor: "#0044cc", color: textColor, backgroundColor: theme }}>
          Bin Usage Based on Alerts
        </Divider>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="alerts" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>

        {/* Map Showing All Bins */}
        <Divider style={{ borderColor: "#0044cc", color: textColor, backgroundColor: theme }}>
          All Bin Locations
        </Divider>
        <MapContainer center={[23.6548, 53.7501]} zoom={2} style={{ height: "400px", width: "100%" }}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {latestBins.map((bin, index) => {
  const { latitude, longitude } = bin.location || {};

  // Check if latitude and longitude are valid numbers
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    console.warn(`Bin ${bin.binName} has invalid location data (lat: ${latitude}, lon: ${longitude})`);
    return null; // Skip rendering this bin if the location is invalid
  }

  return (
    <Marker key={bin._id || index} position={[lat, lon]} icon={getBinIcon(bin.binLevel)}>
      <Popup>
        <strong>Bin Name:</strong> {bin.binName} <br />
        <strong>Level:</strong> {bin.binLevel}% <br />
        <strong>Battery:</strong> {bin.batteryLevel}% <br />
        <strong>Temperature:</strong> {bin.temperature} °C <br />
        <strong>Location:</strong> ({lat.toFixed(4)}, {lon.toFixed(4)})
      </Popup>
    </Marker>
  );
})}


</MapContainer>

      </div>
    </div>
  );
};

export default Dashboard;
