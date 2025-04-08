# 5. 技术方案

## 5.1 技术选型

### 5.1.1 前端技术栈
1. 基础框架
   - Vue 3.0
   - TypeScript 4.x
   - Vite 2.x

2. UI组件
   - Element Plus
   - Vant（移动端）
   - ECharts（图表）

3. 工具库
   - Axios（HTTP请求）
   - VueUse（组合式API）
   - Day.js（日期处理）

### 5.1.2 后端技术栈
1. 基础框架
   - Spring Boot 2.7.x
   - Spring Security
   - MyBatis Plus 3.5.x

2. 数据存储
   - MySQL 8.0
   - Redis 6.x
   - MinIO（对象存储）

3. 中间件
   - RabbitMQ（消息队列）
   - Elasticsearch（搜索引擎）
   - Canal（数据同步）

### 5.1.3 运维技术
1. 容器化
   - Docker
   - Docker Compose
   - Kubernetes

2. 监控工具
   - Prometheus
   - Grafana
   - ELK Stack

## 5.2 系统架构

### 5.2.1 整体架构
```
客户端层
├── Web管理端（Vue3 + Element Plus）
└── 移动端（H5 + Vant）

接入层
├── Nginx（反向代理）
├── Gateway（网关）
└── Security（认证授权）

应用层
├── 统一接口服务
├── 业务微服务
└── 基础服务

数据层
├── MySQL（主从）
├── Redis（集群）
└── MinIO（分布式存储）
```

### 5.2.2 服务划分
1. 核心服务
   - 校服管理服务
   - 二维码服务
   - 质检报告服务
   - 投诉反馈服务

2. 基础服务
   - 用户认证服务
   - 文件存储服务
   - 消息通知服务
   - 日志审计服务

## 5.3 二维码方案

### 5.3.1 二维码生成
```python
class QRCodeGenerator:
    def generate_permanent_id(self):
        """生成永久标识"""
        area_code = "1001"  # 区域代码
        year = datetime.now().strftime('%y')
        batch_no = str(batch_id).zfill(4)
        sequence = str(seq_id).zfill(6)
        check_sum = self.calculate_check_sum(
            area_code + year + batch_no + sequence
        )
        return f"{area_code}{year}{batch_no}{sequence}{check_sum}"
    
    def generate_qr_content(self, permanent_id):
        """生成二维码内容"""
        base_url = "https://uniform.edu.example.com"
        return f"{base_url}/u/{permanent_id}"
    
    def create_qr_image(self, content):
        """生成二维码图片"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(content)
        qr.make(fit=True)
        return qr.make_image(fill_color="black", back_color="white")
```

### 5.3.2 信息更新机制
```java
@Service
public class UniformInfoService {
    
    @Transactional
    public void updateUniformInfo(String permanentId, UniformInfo newInfo) {
        // 1. 获取当前版本
        UniformInfoVersion currentVersion = getLatestVersion(permanentId);
        
        // 2. 创建新版本
        UniformInfoVersion newVersion = new UniformInfoVersion();
        newVersion.setPermanentId(permanentId);
        newVersion.setVersion(currentVersion.getVersion() + 1);
        newVersion.setContent(newInfo);
        
        // 3. 保存新版本
        versionRepository.save(newVersion);
        
        // 4. 更新缓存
        cacheService.updateUniformInfo(permanentId, newInfo);
    }
}
```

## 5.4 文件上传方案

### 5.4.1 上传配置
```javascript
// 使用multer处理文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 使用绝对路径确保目录正确
        const uploadPath = path.join(process.cwd(), 'public/uploads/images');
        // 确保目录存在
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // 获取原始文件扩展名，如果没有则默认为jpg
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = 'uniform-' + uniqueSuffix + ext;
        cb(null, filename);
    }
});

// 文件类型过滤
const fileFilter = function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('只支持.jpg、.jpeg、.png、.gif和.webp格式的图片'));
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB大小限制
    fileFilter: fileFilter
}).array('images', 5); // 最多上传5张图片
```

