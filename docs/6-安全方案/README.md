# 6. 安全方案

## 6.1 安全体系架构

### 6.1.1 整体架构
```
应用安全
├── 身份认证
├── 权限控制
├── 数据加密
└── 安全审计

传输安全
├── HTTPS加密
├── 数据签名
└── 防重放攻击

数据安全
├── 存储加密
├── 访问控制
└── 备份恢复

系统安全
├── 防火墙
├── 入侵检测
└── 漏洞扫描
```

### 6.1.2 安全策略
1. 纵深防御
   - 多层次防护
   - 多维度防护
   - 全方位防护

2. 最小权限
   - 角色权限控制
   - 数据权限控制
   - 操作权限控制

## 6.2 应用安全

### 6.2.1 身份认证
```java
@Configuration
public class AuthenticationConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
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
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 6.2.2 权限控制
```java
@Service
public class AuthorizationService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public void adminOperation() {
        // 管理员操作
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void managerOperation() {
        // 管理员或经理操作
    }
    
    @PreAuthorize("#userId == authentication.principal.id")
    public void userOperation(Long userId) {
        // 用户操作
    }
}
```

## 6.3 数据安全

### 6.3.1 数据加密
```java
@Component
public class DataEncryptionService {
    
    @Value("${encryption.key}")
    private String encryptionKey;
    
    public String encryptSensitiveData(String data) {
        try {
            SecretKeySpec key = new SecretKeySpec(
                encryptionKey.getBytes(),
                "AES"
            );
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new SecurityException("Encryption failed", e);
        }
    }
    
    public String decryptSensitiveData(String encryptedData) {
        try {
            SecretKeySpec key = new SecretKeySpec(
                encryptionKey.getBytes(),
                "AES"
            );
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decrypted = cipher.doFinal(
                Base64.getDecoder().decode(encryptedData)
            );
            return new String(decrypted);
        } catch (Exception e) {
            throw new SecurityException("Decryption failed", e);
        }
    }
}
```

### 6.3.2 数据脱敏
```java
@Component
public class DataMaskingService {
    
    public String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() != 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }
    
    public String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() != 18) {
            return idCard;
        }
        return idCard.substring(0, 6) + "********" + idCard.substring(14);
    }
    
    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        int atIndex = email.indexOf("@");
        int length = email.substring(0, atIndex).length();
        if (length <= 3) {
            return "***" + email.substring(atIndex);
        }
        return email.substring(0, 3) + "***" + email.substring(atIndex);
    }
}
```

## 6.4 传输安全

### 6.4.1 HTTPS配置
```yaml
server:
  ssl:
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_KEY_STORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: tomcat
    enabled: true
```

### 6.4.2 接口签名
```java
@Aspect
@Component
public class SignatureAspect {
    
    @Around("@annotation(SignatureRequired)")
    public Object checkSignature(ProceedingJoinPoint point) throws Throwable {
        HttpServletRequest request = 
            ((ServletRequestAttributes) RequestContextHolder
                .getRequestAttributes())
                .getRequest();
        
        String timestamp = request.getHeader("X-Timestamp");
        String nonce = request.getHeader("X-Nonce");
        String signature = request.getHeader("X-Signature");
        
        // 验证时间戳
        if (!isValidTimestamp(timestamp)) {
            throw new SecurityException("Invalid timestamp");
        }
        
        // 验证签名
        if (!verifySignature(timestamp, nonce, signature)) {
            throw new SecurityException("Invalid signature");
        }
        
        return point.proceed();
    }
    
    private boolean verifySignature(String timestamp, String nonce, String signature) {
        // 签名验证逻辑
        return true;
    }
}
```

## 6.5 系统安全

### 6.5.1 SQL注入防护
```java
@Configuration
public class SqlInjectionConfig {
    
    @Bean
    public FilterRegistrationBean sqlInjectionFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new SqlInjectionFilter());
        registration.addUrlPatterns("/*");
        registration.setName("sqlInjectionFilter");
        registration.setOrder(1);
        return registration;
    }
}

