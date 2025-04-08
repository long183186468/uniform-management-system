Vue.component('uniforms-component', {
    template: `
        <div class="uniforms-container">
            <div class="toolbar">
                <el-button type="primary" @click="handleAdd" icon="el-icon-plus">添加校服</el-button>
                <el-input 
                    placeholder="搜索校服" 
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
                <el-table-column prop="qr_code" label="二维码编号" width="150"></el-table-column>
                <el-table-column prop="batch_no" label="批次号" width="120"></el-table-column>
                <el-table-column label="图片" width="120">
                    <template slot-scope="scope">
                        <el-image 
                            v-if="scope.row.images && scope.row.images.length > 0"
                            style="width: 80px; height: 80px"
                            :src="scope.row.images[0]"
                            :preview-src-list="scope.row.images"
                            fit="cover">
                        </el-image>
                        <el-button v-else size="mini" type="primary" plain @click="handleImageUpload(scope.row)">
                            添加图片
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column label="材质">
                    <template slot-scope="scope">
                        <div v-for="(material, index) in scope.row.materials" :key="index">
                            {{ material.name }} {{ material.percentage }}%
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="100">
                    <template slot-scope="scope">
                        ¥{{ scope.row.price.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column label="厂家信息" width="200">
                    <template slot-scope="scope">
                        {{ scope.row.manufacturer_id.name }}
                    </template>
                </el-table-column>
                <el-table-column label="证书有效期" width="150">
                    <template slot-scope="scope">
                        {{ formatDate(scope.row.quality_cert.valid_until) }}
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

            <!-- 校服表单对话框 -->
            <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
                <el-form :model="uniformForm" ref="uniformForm" label-width="100px">
                    <el-form-item label="二维码编号" prop="qr_code" required>
                        <el-input v-model="uniformForm.qr_code"></el-input>
                    </el-form-item>
                    <el-form-item label="批次号" prop="batch_no" required>
                        <el-input v-model="uniformForm.batch_no"></el-input>
                    </el-form-item>
                    <el-form-item label="价格" prop="price" required>
                        <el-input-number v-model="uniformForm.price" :precision="2" :min="0"></el-input-number>
                    </el-form-item>
                    <el-form-item label="厂家" prop="manufacturer_id" required>
                        <el-select v-model="uniformForm.manufacturer_id" placeholder="选择厂家" style="width: 100%;">
                            <el-option
                                v-for="item in manufacturers"
                                :key="item._id"
                                :label="item.name"
                                :value="item._id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="材质">
                        <div v-for="(material, index) in uniformForm.materials" :key="index" style="display: flex; margin-bottom: 10px;">
                            <el-input v-model="material.name" placeholder="材质名称" style="width: 150px; margin-right: 10px;"></el-input>
                            <el-input-number v-model="material.percentage" :min="0" :max="100" placeholder="百分比"></el-input-number>
                            <el-button type="danger" icon="el-icon-delete" circle @click="removeMaterial(index)" style="margin-left: 10px;"></el-button>
                        </div>
                        <el-button type="primary" icon="el-icon-plus" @click="addMaterial">添加材质</el-button>
                    </el-form-item>
                    <el-form-item label="校服图片" v-if="uniformForm._id">
                        <div class="image-upload-wrapper">
                            <div v-if="uniformForm.images && uniformForm.images.length" class="image-preview-list">
                                <div v-for="(img, index) in uniformForm.images" :key="index" class="image-preview-item">
                                    <el-image 
                                        :src="img" 
                                        fit="cover"
                                        style="width: 100px; height: 100px;">
                                    </el-image>
                                    <el-button 
                                        type="danger" 
                                        icon="el-icon-delete" 
                                        circle 
                                        size="mini"
                                        @click="deleteImage(index)"
                                        class="delete-image-btn">
                                    </el-button>
                                </div>
                            </div>
                            <el-upload
                                action="#"
                                :http-request="uploadImage"
                                :show-file-list="false"
                                :multiple="true">
                                <el-button type="primary" plain icon="el-icon-plus">上传图片</el-button>
                            </el-upload>
                            <div class="upload-tip">支持jpg、png、gif格式，单张不超过5MB，最多5张</div>
                        </div>
                    </el-form-item>
                    <el-form-item label="合格证编号" prop="cert_no" required>
                        <el-input v-model="uniformForm.quality_cert.cert_no"></el-input>
                    </el-form-item>
                    <el-form-item label="合格证有效期" prop="valid_until" required>
                        <el-date-picker v-model="uniformForm.quality_cert.valid_until" type="date" placeholder="选择日期" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="检测报告编号" prop="report_no" required>
                        <el-input v-model="uniformForm.edu_inspection_report.report_no"></el-input>
                    </el-form-item>
                    <el-form-item label="检测机构" prop="inspection_org" required>
                        <el-input v-model="uniformForm.edu_inspection_report.inspection_org"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定</el-button>
                </span>
            </el-dialog>

            <!-- 图片上传弹窗 -->
            <el-dialog title="上传校服图片" :visible.sync="imageUploadVisible" width="30%">
                <el-upload
                    action="#"
                    :http-request="uploadImage"
                    list-type="picture-card"
                    :on-preview="handlePictureCardPreview"
                    :multiple="true">
                    <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog :visible.sync="dialogImageVisible" append-to-body>
                    <img width="100%" :src="dialogImageUrl" alt="预览图">
                </el-dialog>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="imageUploadVisible = false">取 消</el-button>
                    <el-button type="primary" @click="imageUploadVisible = false">完 成</el-button>
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
            uniformForm: this.getEmptyForm(),
            manufacturers: [],
            currentUniformId: null,
            imageUploadVisible: false,
            dialogImageUrl: '',
            dialogImageVisible: false
        }
    },
    methods: {
        getEmptyForm() {
            return {
                qr_code: '',
                batch_no: '',
                price: 0,
                manufacturer_id: '',
                materials: [{ name: '棉', percentage: 100 }],
                images: [],
                quality_cert: {
                    cert_no: '',
                    issue_date: new Date(),
                    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 一年后
                },
                edu_inspection_report: {
                    report_no: '',
                    inspection_org: '',
                    inspection_date: new Date()
                }
            };
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('zh-CN');
        },
        async fetchUniforms() {
            this.loading = true;
            try {
                const response = await axios.get(`/uniforms?page=${this.pagination.current}&pageSize=${this.pagination.pageSize}`);
                this.tableData = response.data.data;
                this.pagination.total = response.data.pagination.total;
            } catch (error) {
                this.$message.error('获取校服列表失败：' + error.message);
            } finally {
                this.loading = false;
            }
        },
        async fetchManufacturers() {
            try {
                const response = await axios.get('/manufacturers');
                this.manufacturers = response.data.data;
            } catch (error) {
                this.$message.error('获取厂家列表失败：' + error.message);
            }
        },
        handleSearch() {
            this.pagination.current = 1;
            this.fetchUniforms();
        },
        handleSizeChange(size) {
            this.pagination.pageSize = size;
            this.fetchUniforms();
        },
        handleCurrentChange(page) {
            this.pagination.current = page;
            this.fetchUniforms();
        },
        handleAdd() {
            this.dialogTitle = '添加校服';
            this.uniformForm = this.getEmptyForm();
            this.dialogVisible = true;
        },
        handleEdit(row) {
            this.dialogTitle = '编辑校服';
            // 深拷贝防止修改原数据
            this.uniformForm = JSON.parse(JSON.stringify(row));
            this.dialogVisible = true;
        },
        async handleDelete(row) {
            try {
                await this.$confirm('确定要删除这个校服记录吗？', '提示', {
                    type: 'warning'
                });
                
                await axios.delete(`/uniforms/${row._id}`);
                this.$message.success('删除成功');
                this.fetchUniforms();
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('删除失败：' + error.message);
                }
            }
        },
        handleImageUpload(row) {
            this.currentUniformId = row._id;
            this.imageUploadVisible = true;
        },
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogImageVisible = true;
        },
        async uploadImage(options) {
            const { file } = options;
            const formData = new FormData();
            formData.append('images', file);
            
            try {
                const uniformId = this.currentUniformId || this.uniformForm._id;
                if (!uniformId) {
                    this.$message.error('请先保存校服信息，再上传图片');
                    return;
                }
                
                console.log('正在上传文件:', file.name, '到ID:', uniformId);
                
                // 注意：由于已设置axios.defaults.baseURL = '/api/admin'，这里不需要前缀
                const response = await axios.post(`/uniforms/${uniformId}/images`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                console.log('上传响应:', response.data);
                this.$message.success('上传成功');
                
                // 更新当前表单中的图片
                if (this.dialogVisible) {
                    this.uniformForm.images = response.data.images;
                }
                
                // 刷新列表
                this.fetchUniforms();
            } catch (error) {
                console.error('上传错误:', error);
                const errorMsg = error.response?.data?.message || error.message;
                this.$message.error('上传失败：' + errorMsg);
            }
        },
        async deleteImage(index) {
            try {
                await this.$confirm('确定要删除这张图片吗？', '提示', {
                    type: 'warning'
                });
                
                const uniformId = this.uniformForm._id;
                await axios.delete(`/uniforms/${uniformId}/images/${index}`);
                
                this.$message.success('删除成功');
                this.uniformForm.images.splice(index, 1);
                
                // 刷新列表
                this.fetchUniforms();
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('删除失败：' + (error.response?.data?.message || error.message));
                }
            }
        },
        addMaterial() {
            this.uniformForm.materials.push({ name: '', percentage: 0 });
        },
        removeMaterial(index) {
            this.uniformForm.materials.splice(index, 1);
        },
        async submitForm() {
            // 检查材质百分比总和是否为100
            const totalPercentage = this.uniformForm.materials.reduce((sum, m) => sum + m.percentage, 0);
            if (totalPercentage !== 100) {
                this.$message.error('材质百分比总和必须为100%');
                return;
            }

            try {
                if (this.uniformForm._id) {
                    // 更新
                    await axios.put(`/uniforms/${this.uniformForm._id}`, this.uniformForm);
                    this.$message.success('更新成功');
                } else {
                    // 添加
                    await axios.post('/uniforms', this.uniformForm);
                    this.$message.success('添加成功');
                }
                this.dialogVisible = false;
                this.fetchUniforms();
            } catch (error) {
                this.$message.error('提交失败：' + error.message);
            }
        }
    },
    created() {
        this.fetchUniforms();
        this.fetchManufacturers();
    }
}); 