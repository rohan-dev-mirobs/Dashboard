import React, { useState } from 'react';
import { Card, Col, Row, Slider, Checkbox, Divider, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import useBins from '../hooks/useBins';
import 'leaflet/dist/leaflet.css';

export const BinDevice = ({ theme, textColor }) => {
  const [filter, setFilter] = useState({
    batteryLevel: 100, // Start from 100%
    height: 0,
    showAlarmsOnly: false,
  });
  

  const navigate = useNavigate(); // Initialize navigation

  const { binData, loading } = useBins();

  // Utility to fetch the latest data for each device
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '200px' }}>
        <Spin size="large" />
        <p style={{ color: textColor, padding: '15px' }}>Loading bin data...</p>
      </div>
    );
  }

  // Filter bins based on selected criteria
  const latestBins = getLatestData(binData);
  const filteredBins = latestBins.filter((bin) => {
    return (
      bin.batteryAlarm <= filter.batteryLevel &&
      bin.height >= filter.height &&
      (!filter.showAlarmsOnly || bin.fullAlarm > 0 || bin.fireAlarm > 0 || bin.tiltAlarm > 0)
    );
  });

  // Handle navigation to bin location
  const handleLocationClick = (bin) => {
    navigate(`/bin-map?deviceId=${bin.deviceId}`);
  };

  return (
    <div
      style={{
        overflowY: 'auto',
        height: '100vh',
        padding: '20px',
        backgroundColor: theme,
        color: textColor,
      }}
    >
      {/* Filters Section */}
      <Divider style={{ borderColor: '#0044cc', color: textColor, backgroundColor: theme }}>
        Filters
      </Divider>
      <Row gutter={16} style={{ marginBottom: '20px', margin: '0 20px' }}>
        <Col span={8}>
          <p>Battery Alarm Level</p>
          <Slider
            min={0}
            max={100}
            defaultValue={filter.batteryLevel}
            onChange={(value) => setFilter({ ...filter, batteryLevel: value })}
            tooltip={{
              visible: true,
              formatter: (value) => `0% - ${value}%`,
            }}
          />
        </Col>
        <Col span={8}>
          <p>Height</p>
          <Slider
            min={0}
            max={50000} // Example max value for height
            defaultValue={filter.height}
            onChange={(value) => setFilter({ ...filter, height: value })}
            tooltip={{ visible: true }}
          />
        </Col>
        <Col span={8}>
          <Checkbox
            onChange={(e) => setFilter({ ...filter, showAlarmsOnly: e.target.checked })}
            style={{ color: textColor, backgroundColor: theme }}
          >
            Show Alarms Only (Full, Fire, or Tilt Alarms)
          </Checkbox>
        </Col>
      </Row>

      {/* Bins Section */}
      <Divider style={{ borderColor: '#0044cc', color: textColor, backgroundColor: theme }}>
        Bins
      </Divider>
      <div
        style={{
          height: '400px',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Row gutter={[16, 16]}>
          {filteredBins.map((bin) => (
            <Col span={24} key={bin.key}>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                  <p>
                    <strong>Bin ID:</strong> {bin.deviceId}
                  </p>
                  <p>
                    <strong>Height:</strong> {bin.height} cm
                  </p>
                  <p>
                    <strong>Battery Alarm:</strong> {bin.batteryAlarm}%
                  </p>
                  <p>
                    <strong>Temperature:</strong> {bin.temperature}°C
                  </p>
                  <p>
                    <strong>Longitude:</strong> {bin.longitude}
                  </p>
                  <p>
                    <strong>Latitude:</strong> {bin.latitude}
                  </p>
                  <Button type="primary" ghost onClick={() => handleLocationClick(bin)}>
                    Location
                  </Button>
                  <Button type={bin.fullAlarm > 0 ? 'danger' : 'primary'}>
                    {bin.fullAlarm > 0 ? 'Alarm Active' : 'Normal'}
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default BinDevice;