public class SqlInjectionFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
            FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        Map<String, String[]> params = req.getParameterMap();
        
        for (String key : params.keySet()) {
            String[] values = params.get(key);
            for (String value : values) {
                if (containsSqlInjection(value)) {
                    throw new SecurityException("SQL injection detected");
                }
            }
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean containsSqlInjection(String value) {
        // SQL注入检测逻辑
        return false;
    }
}
```

### 6.5.2 XSS防护
```java
@Configuration
public class XssConfig {
    
    @Bean
    public FilterRegistrationBean xssFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new XssFilter());
        registration.addUrlPatterns("/*");
        registration.setName("xssFilter");
        registration.setOrder(2);
        return registration;
    }
}

public class XssFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
            FilterChain chain) throws IOException, ServletException {
        XssHttpServletRequestWrapper xssRequest = 
            new XssHttpServletRequestWrapper((HttpServletRequest) request);
        chain.doFilter(xssRequest, response);
    }
}
```

## 6.6 安全审计

### 6.6.1 操作日志
```java
@Aspect
@Component
public class OperationLogAspect {
    
    @Autowired
    private OperationLogService logService;
    
    @Around("@annotation(operationLog)")
    public Object logOperation(ProceedingJoinPoint point, 
            OperationLog operationLog) throws Throwable {
        // 记录操作开始时间
        long startTime = System.currentTimeMillis();
        
        // 获取当前用户
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        
        // 执行目标方法
        Object result = point.proceed();
        
        // 记录操作日志
        OperationLogDTO log = new OperationLogDTO();
        log.setUsername(username);
        log.setOperation(operationLog.value());
        log.setMethod(point.getSignature().getName());
        log.setParams(Arrays.toString(point.getArgs()));
        log.setExecuteTime(System.currentTimeMillis() - startTime);
        log.setCreateTime(new Date());
        
        logService.saveLog(log);
        
        return result;
    }
}
```

### 6.6.2 安全审计
```java
@Service
public class SecurityAuditService {
    
    @Autowired
    private SecurityLogRepository logRepository;
    
    public void auditSecurityEvent(SecurityEvent event) {
        SecurityLog log = new SecurityLog();
        log.setEventType(event.getType());
        log.setUsername(event.getUsername());
        log.setIpAddress(event.getIpAddress());
        log.setEventTime(new Date());
        log.setEventDetails(event.getDetails());
        
        logRepository.save(log);
        
        // 判断是否需要告警
        if (isAlertRequired(event)) {
            sendSecurityAlert(event);
        }
    }
    
    private boolean isAlertRequired(SecurityEvent event) {
        // 告警判断逻辑
        return true;
    }
    
    private void sendSecurityAlert(SecurityEvent event) {
        // 发送安全告警
    }
}
```

## 6.7 应急响应

### 6.7.1 应急预案
1. 安全事件分级
   - 一级：系统瘫痪
   - 二级：数据泄露
   - 三级：功能异常
   - 四级：性能下降

2. 响应流程
   - 事件发现
   - 快速响应
   - 事件处理
   - 恢复正常
   - 总结改进

### 6.7.2 应急处理
```java
@Service
public class EmergencyResponseService {
    
    public void handleSecurityIncident(SecurityIncident incident) {
        // 1. 记录事件
        logIncident(incident);
        
        // 2. 通知相关人员
        notifyResponsiblePersons(incident);
        
        // 3. 采取应急措施
        switch (incident.getLevel()) {
            case LEVEL_1:
                handleSystemDown(incident);
                break;
            case LEVEL_2:
                handleDataLeak(incident);
                break;
            case LEVEL_3:
                handleFunctionError(incident);
                break;
            case LEVEL_4:
                handlePerformanceIssue(incident);
                break;
        }
        
        // 4. 恢复服务
        recoverService(incident);
        
        // 5. 事后总结
        createIncidentReport(incident);
    }
}
``` 