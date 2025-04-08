import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Typography, Spin, message } from 'antd';
import { UniformOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      message.error('获取统计数据失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>仪表盘</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <UniformOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Title level={3}>{stats?.uniformCount || 0}</Title>
              <Text>校服总数</Text>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <Title level={3}>{stats?.manufacturerCount || 0}</Title>
              <Text>生产商总数</Text>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <WarningOutlined style={{ fontSize: '32px', color: '#faad14' }} />
              <Title level={3}>{stats?.expiringCertificates?.length || 0}</Title>
              <Text>即将过期证书</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="即将过期的证书">
            <List
              dataSource={stats?.expiringCertificates || []}
              renderItem={cert => (
                <List.Item>
                  <div>
                    <Text strong>{cert.uniform_id?.name || '未知校服'}</Text>
                    <br />
                    <Text type="secondary">
                      有效期至: {new Date(cert.valid_until).toLocaleDateString()}
                    </Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无即将过期的证书' }}
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="最近添加的校服">
            <List
              dataSource={stats?.recentUniforms || []}
              renderItem={uniform => (
                <List.Item>
                  <div>
                    <Text strong>{uniform.name}</Text>
                    <br />
                    <Text type="secondary">
                      生产商: {uniform.manufacturer_id?.name || '未知'}
                    </Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无最近添加的校服' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 