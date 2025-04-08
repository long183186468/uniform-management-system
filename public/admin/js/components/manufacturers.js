Vue.component('manufacturers-component', {
    template: `
        <div class="manufacturers-container">
            <div class="toolbar">
                <el-button type="primary" @click="handleAdd" icon="el-icon-plus">添加厂家</el-button>
                <el-input 
                    placeholder="搜索厂家" 
                    v-model="searchQuery" 
                    style="width: 300px; margin-left: 10px;"
                    @change="handleSearch"
                    clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
            </div>

            <el-table
                :data="tableData"
                v-loading="loading"
                style="width: 100%; margin-top: 20px;"
                border>
                <el-table-column prop="code" label="厂家编号" width="120"></el-table-column>
                <el-table-column prop="name" label="厂家名称" width="200"></el-table-column>
                <el-table-column prop="license_no" label="营业执照编号" width="180"></el-table-column>
                <el-table-column prop="contact_person" label="联系人" width="120"></el-table-column>
                <el-table-column prop="contact_phone" label="联系电话" width="150"></el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="150">
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button
                            size="mini"
                            type="primary"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.row)"
                            circle>
                        </el-button>
                        <el-button
                            size="mini"
                            type="danger"
                            icon="el-icon-delete"
                            @click="handleDelete(scope.row)"
                            circle>
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination" style="margin-top: 20px; text-align: right;">
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="pagination.current"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="pagination.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pagination.total">
                </el-pagination>
            </div>

            <!-- 厂家表单对话框 -->
            <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
                <el-form :model="manufacturerForm" ref="manufacturerForm" label-width="100px">
                    <el-form-item label="厂家编号" prop="code" required>
                        <el-input v-model="manufacturerForm.code"></el-input>
                    </el-form-item>
                    <el-form-item label="厂家名称" prop="name" required>
                        <el-input v-model="manufacturerForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="营业执照" prop="license_no" required>
                        <el-input v-model="manufacturerForm.license_no"></el-input>
                    </el-form-item>
                    <el-form-item label="联系人" prop="contact_person">
                        <el-input v-model="manufacturerForm.contact_person"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话" prop="contact_phone">
                        <el-input v-model="manufacturerForm.contact_phone"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定</el-button>
                </span>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            loading: false,
            tableData: [],
            searchQuery: '',
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            dialogVisible: false,
            dialogTitle: '',
            manufacturerForm: this.getEmptyForm()
        }
    },
    methods: {
        getEmptyForm() {
            return {
                code: '',
                name: '',
                license_no: '',
                contact_person: '',
                contact_phone: ''
            };
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('zh-CN');
        },
        async fetchManufacturers() {
            this.loading = true;
            try {
                const response = await axios.get(`/manufacturers?page=${this.pagination.current}&pageSize=${this.pagination.pageSize}`);
                this.tableData = response.data.data;
                this.pagination.total = response.data.pagination.total;
            } catch (error) {
                this.$message.error('获取厂家列表失败：' + error.message);
            } finally {
                this.loading = false;
            }
        },
        handleSearch() {
            this.pagination.current = 1;
            this.fetchManufacturers();
        },
        handleSizeChange(size) {
            this.pagination.pageSize = size;
            this.fetchManufacturers();
        },
        handleCurrentChange(page) {
            this.pagination.current = page;
            this.fetchManufacturers();
        },
        handleAdd() {
            this.dialogTitle = '添加厂家';
            this.manufacturerForm = this.getEmptyForm();
            this.dialogVisible = true;
        },
        handleEdit(row) {
            this.dialogTitle = '编辑厂家';
            // 深拷贝防止修改原数据
            this.manufacturerForm = JSON.parse(JSON.stringify(row));
            this.dialogVisible = true;
        },
        async handleDelete(row) {
            try {
                await this.$confirm('确定要删除这个厂家记录吗？这可能会影响关联的校服数据', '提示', {
                    type: 'warning'
                });
                
                await axios.delete(`/manufacturers/${row._id}`);
                this.$message.success('删除成功');
                this.fetchManufacturers();
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('删除失败：' + error.message);
                }
            }
        },
        async submitForm() {
            try {
                if (this.manufacturerForm._id) {
                    // 更新
                    await axios.put(`/manufacturers/${this.manufacturerForm._id}`, this.manufacturerForm);
                    this.$message.success('更新成功');
                } else {
                    // 添加
                    await axios.post('/manufacturers', this.manufacturerForm);
                    this.$message.success('添加成功');
                }
                this.dialogVisible = false;
                this.fetchManufacturers();
            } catch (error) {
                this.$message.error('提交失败：' + error.message);
            }
        }
    },
    created() {
        this.fetchManufacturers();
    }
});