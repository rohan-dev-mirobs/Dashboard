import React, { useRef, useMemo } from "react";
import { Card, Col, Row, Divider, Spin, Button, Statistic, Progress } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useReactToPrint } from "react-to-print";
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from "@ant-design/icons";
import useBins from "../hooks/useBins"; // Custom hook

export const ReportPage = ({ textColor, theme }) => {
  const { binData, loading, error } = useBins();
  const componentRef = useRef();  // Create a reference for the content to print

  // Memoized data
  const monthlyData = useMemo(() => {
    if (!binData) return [];
    const monthlyCollectedBins = binData.reduce((acc, bin) => {
      const month = new Date(bin.lastUpdated).toLocaleString('default', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(monthlyCollectedBins).map(([month, count]) => ({ month, count }));
  }, [binData]);

  const binStatuses = useMemo(() => {
    if (!binData) return { online: 0, offline: 0, alerts: 0 };
    return binData.reduce(
      (acc, bin) => {
        if (bin.status === "ON") acc.online++;
        else acc.offline++;
        acc.alerts += bin.binLevel >= 95 || bin.batteryLevel <= 15 || bin.temperature >= 45 ? 1 : 0;
        return acc;
      },
      { online: 0, offline: 0, alerts: 0 }
    );
  }, [binData]);

  const statusPieData = useMemo(() => [
    { name: "Online", value: binStatuses.online },
    { name: "Offline", value: binStatuses.offline },
    { name: "Alerts", value: binStatuses.alerts },
  ], [binStatuses]);

  const COLORS = ["#52c41a", "#ff4d4f", "#faad14"];

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,  // Pass the ref to the component you want to print
  });

  // Loading and error handling
  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "auto", padding: "20px" }} />;
  }

  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>Error: {error}</div>;
  }

  return (
    <div
      ref={componentRef}  // Attach the ref to the container that you want to print
      style={{
        overflowY: "auto",
        height: "100vh",
        padding: "20px",
        backgroundColor: theme,
        color: textColor,
      }}
    >
      <div className="dash-items" style={{ color: textColor, backgroundColor: theme }}>
        <Divider orientation="center" style={{ fontSize: "18px" }}>
          🚮 Bins Summary
        </Divider>
        <Row gutter={[16, 16]} justify="space-around">
          <Col span={6}>
            <Card>
              <Statistic
                title="Online Bins"
                value={binStatuses.online}
                valueStyle={{ color: "#52c41a" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Offline Bins"
                value={binStatuses.offline}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Alert Bins"
                value={binStatuses.alerts}
                valueStyle={{ color: "#faad14" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="center" style={{ fontSize: "18px" }}>
          📊 Monthly Collection
        </Divider>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        <Divider orientation="center" style={{ fontSize: "18px" }}>
          🍩 Bin Status Distribution
        </Divider>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <PieChart width={400} height={400}>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Col>
          <Col span={12}>
            <Card>
              <Progress
                type="circle"
                percent={Math.round(
                  (binStatuses.online / (binStatuses.online + binStatuses.offline)) * 100
                )}
                format={(percent) => `${percent}% Online`}
              />
            </Card>
          </Col>
        </Row>

        <Divider />
        <Button
          onClick={handlePrint}
          type="primary"
          style={{
            display: "block",
            margin: "20px auto",
            backgroundColor: "#1890ff",
            color: "#fff",
          }}
        >
          Download Report as PDF
        </Button>
      </div>
    </div>
  );
};

export default ReportPage;
