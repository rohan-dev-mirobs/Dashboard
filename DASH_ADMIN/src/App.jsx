import { useState } from 'react' 
import { useEffect } from "react";
import { Button, Layout, theme } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import Logo from './components/Logo';
import { MenuList } from './components/MenuList';
import { ToggleTheme } from "./ToggleTheme";
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { BinDevice } from './components/BinDevice';
import { BinMap } from './components/BinMap';
import { AlertsPage } from './components/AlertsPage';
import {NotificationPage} from './components/NotificationPage'
import {Domains} from './components/Domains'
import {ReportPage} from './components/ReportPage'
import { MapProvider } from "./components/MapProvider";
import {CheckBinThresholds} from "./components/CheckBinThresholds";

const { Header, Sider } = Layout;

function App() {
  const [darkTheme, SetdarkTheme] = useState(true);
  const [collapsed, setcollapsed] = useState(false);

  const toggleThemee = () => {
    SetdarkTheme(!darkTheme);
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    
    <Layout className={darkTheme ? 'dark-mode' : '.light-mode'} >
      
      
      <Sider collapsed={collapsed} collapsible trigger={null} theme={darkTheme ? "dark" : "light"} className='sidebar'>
        <Logo />
        <MenuList theme={darkTheme ? "dark" : "light"} />
      </Sider>

      <Layout>
          <div style={{
            backgroundColor: darkTheme ? "#0f1026" : "#f5f5f5", // Dark or light background based on darkTheme
            padding: '16px',
          }}>
            <Button
  type='text'
  className='toggle'
  style={{
    color: darkTheme ? '#ffffff' : '#000000', // White in dark mode, black in light mode
  }}
  onClick={() => setcollapsed(!collapsed)}
  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
/>

          
            <ToggleTheme darkTheme={darkTheme} toggleThemee={toggleThemee} />
          </div>
        <MapProvider>
        <Routes>
          <Route path="/" element={<Dashboard theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          
          <Route path="/bin-devices" element={<BinDevice theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          <Route path="/bin-map" element={<BinMap theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          
          <Route path="/Alerts-Page" element={<AlertsPage theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          <Route path="/Notifi-Page" element={<NotificationPage theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          <Route path="/Domains-page" element={<Domains theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          <Route path="/Report-page" element={<ReportPage theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          <Route path="/check-sms" element={<CheckBinThresholds theme={darkTheme ? "#0f1026" : "#f5f5f5"} textColor={darkTheme ? "white" : "black"} />} />
          
        </Routes>
        {/* This is where we add CheckBinThresholds to run in the background */}
         {/* This component checks bin thresholds and sends SMS */}
        </MapProvider>
      </Layout>
    </Layout>
  );
}

export default App;
