// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM元素
const elements = {
    qrCode: document.getElementById('qrCode'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    resultArea: document.getElementById('resultArea'),
    imageGallery: document.getElementById('imageGallery'),
    noImagesMessage: document.getElementById('noImagesMessage'),
    materials: document.getElementById('materials'),
    price: document.getElementById('price'),
    certNo: document.getElementById('certNo'),
    issueDate: document.getElementById('issueDate'),
    validUntil: document.getElementById('validUntil'),
    certStatus: document.getElementById('certStatus'),
    reportNo: document.getElementById('reportNo'),
    inspectionOrg: document.getElementById('inspectionOrg'),
    inspectionDate: document.getElementById('inspectionDate'),
    imageModal: document.getElementById('imageModal'),
    modalImage: document.getElementById('modalImage')
};

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 检查证书有效期
function checkCertValidity(validUntil) {
    const now = new Date();
    const validDate = new Date(validUntil);
    const isValid = validDate > now;
    
    elements.certStatus.innerHTML = `
        <div class="alert ${isValid ? 'alert-success' : 'alert-danger'} mb-0">
            <i class="bi ${isValid ? 'bi-check-circle' : 'bi-x-circle'}"></i>
            证书状态：${isValid ? '有效' : '已过期'}
        </div>
    `;
}

// 显示材质信息
function displayMaterials(materials) {
    elements.materials.innerHTML = materials.map(material => `
        <div class="material-item">
            <span>${material.name}</span>
            <span>${material.percentage}%</span>
        </div>
    `).join('');
}

// 显示校服图片
function displayImages(images) {
    if (!images || images.length === 0) {
        elements.imageGallery.style.display = 'none';
        elements.noImagesMessage.style.display = 'block';
        return;
    }
    
    elements.imageGallery.style.display = 'flex';
    elements.noImagesMessage.style.display = 'none';
    
    // 清空现有图片
    elements.imageGallery.innerHTML = '';
    
    // 添加图片到画廊
    images.forEach(imgUrl => {
        const imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        imgElement.className = 'uniform-image';
        imgElement.onclick = () => openImageModal(imgUrl);
        elements.imageGallery.appendChild(imgElement);
    });
}

// 打开图片模态框
function openImageModal(imgUrl) {
    elements.modalImage.src = imgUrl;
    elements.imageModal.style.display = 'flex';
    elements.imageModal.style.alignItems = 'center';
    elements.imageModal.style.justifyContent = 'center';
}

// 关闭图片模态框
elements.imageModal.querySelector('.close').onclick = function() {
    elements.imageModal.style.display = 'none';
};

// 点击模态框背景关闭
elements.imageModal.onclick = function(event) {
    if (event.target === elements.imageModal) {
        elements.imageModal.style.display = 'none';
    }
};

// 显示错误信息
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
    elements.resultArea.style.display = 'none';
}

// 显示加载状态
function setLoading(isLoading) {
    elements.loading.style.display = isLoading ? 'block' : 'none';
    elements.errorMessage.style.display = 'none';
}

// 显示查询结果
function displayResults(responseData) {
    // 从API响应中获取校服数据
    const data = responseData.data;

    // 显示校服图片
    displayImages(data.images);

    // 显示材质和价格信息
    displayMaterials(data.materials);
    elements.price.textContent = `￥${data.price.toFixed(2)}`;

    // 显示质量合格证信息
    elements.certNo.textContent = data.quality_cert.cert_no;
    elements.issueDate.textContent = formatDate(data.quality_cert.issue_date);
    elements.validUntil.textContent = formatDate(data.quality_cert.valid_until);
    checkCertValidity(data.quality_cert.valid_until);

    // 显示检测报告信息
    elements.reportNo.textContent = data.edu_inspection_report.report_no;
    elements.inspectionOrg.textContent = data.edu_inspection_report.inspection_org;
    elements.inspectionDate.textContent = formatDate(data.edu_inspection_report.inspection_date);

    // 显示结果区域
    elements.resultArea.style.display = 'block';
}

// 查询校服信息
async function queryUniform() {
    const qrCode = elements.qrCode.value.trim();
    
    if (!qrCode) {
        showError('请输入校服二维码');
        return;
    }

    setLoading(true);

    try {
        const response = await axios.get(`${API_BASE_URL}/uniforms/qr/${qrCode}`);
        setLoading(false);
        
        if (response.status === 200 && response.data.success) {
            displayResults(response.data);
        } else {
            showError('校服数据格式不正确');
        }
    } catch (error) {
        setLoading(false);
        console.error('查询错误:', error);
        if (error.response && error.response.status === 404) {
            showError('未找到该校服信息');
        } else {
            showError('查询失败，请稍后重试');
        }
    }
}

// 添加回车键监听
elements.qrCode.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        queryUniform();
    }
}); 