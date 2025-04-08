# 7. 部署方案

## 7.1 部署架构

### 7.1.1 整体架构
```
用户层
├── Web浏览器
└── 移动端H5

接入层
├── CDN
├── 负载均衡
└── 反向代理

应用层
├── Web服务器集群
├── 应用服务器集群
└── 文件服务器

数据层
├── MySQL主从
├── Redis集群
└── MinIO集群
```

### 7.1.2 网络架构
```
互联网区域
└── 防火墙
    └── DMZ区
        ├── 负载均衡器
        └── 反向代理
            └── 应用区域
                ├── 应用服务器
                └── 文件服务器
                    └── 数据区域
                        ├── 数据库服务器
                        └── 缓存服务器
```

## 7.2 环境配置

### 7.2.1 服务器配置
1. 应用服务器
   ```yaml
   配置要求：
   - CPU: 8核
   - 内存: 16GB
   - 系统盘: 100GB SSD
   - 数据盘: 500GB SSD
   
   软件要求：
   - 操作系统: Ubuntu Server 20.04 LTS
   - JDK: OpenJDK 11
   - Docker: 20.10+
   - Docker Compose: 2.0+
   ```

2. 数据库服务器
   ```yaml
   配置要求：
   - CPU: 16核
   - 内存: 32GB
   - 系统盘: 100GB SSD
   - 数据盘: 1TB SSD
   
   软件要求：
   - 操作系统: Ubuntu Server 20.04 LTS
   - MySQL: 8.0
   - Redis: 6.2
   ```

### 7.2.2 网络配置
```yaml
网络规划：
- DMZ区域: 192.168.1.0/24
- 应用区域: 192.168.2.0/24
- 数据区域: 192.168.3.0/24

防火墙规则：
- DMZ → 应用区域: 80, 443
- 应用区域 → 数据区域: 3306, 6379
- 管理访问: 22
```

## 7.3 容器化部署

### 7.3.1 Docker Compose配置
```yaml
version: '3'

services:
  nginx:
    image: nginx:1.20
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    networks:
      - frontend
    depends_on:
      - web-app

  web-app:
    image: uniform-management-web:${TAG}
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JAVA_OPTS=-Xms1g -Xmx2g
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config
    networks:
      - frontend
      - backend
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=uniform_management
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    networks:
      - backend

  redis:
    image: redis:6.2
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  mysql_data:
  redis_data:
```

### 7.3.2 Nginx配置
```nginx
# HTTP配置
server {
    listen 80;
    server_name uniform.edu.guiyang.gov.cn;
    
    # 强制HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl;
    server_name uniform.edu.guiyang.gov.cn;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/uniform.crt;
    ssl_certificate_key /etc/nginx/ssl/uniform.key;
    
    # SSL优化配置
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        expires 7d;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://web-app:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 7.4 部署流程

### 7.4.1 环境准备
1. 基础环境
   ```bash
   # 更新系统
   apt update && apt upgrade -y
   
   # 安装基础工具
   apt install -y curl wget git vim
   
   # 安装Docker
   curl -fsSL https://get.docker.com | sh
   
   # 安装Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

2. 配置文件准备
   ```bash
   # 创建项目目录
   mkdir -p /opt/uniform-management
   cd /opt/uniform-management
   
   # 创建配置目录
   mkdir -p {nginx,mysql,redis,config,logs}
   
   # 复制配置文件
   cp nginx.conf nginx/conf/default.conf
   cp my.cnf mysql/conf/my.cnf
   cp redis.conf redis/conf/redis.conf
   ```

### 7.4.2 部署步骤
1. 构建镜像
   ```bash
   # 前端构建
   cd frontend
   npm install
   npm run build
   docker build -t uniform-management-web:${TAG} .
   
   # 后端构建
   cd backend
   ./mvnw clean package
   docker build -t uniform-management-api:${TAG} .
   ```

2. 启动服务
   ```bash
   # 启动所有服务
   docker-compose up -d
   
   # 查看服务状态
   docker-compose ps
   
   # 查看服务日志
   docker-compose logs -f
   ```

3. 数据初始化
   ```bash
   # 执行数据库初始化脚本
   docker-compose exec mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} uniform_management < init.sql
   
   # 导入基础数据
   docker-compose exec web-app java -jar app.jar --import-data
   ```

## 7.5 运维管理

### 7.5.1 监控配置
```yaml
# Prometheus配置
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['web-app:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

# Grafana仪表板
dashboards:
  - name: 'System Overview'
    panels:
      - CPU Usage
      - Memory Usage
      - Disk IO
      - Network Traffic
  
  - name: 'Application Metrics'
    panels:
      - Response Time
      - Error Rate
      - QPS
      - Active Users
```

### 7.5.2 备份策略
```bash
#!/bin/bash

# 数据库备份
backup_mysql() {
    docker-compose exec mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} \
        --single-transaction \
        --databases uniform_management > backup/mysql/uniform_$(date +%Y%m%d).sql
}

# Redis备份
backup_redis() {
    docker-compose exec redis redis-cli -a ${REDIS_PASSWORD} SAVE
    cp redis_data/dump.rdb backup/redis/dump_$(date +%Y%m%d).rdb
}

# 执行备份
backup_mysql
backup_redis

# 保留30天备份
find backup/mysql -mtime +30 -delete
find backup/redis -mtime +30 -delete
```

### 7.5.3 日志管理
```yaml
# Logstash配置
input {
  file {
    path => "/opt/uniform-management/logs/*.log"
    type => "java"
    codec => multiline {
      pattern => "^%{TIMESTAMP_ISO8601}"
      negate => true
      what => "previous"
    }
  }
}

filter {
  grok {
    match => [ "message", "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{JAVACLASS:class} - %{GREEDYDATA:message}" ]
  }
  
  date {
    match => [ "timestamp", "ISO8601" ]
    target => "@timestamp"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "uniform-management-%{+YYYY.MM.dd}"
  }
}
```

## 7.6 灾备方案

### 7.6.1 数据备份
1. 定时备份
   ```bash
   # 创建定时任务
   crontab -e
   
   # 每天凌晨2点执行备份
   0 2 * * * /opt/uniform-management/scripts/backup.sh
   ```

2. 异地备份
   ```bash
   # 同步到备用服务器
   rsync -avz backup/ backup-server:/backup/uniform-management/
   ```

### 7.6.2 故障转移
1. 服务器故障
   ```bash
   # 启动备用服务器
   docker-compose -f docker-compose.backup.yml up -d
   
   # 切换DNS解析
   update_dns uniform.edu.guiyang.gov.cn ${BACKUP_IP}
   ```

2. 数据恢复
   ```bash
   # 恢复MySQL数据
   docker-compose exec mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} \
       uniform_management < backup/mysql/uniform_latest.sql
   
   # 恢复Redis数据
   docker cp backup/redis/dump_latest.rdb redis:/data/dump.rdb
   docker-compose restart redis
   ``` 