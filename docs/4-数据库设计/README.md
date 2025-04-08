# 4. 数据库设计

## 4.1 数据库总体设计

### 4.1.1 设计原则
1. 数据一致性
   - 遵循数据库范式
   - 合理使用外键约束
   - 保证数据完整性
   - 避免数据冗余

2. 性能优化
   - 合理设计索引
   - 适当冗余设计
   - 分表分库策略
   - 读写分离

3. 安全性
   - 数据加密存储
   - 访问权限控制
   - 操作日志记录
   - 数据备份恢复

### 4.1.2 数据库选型
- 类型：MySQL 8.0
- 字符集：utf8mb4
- 排序规则：utf8mb4_general_ci

## 4.2 核心表设计

### 4.2.1 永久标识表
```sql
CREATE TABLE permanent_identifier (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    permanent_id VARCHAR(20) UNIQUE COMMENT '永久标识码',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    check_sum VARCHAR(4) NOT NULL COMMENT '校验位',
    status TINYINT DEFAULT 1 COMMENT '状态：1-有效 0-作废',
    UNIQUE KEY `uk_permanent_id` (`permanent_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='永久标识主表';
```

### 4.2.2 校服批次表
```sql
CREATE TABLE uniform_batch (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    batch_code VARCHAR(32) UNIQUE COMMENT '批次编号',
    manufacturer_id BIGINT NOT NULL COMMENT '厂家ID',
    start_date DATE NOT NULL COMMENT '批次开始日期',
    end_date DATE NOT NULL COMMENT '批次结束日期',
    status TINYINT DEFAULT 1 COMMENT '状态：1-有效 2-即将过期 3-已过期',
    total_quantity INT DEFAULT 0 COMMENT '总数量',
    created_quantity INT DEFAULT 0 COMMENT '已生成数量',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    create_user VARCHAR(50) COMMENT '创建人',
    update_user VARCHAR(50) COMMENT '更新人',
    UNIQUE KEY `uk_batch_code` (`batch_code`),
    KEY `idx_manufacturer` (`manufacturer_id`),
    KEY `idx_date` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校服批次表';
```

### 4.2.3 校服款式表
```sql
CREATE TABLE uniform_style (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    style_code VARCHAR(32) UNIQUE COMMENT '款式编号',
    batch_id BIGINT NOT NULL COMMENT '所属批次ID',
    name VARCHAR(100) NOT NULL COMMENT '款式名称',
    category TINYINT COMMENT '类别：1-夏装 2-冬装',
    material JSON COMMENT '材质信息',
    size_range VARCHAR(200) COMMENT '可选尺码范围',
    base_price DECIMAL(10,2) COMMENT '基础价格',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    create_user VARCHAR(50) COMMENT '创建人',
    update_user VARCHAR(50) COMMENT '更新人',
    UNIQUE KEY `uk_style_code` (`style_code`),
    KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校服款式表';
```

### 4.2.4 校服信息版本表
```sql
CREATE TABLE uniform_info_version (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    permanent_id VARCHAR(20) NOT NULL COMMENT '永久标识码',
    version INT NOT NULL COMMENT '版本号',
    content JSON NOT NULL COMMENT '校服信息JSON',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    update_user VARCHAR(50) NOT NULL COMMENT '更新人',
    update_reason VARCHAR(200) COMMENT '更新原因',
    KEY `idx_permanent_id` (`permanent_id`),
    KEY `idx_update_time` (`update_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校服信息版本表';
```

### 4.2.5 质检报告表
```sql
CREATE TABLE quality_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    report_no VARCHAR(50) UNIQUE COMMENT '报告编号',
    batch_id BIGINT NOT NULL COMMENT '关联批次ID',
    report_type TINYINT COMMENT '报告类型：1-厂家 2-第三方 3-教育系统',
    report_url TEXT COMMENT '报告文件地址',
    report_content JSON COMMENT '报告内容',
    issue_date DATE NOT NULL COMMENT '签发日期',
    status TINYINT DEFAULT 1 COMMENT '状态：1-有效 0-作废',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    create_user VARCHAR(50) COMMENT '创建人',
    UNIQUE KEY `uk_report_no` (`report_no`),
    KEY `idx_batch` (`batch_id`),
    KEY `idx_issue_date` (`issue_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质检报告表';
```

### 4.2.6 投诉反馈表
```sql
CREATE TABLE complaint_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    permanent_id VARCHAR(20) NOT NULL COMMENT '永久标识码',
    complaint_type TINYINT COMMENT '投诉类型',
    content TEXT NOT NULL COMMENT '投诉内容',
    images JSON COMMENT '图片信息',
    contact VARCHAR(50) COMMENT '联系方式',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待处理 2-处理中 3-已处理 4-已评价',
    process_user VARCHAR(50) COMMENT '处理人',
    process_time DATETIME COMMENT '处理时间',
    process_result TEXT COMMENT '处理结果',
    satisfaction TINYINT COMMENT '满意度评价：1-5',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    KEY `idx_permanent_id` (`permanent_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投诉反馈表';
```

## 4.3 系统表设计

### 4.3.1 用户表
```sql
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(50) UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    last_login DATETIME COMMENT '最后登录时间',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';
```

### 4.3.2 角色表
```sql
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    role_code VARCHAR(50) UNIQUE COMMENT '角色编码',
    role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
    description VARCHAR(200) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';
```

### 4.3.3 权限表
```sql
CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    permission_code VARCHAR(50) UNIQUE COMMENT '权限编码',
    permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
    menu_url VARCHAR(200) COMMENT '菜单URL',
    parent_id BIGINT COMMENT '父级ID',
    type TINYINT COMMENT '类型：1-菜单 2-按钮',
    icon VARCHAR(100) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY `uk_permission_code` (`permission_code`),
    KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统权限表';
```

## 4.4 关联关系设计

### 4.4.1 用户角色关联表
```sql
CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';
```

### 4.4.2 角色权限关联表
```sql
CREATE TABLE sys_role_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';
```

## 4.5 索引设计

### 4.5.1 索引原则
1. 查询频率高的字段建立索引
2. 外键关联字段建立索引
3. 排序字段建立索引
4. 避免冗余索引
5. 控制索引数量

### 4.5.2 主要索引列表
1. 永久标识索引
   - permanent_identifier(permanent_id)
   - permanent_identifier(create_time)

2. 批次索引
   - uniform_batch(batch_code)
   - uniform_batch(manufacturer_id)
   - uniform_batch(start_date, end_date)

3. 款式索引
   - uniform_style(style_code)
   - uniform_style(batch_id)

4. 版本索引
   - uniform_info_version(permanent_id)
   - uniform_info_version(update_time)

5. 质检报告索引
   - quality_report(report_no)
   - quality_report(batch_id)
   - quality_report(issue_date)

## 4.6 数据迁移方案

### 4.6.1 迁移策略
1. 数据准备
   - 数据清洗
   - 数据转换
   - 数据验证

2. 迁移步骤
   - 基础数据迁移
   - 业务数据迁移
   - 关联关系迁移
   - 数据校验

3. 回滚机制
   - 备份机制
   - 验证机制
   - 回滚流程 