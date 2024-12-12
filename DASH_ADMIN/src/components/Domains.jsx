import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Input,
  Button,
  List,
  Typography,
  Divider,
  Select,
  message,
  Spin,
} from "antd";
import { PlusOutlined, SyncOutlined } from "@ant-design/icons";
import useBins from "../hooks/useBins"; // Fetch dynamic bin data

const { Option } = Select;

// Utility to process and get the latest bin data
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

// BinIcon component to show level as filled colors
const BinIcon = ({ level }) => {
  let fillColor = "green";
  if (level > 90) fillColor = "red";
  else if (level > 50) fillColor = "yellow";

  const fillPercentage = Math.min(level, 100);

  return (
    <div style={{ position: "relative", width: 40, height: 60, marginLeft: 20 }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 10,
          width: "70%",
          height: `${fillPercentage}%`,
          backgroundColor: fillColor,
          opacity: 0.6,
          zIndex: 1,
        }}
      />
      <img
        src="/BinU.png"
        alt="Bin Icon"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "120%",
          height: "110%",
          zIndex: 2,
        }}
      />
    </div>
  );
};

export const Domains = ({ theme, textColor }) => {
  const { binData, loading, error } = useBins(); // Fetch dynamic bin data
  const [sites, setSites] = useState({});
  const [newSiteName, setNewSiteName] = useState("");
  const [selectedBins, setSelectedBins] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [binOptions, setBinOptions] = useState([]);
  const [latestData, setLatestData] = useState([]); // Latest bin data

  // Process bin data to get the latest data for each bin
  useEffect(() => {
    const processedData = binData ? getLatestData(binData) : [];
    setLatestData(processedData);

    // Prepare bin options for the Select component
    const options = processedData.map((bin) => ({
      label: `${bin.binName} - ${bin.deviceId}`,
      value: bin.deviceId,
      binData: bin,
    }));
    setBinOptions(options);
  }, [binData]);

  // Handle adding a new site
  const handleAddSite = () => {
    if (newSiteName && !sites[newSiteName]) {
      setSites({ ...sites, [newSiteName]: [] });
      setNewSiteName("");
    } else {
      message.error("Please enter a unique site name.");
    }
  };

  // Handle bin selection
  const handleBinSelection = (selectedValues) => {
    const selectedBinData = latestData.filter((bin) =>
      selectedValues.includes(bin.deviceId)
    );
    setSelectedBins(selectedBinData);
  };

  // Handle grouping bins
  const handleGroupBins = () => {
    if (newGroupName && selectedBins.length > 0) {
      setSites((prevSites) => ({
        ...prevSites,
        [newGroupName]: selectedBins,
      }));
      setSelectedBins([]); // Clear selected bins
      setNewGroupName(""); // Clear group name input
      message.success(`Bins grouped under ${newGroupName}`);
    } else {
      message.error("Please select bins and provide a group name.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
        <p style={{ color: textColor, marginTop: "15px" }}>Loading bin data...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        overflowY: "scroll",
        height: "100vh",
        color: textColor,
        backgroundColor: theme,
      }}
    >
      <Typography.Title style={{ color: textColor }} level={2}>
        Domains
      </Typography.Title>

      <Divider style={{ borderColor: "#0044cc" }}>New Site</Divider>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Input
            placeholder="Enter site name"
            value={newSiteName}
            onChange={(e) => setNewSiteName(e.target.value)}
          />
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSite}>
            Add Site
          </Button>
        </Col>
      </Row>

      <Divider style={{ borderColor: "#0044cc" }}>Group Selected Bins</Divider>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Input
            placeholder="Enter group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </Col>
        <Col span={12}>
          <Select
            mode="multiple"
            placeholder="Select bins"
            onChange={handleBinSelection}
            style={{ width: "100%" }}
          >
            {binOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button type="primary" onClick={handleGroupBins}>
            Group Bins
          </Button>
        </Col>
      </Row>

      <Divider style={{ borderColor: "#0044cc" }}>All Sites and Devices</Divider>
      {Object.keys(sites).map((groupName) => (
        <Card
          key={groupName}
          title={`Group: ${groupName}`}
          style={{ marginBottom: 20 }}
          bordered
          headStyle={{ fontSize: "1.2rem" }}
        >
          <List
            bordered
            dataSource={sites[groupName]}
            renderItem={(device) => (
              <List.Item key={device.deviceId}>
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <div style={{ flexGrow: 1 }}>
                    <Typography.Text strong>{device.binName}</Typography.Text> - Status: {device.status}, Level:{" "}
                    {device.binLevel}%
                  </div>
                  <BinIcon level={device.binLevel} />
                </div>
              </List.Item>
            )}
          />
          {sites[groupName].length === 0 && (
            <Typography.Text type="secondary">
              No devices in this group.
            </Typography.Text>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Domains;
