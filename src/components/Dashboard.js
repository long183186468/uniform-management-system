import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert } from 'antd';
import axios from 'axios';
import moment from 'moment';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data.data);
        setError(null);
      } catch (err) {
        setError('获取仪表盘数据失败');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <Alert message={error} type="error" />;
  if (!stats) return null;

  const certificateColumns = [
    {
      title: '制造商',
      dataIndex: ['manufacturer', 'name'],
      key: 'manufacturer',
    },
    {
      title: '证书编号',
      dataIndex: 'certificate_number',
      key: 'certificate_number',
    },
    {
      title: '到期时间',
      dataIndex: 'valid_until',
      key: 'valid_until',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
  ];

  const uniformColumns = [
    {
      title: '校服编号',
      dataIndex: 'uniform_number',
      key: 'uniform_number',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '添加时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="总体统计">
            <p>校服总数：{stats.totalUniforms}</p>
            <p>制造商总数：{stats.totalManufacturers}</p>
            <p>即将到期证书数量：{stats.expiringCertificates.length}</p>
          </Card>
        </Col>
        <Col span={24}>
          <Card title="即将到期的证书">
            <Table
              dataSource={stats.expiringCertificates}
              columns={certificateColumns}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="最近添加的校服">
            <Table
              dataSource={stats.recentUniforms}
              columns={uniformColumns}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 