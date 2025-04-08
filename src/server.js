const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('../config');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 连接MongoDB
mongoose.connect(config.mongodb.url, config.mongodb.options)
  .catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  });

// 监听MongoDB连接事件
mongoose.connection.once('open', () => {
  console.log('MongoDB连接成功');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err);
});

// API路由
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    success: false,
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 