import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { SkinOutlined, BankOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    uniformCount: 0,
    manufacturerCount: 0,
    certificateCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [uniforms, manufacturers, certificates] = await Promise.all([
          axios.get('/api/uniforms'),
          axios.get('/api/manufacturers'),
          axios.get('/api/certificates')
        ]);

        setStats({
          uniformCount: uniforms.data.length,
          manufacturerCount: manufacturers.data.length,
          certificateCount: certificates.data.length
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="校服总数"
              value={stats.uniformCount}
              prefix={<SkinOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="厂商总数"
              value={stats.manufacturerCount}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="证书总数"
              value={stats.certificateCount}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard; 