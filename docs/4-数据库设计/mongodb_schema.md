# MongoDB数据模型设计

## 1. 核心集合设计

### 1.1 校服信息集合 (uniforms)
```javascript
{
  _id: ObjectId,
  qr_code: String,        // 二维码编号（唯一）
  batch_no: String,       // 生产批次号
  manufacturer_id: ObjectId, // 生产厂家ID
  materials: [{           // 材质信息
    name: String,        // 材质名称
    percentage: Number   // 占比（0-100）
  }],
  images: [String],       // 校服图片URL数组
  price: Number,          // 价格
  quality_cert: {         // 质量合格证信息
    cert_no: String,     // 合格证编号
    issue_date: Date,    // 发证日期
    valid_until: Date    // 有效期至
  },
  edu_inspection_report: { // 教育系统检测报告
    report_no: String,    // 报告编号
    issue_date: Date,     // 检测日期
    inspection_org: String // 检测机构
  },
  status: Number,         // 状态：1-正常，0-禁用
  created_at: Date,       // 创建时间
  updated_at: Date        // 更新时间
}
```

### 1.2 生产厂家集合 (manufacturers)
```javascript
{
  _id: ObjectId,
  code: String,          // 厂家编码
  name: String,          // 厂家名称
  license_no: String,    // 营业执照号
  contact_person: String, // 联系人
  contact_phone: String,  // 联系电话
  status: Number,        // 状态：1-启用，0-禁用
  created_at: Date,      // 创建时间
  updated_at: Date       // 更新时间
}
```

## 2. 系统集合设计

### 2.1 用户集合 (users)
```javascript
{
  _id: ObjectId,
  username: String,      // 用户名
  password: String,      // 加密密码
  name: String,          // 姓名
  role: String,          // 角色：admin/operator
  phone: String,         // 联系电话
  email: String,         // 电子邮箱
  last_login: Date,      // 最后登录时间
  status: Number,        // 状态：1-启用，0-禁用
  created_at: Date,
  updated_at: Date
}
```

### 2.2 角色集合 (roles)
```javascript
{
  _id: ObjectId,
  name: String,          // 角色名称
  code: String,          // 角色编码
  permissions: [String], // 权限列表
  description: String,   // 描述
  status: Number,        // 状态：1-启用，0-禁用
  created_at: Date,
  updated_at: Date
}
```

### 2.3 操作日志集合 (operation_logs)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,     // 操作用户
  module: String,        // 操作模块
  action: String,        // 操作类型
  content: String,       // 操作内容
  ip: String,           // 操作IP
  created_at: Date
}
```

## 3. 索引设计

### 3.1 uniforms集合索引
```javascript
{
  qr_code: 1,           // 二维码编号唯一索引
  batch_no: 1,          // 生产批次号索引
  manufacturer_id: 1,    // 生产厂家索引
  created_at: -1        // 创建时间降序索引
}
```

### 3.2 manufacturers集合索引
```javascript
{
  code: 1,              // 厂家编码唯一索引
  name: 1,              // 厂家名称索引
  created_at: -1        // 创建时间降序索引
}
```

### 3.3 users集合索引
```javascript
{
  username: 1,          // 用户名唯一索引
  role: 1,             // 角色索引
  created_at: -1        // 创建时间降序索引
}
```

## 4. 数据验证规则

### 4.1 uniforms集合验证
```javascript
{
  $jsonSchema: {
    bsonType: "object",
    required: ["qr_code", "batch_no", "manufacturer_id", "materials", "price", "quality_cert", "edu_inspection_report"],
    properties: {
      qr_code: {
        bsonType: "string",
        description: "二维码编号不能为空"
      },
      materials: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["name", "percentage"],
          properties: {
            percentage: {
              bsonType: "number",
              minimum: 0,
              maximum: 100,
              description: "材质占比必须在0-100之间"
            }
          }
        }
      },
      images: {
        bsonType: "array",
        items: {
          bsonType: "string",
          description: "图片URL"
        }
      },
      price: {
        bsonType: "number",
        minimum: 0,
        description: "价格不能为负数"
      }
    }
  }
}
```

### 4.2 manufacturers集合验证
```javascript
{
  $jsonSchema: {
    bsonType: "object",
    required: ["code", "name", "license_no", "contact_person", "contact_phone"],
    properties: {
      code: {
        bsonType: "string",
        description: "厂家编码不能为空"
      },
      license_no: {
        bsonType: "string",
        description: "营业执照号不能为空"
      }
    }
  }
}
```

## 5. 数据库配置

### 5.1 备份策略
```javascript
// 全量备份
mongodump --db uniform_management --out /backup/mongodb/$(date +%Y%m%d)

// 增量备份（使用oplog）
mongodump --db uniform_management --oplog --out /backup/mongodb/$(date +%Y%m%d)_incremental
``` 