### 5.4.2 前端上传组件
```javascript
// Vue组件中的上传实现
async uploadImage(options) {
    const { file } = options;
    const formData = new FormData();
    formData.append('images', file);
    
    try {
        const uniformId = this.uniformForm._id;
        
        const response = await axios.post(`/uniforms/${uniformId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // 更新当前表单中的图片
        this.uniformForm.images = response.data.images;
        this.$message.success('上传成功');
        
    } catch (error) {
        this.$message.error('上传失败：' + error.message);
    }
}
```

### 5.4.3 文件管理策略
1. 文件目录结构
   ```
   public/
   └── uploads/
       ├── images/     # 校服图片
       ├── reports/    # 质检报告
       └── temp/       # 临时文件
   ```

2. 文件访问控制
   ```javascript
   // 静态文件服务
   app.use(express.static(path.join(__dirname, '../public')));
   
   // 文件访问鉴权中间件
   app.use('/uploads/reports', authMiddleware);
   ```

3. 定期清理策略
   ```javascript
   // 定期清理临时文件
   cron.schedule('0 0 * * *', async () => {
       const tempDir = path.join(process.cwd(), 'public/uploads/temp');
       const files = await fs.readdir(tempDir);
       
       for (const file of files) {
           const filePath = path.join(tempDir, file);
           const stats = await fs.stat(filePath);
           const fileAge = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
           
           // 删除24小时前的临时文件
           if (fileAge > 24) {
               await fs.unlink(filePath);
           }
       }
   });
   ```

## 5.5 缓存设计

### 5.5.1 缓存策略
1. 缓存层次
   ```
   浏览器缓存 → CDN缓存 → 应用缓存 → 分布式缓存
   ```

2. 缓存类型
   - 永久标识缓存
   - 校服信息缓存
   - 质检报告缓存
   - 用户信息缓存

### 5.5.2 缓存实现
```java
@Service
public class CacheService {
    
    @Autowired
    private RedisTemplate redisTemplate;
    
    public void cacheUniformInfo(String permanentId, UniformInfo info) {
        String key = "uniform:info:" + permanentId;
        redisTemplate.opsForValue().set(key, info, 24, TimeUnit.HOURS);
    }
    
    public UniformInfo getUniformInfo(String permanentId) {
        String key = "uniform:info:" + permanentId;
        return (UniformInfo) redisTemplate.opsForValue().get(key);
    }
}
```

## 5.6 安全方案

### 5.6.1 认证授权
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/api/public/**").permitAll()
                .antMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
                .formLogin()
                .loginProcessingUrl("/api/login")
                .successHandler(loginSuccessHandler)
                .failureHandler(loginFailureHandler)
            .and()
                .logout()
                .logoutUrl("/api/logout")
            .and()
                .csrf().disable();
    }
}
```

### 5.6.2 数据加密
```java
@Component
public class EncryptionService {
    
    private static final String AES_KEY = "your-secret-key";
    
    public String encrypt(String content) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(content.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }
    
    public String decrypt(String encrypted) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decrypted = cipher.doFinal(
                Base64.getDecoder().decode(encrypted)
            );
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
```

## 5.7 性能优化

### 5.7.1 前端优化
1. 资源优化
   - 路由懒加载
   - 组件按需加载
   - 图片懒加载
   - 资源压缩

2. 渲染优化
   - 虚拟列表
   - 分页加载
   - 防抖节流
   - 缓存优化

### 5.7.2 后端优化
1. 数据库优化
   - 索引优化
   - SQL优化
   - 分库分表
   - 读写分离

2. 缓存优化
   - 多级缓存
   - 缓存预热
   - 缓存更新
   - 缓存降级

3. 并发处理
   - 线程池
   - 异步处理
   - 限流降级
   - 熔断保护

## 5.8 监控方案

### 5.8.1 系统监控
1. 服务监控
   - 服务状态
   - 接口调用
   - 响应时间
   - 错误率

2. 资源监控
   - CPU使用率
   - 内存使用
   - 磁盘IO
   - 网络流量

### 5.8.2 业务监控
1. 业务指标
   - 二维码生成量
   - 信息查询量
   - 投诉处理率
   - 系统使用率

2. 告警规则
   - 服务异常告警
   - 性能阈值告警
   - 业务异常告警
   - 安全事件告警 