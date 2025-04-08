// 配置 axios 默认值
axios.defaults.baseURL = '/api/admin';

// 创建 Vue 实例
new Vue({
    el: '#app',
    data: {
        activeMenu: 'dashboard',
        pageTitle: '系统首页',
        currentComponent: 'dashboard-component'
    },
    methods: {
        handleMenuSelect(index) {
            this.activeMenu = index;
            
            switch(index) {
                case 'dashboard':
                    this.pageTitle = '系统首页';
                    this.currentComponent = 'dashboard-component';
                    break;
                case 'uniforms':
                    this.pageTitle = '校服管理';
                    this.currentComponent = 'uniforms-component';
                    break;
                case 'manufacturers':
                    this.pageTitle = '厂家管理';
                    this.currentComponent = 'manufacturers-component';
                    break;
                default:
                    this.pageTitle = '系统首页';
                    this.currentComponent = 'dashboard-component';
            }
            
            window.location.hash = '#' + index;
        }
    },
    created() {
        // 设置全局axios基础URL
        axios.defaults.baseURL = '/api/admin';
        
        // 添加请求拦截器记录请求
        axios.interceptors.request.use(function (config) {
            console.log('发送请求:', config.url);
            return config;
        }, function (error) {
            return Promise.reject(error);
        });
        
        // 添加响应拦截器处理错误
        axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            console.error('请求错误:', error.response?.data || error.message);
            return Promise.reject(error);
        });
        
        // 从URL获取当前页面
        const path = window.location.hash.slice(1) || 'dashboard';
        this.handleMenuSelect(path);
    }
}); 