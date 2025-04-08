# 3. 功能模块设计

## 3.1 校服管理模块

### 3.1.1 批次管理
1. 功能描述
   - 批次信息录入
   - 批次状态管理
   - 批次查询统计
   - 批次信息导出

2. 业务流程
   ```
   创建批次 → 录入信息 → 审核确认 → 生成二维码 → 批次完成
   ```

3. 关键功能点
   - 批次编号生成规则
   - 批次状态流转控制
   - 批次信息验证规则
   - 批次数据统计分析

### 3.1.2 款式管理
1. 功能描述
   - 款式基本信息
   - 材质信息管理
   - 尺码信息管理
   - 价格信息管理

2. 数据结构
   ```json
   {
     "style_id": "款式ID",
     "style_name": "款式名称",
     "category": "类别",
     "material": {
       "fabric": "面料",
       "lining": "衬里",
       "buttons": "纽扣"
     },
     "sizes": ["S", "M", "L", "XL"],
     "price": {
       "base_price": "基础价格",
       "size_addition": "尺码加价"
     }
   }
   ```

### 3.1.3 图片管理
1. 功能描述
   - 校服图片上传
   - 图片预览与管理
   - 批量图片处理
   - 前端图片展示

2. 技术实现
   ```javascript
   // 后端文件上传处理
   const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       const uploadPath = path.join(process.cwd(), 'public/uploads/images');
       // 确保目录存在
       fs.mkdirSync(uploadPath, { recursive: true });
       cb(null, uploadPath);
     },
     filename: function (req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       const ext = path.extname(file.originalname) || '.jpg';
       cb(null, 'uniform-' + uniqueSuffix + ext);
     }
   });
   ```

3. 业务流程
   ```
   选择校服 → 上传图片 → 图片处理 → 关联保存 → 前端展示
   ```

4. 关键功能点
   - 支持多种图片格式（jpg、png、gif、webp）
   - 图片大小限制（5MB）
   - 单件校服支持多图片
   - 图片删除与排序
   - 图片预览与缩放

## 3.2 二维码模块

### 3.2.1 二维码生成
1. 功能描述
   - 永久标识生成
   - 二维码图片生成
   - 批量生成处理
   - 二维码导出

2. 技术实现
   ```python
   def generate_permanent_id():
       """生成永久标识"""
       area_code = "1001"  # 区域代码
       year = datetime.now().strftime('%y')
       batch_no = str(batch_id).zfill(4)
       sequence = str(seq_id).zfill(6)
       check_sum = calculate_check_sum(area_code + year + batch_no + sequence)
       return f"{area_code}{year}{batch_no}{sequence}{check_sum}"
   ```

### 3.2.2 信息关联
1. 数据结构
   ```json
   {
     "qr_id": "二维码ID",
     "permanent_id": "永久标识",
     "uniform_info": {
       "batch_id": "批次ID",
       "style_id": "款式ID",
       "size": "尺码",
       "production_date": "生产日期"
     },
     "quality_report": {
       "report_id": "报告ID",
       "report_url": "报告链接"
     }
   }
   ```

2. 更新机制
   - 信息动态更新
   - 版本控制
   - 历史记录

## 3.3 质检报告模块

### 3.3.1 报告管理
1. 功能描述
   - 报告上传
   - 报告审核
   - 报告关联
   - 报告查询

2. 报告类型
   - 厂家质检报告
   - 第三方质检报告
   - 教育系统质检报告

### 3.3.2 查询展示
1. 查询方式
   - 二维码扫描查询
   - 批次号查询
   - 报告编号查询

2. 展示内容
   - 基本信息
   - 检测项目
   - 检测结果
   - 结论说明

## 3.4 投诉反馈模块

### 3.4.1 投诉管理
1. 功能描述
   - 投诉提交
   - 投诉处理
   - 结果反馈
   - 满意度评价

2. 处理流程
   ```
   提交投诉 → 受理分派 → 处理反馈 → 结果确认 → 评价
   ```

### 3.4.2 统计分析
1. 统计维度
   - 投诉类型统计
   - 处理时效统计
   - 满意度统计
   - 问题分布统计

2. 分析报表
   - 趋势分析
   - 原因分析
   - 改进建议

## 3.5 系统管理模块

### 3.5.1 用户权限
1. 用户管理
   - 用户信息维护
   - 角色分配
   - 权限设置
   - 登录日志

2. 角色权限
   - 角色定义
   - 权限分配
   - 权限继承
   - 权限验证

### 3.5.2 系统配置
1. 参数配置
   - 系统参数
   - 业务参数
   - 接口参数
   - 告警参数

2. 日志管理
   - 操作日志
   - 系统日志
   - 安全日志
   - 异常日志

## 3.6 移动端功能

### 3.6.1 信息查询
1. 扫码查询
   - 校服信息
   - 质检报告
   - 厂家信息
   - 投诉渠道

2. 结果展示
   - 信息卡片
   - 图文展示
   - 报告预览
   - 分享功能

### 3.6.2 投诉反馈
1. 投诉提交
   - 问题描述
   - 图片上传
   - 联系方式
   - 提交确认

2. 进度查询
   - 处理状态
   - 处理记录
   - 结果反馈
   - 满意度评价 