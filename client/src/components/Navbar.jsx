import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { DashboardOutlined, SkinOutlined, BankOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Header } = Layout;

function Navbar() {
  const location = useLocation();

  const items = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">统计面板</Link>,
    },
    {
      key: '/uniforms',
      icon: <SkinOutlined />,
      label: <Link to="/uniforms">校服管理</Link>,
    },
    {
      key: '/manufacturers',
      icon: <BankOutlined />,
      label: <Link to="/manufacturers">厂商管理</Link>,
    },
    {
      key: '/certificates',
      icon: <SafetyCertificateOutlined />,
      label: <Link to="/certificates">证书管理</Link>,
    },
  ];

  return (
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
      />
    </Header>
  );
}

export default Navbar; 