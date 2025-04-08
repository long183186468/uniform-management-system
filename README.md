# 校服管理系统 (Uniform Management System)

一个完整的校服管理与追溯系统，通过二维码技术实现校服全生命周期信息管理。

## 项目概述

本系统致力于规范校服管理、提高透明度并保障学生权益，实现校服全生命周期信息的可追溯管理。通过信息化手段，解决校服信息不透明、质量无法追溯、管理流程繁琐等问题。

## 功能特性

- **校服信息管理**：包括批次管理、材质信息、图片管理等
- **二维码追溯**：实现校服信息的扫码查询
- **质检报告管理**：上传、验证和查询质检报告
- **图片管理**：提供校服图片上传与展示功能
- **投诉反馈**：建立统一的投诉反馈渠道

## 技术栈

- 前端：Vue.js + Element UI
- 后端：Node.js + Express
- 数据库：MongoDB
- 部署：Docker容器化

## 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/long183186468/uniform-management-system.git
cd uniform-management-system

# 安装依赖
npm install

# 启动MongoDB数据库
# (确保MongoDB已安装)
mongod --dbpath=./database/data/db

# 初始化测试数据
node init_test_data.js

# 启动服务器
npm start
```

### 访问系统

- 管理端：http://localhost:3000/admin
- 查询前端：http://localhost:3000

## 项目结构

```
uniform-management-system/
├── docs/              # 项目文档
├── public/            # 静态文件
│   ├── admin/         # 管理端页面
│   ├── uploads/       # 上传文件存储
│   └── js/            # 前端脚本
├── src/               # 后端源码
│   ├── models/        # 数据模型
│   ├── routes/        # 路由处理
│   └── server.js      # 服务器入口
├── tests/             # 测试文件
└── README.md          # 项目说明
```

## 详细文档

- [环境配置指南](docs/环境配置指南.md)：包含开发环境与生产环境的详细配置步骤
- [数据库设计](docs/4-数据库设计/mongodb_schema.md)：MongoDB数据模型设计
- [功能模块设计](docs/3-功能模块设计/README.md)：系统核心功能模块说明
- [技术方案](docs/5-技术方案/README.md)：关键技术实现方案

## 特点优势

1. 二维码追溯技术，确保校服信息公开透明
2. 前后端分离架构，提高系统可维护性
3. 响应式设计，支持多终端访问
4. 图片上传与展示，直观查看校服样式

## 贡献指南

欢迎为项目提供帮助！请fork项目，创建分支，提交更改，并发送pull request。

## 许可证

MIT 