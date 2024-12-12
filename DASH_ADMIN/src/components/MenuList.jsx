import React from 'react';
import { Menu } from 'antd';
import { SettingOutlined, HomeOutlined, PieChartOutlined, DeleteOutlined, ContactsOutlined, AlertOutlined, EnvironmentOutlined, UserOutlined,MessageOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ToggleTheme from '../ToggleTheme'; // Assuming you have this component

export const MenuList = ({ theme, darkTheme, toggleThemee }) => {
  const menuItems = [
    {
      key: 'Dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'Smart Bin',
      icon: <DeleteOutlined />,
      label: <Link to="/bin-devices">Smart Bin</Link>,
    },
    {
      key: 'Domains',
      icon: <ContactsOutlined />,
      label: <Link to="/Domains-page">Domains</Link>,
    },
    
    {
      key: 'Map',
      icon: <EnvironmentOutlined />,
      label: <Link to="/bin-map">Map</Link>,
    },
    {
      key: 'Alerts',
      icon: <AlertOutlined />,
      label: <Link to="/Alerts-Page">Alerts</Link>,
    },
    {
      key: 'Notification',
      icon: <MessageOutlined />,
      label: <Link to="/Notifi-Page">Notification</Link>,
    },
    
    {
      key: 'User',
      icon: <UserOutlined />,
      label: 'User',
    },
    {
      key: 'Report',
      icon: <PieChartOutlined />,
      label: <Link to="/Report-Page">Report</Link>,
    },
    {
      key: 'Setting',
      icon: <SettingOutlined />,
      label: 'Setting',
    },
    {
      key: 'Audit Logs',
      icon: <AlertOutlined />,
      label: <Link to="/check-sms">sms</Link>,
    },
  ];

  return (
    <div className="menu-container">
      {/* Render the menu */}
      <Menu theme={theme} mode='inline' className='menu-bar' items={menuItems} />

      {/* Add the ToggleTheme button below the menu */}
      
    </div>
  );
};
