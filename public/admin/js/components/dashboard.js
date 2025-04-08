Vue.component('dashboard-component', {
    template: `
        <div class="dashboard">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-card shadow="hover" class="dashboard-card">
                        <div slot="header">
                            <i class="el-icon-s-goods"></i>
                            <span>校服总数</span>
                        </div>
                        <div class="dashboard-card-content">
                            <h2>{{ stats.uniformCount || 0 }}</h2>
                            <p>款式</p>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="hover" class="dashboard-card">
                        <div slot="header">
                            <i class="el-icon-s-shop"></i>
                            <span>厂家总数</span>
                        </div>
                        <div class="dashboard-card-content">
                            <h2>{{ stats.manufacturerCount || 0 }}</h2>
                            <p>家</p>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="hover" class="dashboard-card">
                        <div slot="header">
                            <i class="el-icon-warning-outline"></i>
                            <span>即将过期证书</span>
                        </div>
                        <div class="dashboard-card-content">
                            <h2>{{ stats.expiringCertificates || 0 }}</h2>
                            <p>个</p>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                    <el-card shadow="hover">
                        <div slot="header">
                            <span>最近添加的校服</span>
                        </div>
                        <el-table :data="recentUniforms" stripe style="width: 100%">
                            <el-table-column prop="name" label="名称"></el-table-column>
                            <el-table-column prop="code" label="编号"></el-table-column>
                            <el-table-column prop="created_at" label="添加时间">
                                <template slot-scope="scope">
                                    {{ formatDate(scope.row.created_at) }}
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>
                <el-col :span="12">
                    <el-card shadow="hover">
                        <div slot="header">
                            <span>即将过期的证书</span>
                        </div>
                        <el-table :data="expiringCertificatesList" stripe style="width: 100%">
                            <el-table-column prop="uniform_name" label="校服名称"></el-table-column>
                            <el-table-column prop="valid_until" label="过期时间">
                                <template slot-scope="scope">
                                    {{ formatDate(scope.row.valid_until) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="days_remaining" label="剩余天数">
                                <template slot-scope="scope">
                                    {{ scope.row.days_remaining }}天
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    `,
    data() {
        return {
            stats: {
                uniformCount: 0,
                manufacturerCount: 0,
                expiringCertificates: 0
            },
            recentUniforms: [],
            expiringCertificatesList: []
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('zh-CN');
        },
        async fetchDashboardData() {
            try {
                const response = await axios.get('/dashboard/stats');
                this.stats = response.data.stats;
                this.recentUniforms = response.data.recentUniforms;
                this.expiringCertificatesList = response.data.expiringCertificates;
            } catch (error) {
                this.$message.error('获取数据失败：' + error.message);
            }
        }
    },
    created() {
        this.fetchDashboardData();
    }
}); 