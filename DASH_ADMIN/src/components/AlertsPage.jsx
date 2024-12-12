import React, { useState } from 'react';
import { Table, Button, Spin } from 'antd';
import useBins from '../hooks/useBins';

export const AlertsPage = ({ textColor, theme }) => {
  const { binData, loading, error } = useBins(); // Use the hook
  const [refreshing, setRefreshing] = useState(false);

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

  // Apply the getLatestData function to binData
  const latestBinData = getLatestData(binData);

  // Filter the latest bin data for bins with height (bin level) >= 90
  const filteredBinData = latestBinData.filter((bin) => bin.height >= 90);

  const handleRefresh = async () => {
    setRefreshing(true);
    // You might want to trigger a re-fetch of bin data here, if supported
    setRefreshing(false);
  };

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '200px' }}>
        <Spin size="large" />
        <p style={{ color: textColor, padding: '15px' }}>Loading bin data...</p>
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  if (!filteredBinData || filteredBinData.length === 0)
    return <p>No bin data available (bin level below 90).</p>;

  const columns = [
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
    },
    {
      title: 'Bin Level',
      dataIndex: 'height', // Use height as bin level
      key: 'height',
      render: (text) => `${text} cm`, // Display height with units
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp) => `${temp} °C`,
    },
    {
      title: 'Battery Voltage',
      dataIndex: 'volt', // Use volt as battery level
      key: 'volt',
      render: (volt) => `${volt} V`,
    },
    {
      title: 'Last Updated',
      dataIndex: 'timestamp', // Use timestamp for last updated
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Full Alarm',
      dataIndex: 'fullAlarm',
      key: 'fullAlarm',
      render: (alarm) => (alarm === 7 ? 'Triggered' : 'Normal'),
    },
  ];

  return (
    <div style={{ padding: '20px', color: textColor, backgroundColor: theme }}>
      <h1 style={{ textAlign: 'center' }}>Bin Data Alerts</h1>

      <Button
        onClick={handleRefresh}
        loading={refreshing}
        type="primary"
        style={{ marginBottom: '16px' }}
      >
        Refresh Data
      </Button>

      <Table
        columns={columns}
        dataSource={filteredBinData} // Display only the latest bins with binLevel >= 90
        pagination={{ pageSize: 5 }}
        rowKey="deviceId" // Ensure each row has a unique key
      />
    </div>
  );
};

export default AlertsPage;
