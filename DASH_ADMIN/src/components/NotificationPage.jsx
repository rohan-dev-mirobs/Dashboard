import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Input, Spin } from 'antd';
import useBins from "../hooks/useBins"; // Fetch bin data dynamically

const BIN_LEVEL_THRESHOLD = 900000;

// Map alarms to meaningful names
const ALERTS_MAPPING = {
  fullAlarm: 'Bin Full',
  fireAlarm: 'Fire Detected',
  tiltAlarm: 'Tilt Detected',
  batteryAlarm: 'Low Battery',
};

// Function to get the latest data for each device
const getLatestData = (data) => {
  const latestData = {};
  data.forEach((item) => {
    const existingItem = latestData[item.deviceId];
    if (!existingItem || new Date(item.timestamp) > new Date(existingItem.timestamp)) {
      latestData[item.deviceId] = item;
    }
  });
  return Object.values(latestData);
};

export const NotificationPage = ({ theme, textColor }) => {
  const { binData, loading, error } = useBins();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Function to check thresholds and generate alert status
  const checkThresholds = (bin) => {
    const alerts = [];

    if (bin.height >= BIN_LEVEL_THRESHOLD) {
      alerts.push(ALERTS_MAPPING.fullAlarm);
    }
    console.log('tuntuun',bin.fireAlarm)
    if (bin.fireAlarm === 7) {
      alerts.push(ALERTS_MAPPING.fireAlarm);
    }
    if (bin.tiltAlarm === 7) {
      alerts.push(ALERTS_MAPPING.tiltAlarm);
    }
    if (bin.batteryAlarm === 7) {
      alerts.push(ALERTS_MAPPING.batteryAlarm);
    }

    return { ...bin, alertMessages: alerts.length > 0 ? alerts : ['No Alerts'] };
  };

  // Effect to update filtered data based on fetched bins and search query
  useEffect(() => {
    if (binData && binData.length > 0) {
      const latestBinData = getLatestData(binData);

      const updatedData = latestBinData
        .map(checkThresholds)
        .filter((bin) => bin.deviceId.toString().includes(searchQuery));

      setFilteredData(updatedData);
    }
  }, [binData, searchQuery]);

  // Columns definition for the Ant Design Table
  const columns = [
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      sorter: (a, b) => a.deviceId.localeCompare(b.deviceId),
    },
    {
      title: 'Alert Types',
      dataIndex: 'alertMessages',
      key: 'alertMessages',
      render: (alerts) => (
        <>{
          alerts.map((alert, index) => {
            const color =
              alert === 'Bin Full' ? 'red' :
              alert === 'Fire Detected' ? 'orange' :
              alert === 'Tilt Detected' ? 'blue' :
              alert === 'Low Battery' ? 'volcano' :
              'green';
            return <Tag color={color} key={index}>{alert}</Tag>;
          })
        }</>
      ),
    },
    {
      title: 'Bin Level (cm)',
      dataIndex: 'height', // Use height as bin level
      key: 'height',
      sorter: (a, b) => a.height - b.height,
    },
    {
      title: 'Temperature (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      sorter: (a, b) => a.temperature - b.temperature,
    },
    {
      title: 'Battery Voltage (V)',
      dataIndex: 'volt',
      key: 'volt',
      sorter: (a, b) => a.volt - b.volt,
    },
    {
      title: 'Last Updated',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
  ];

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "200px" }}>
        <Spin size="large" />
        <p style={{ color: textColor, padding: "15px" }}>Loading bin data...</p>
      </div>
    );

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', color: textColor, backgroundColor: theme }}>
      <h1 style={{ textAlign: 'center' }}>Device Alerts</h1>

      {/* Search by Device ID */}
      <Space style={{ marginBottom: 16 }}>
        <span>Search by Device ID:</span>
        <Input
          placeholder="Enter Device ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 200 }}
        />
      </Space>

      {/* Table to Display Alerts */}
      <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 5 }} rowKey="deviceId" />
    </div>
  );
};

export default NotificationPage;
