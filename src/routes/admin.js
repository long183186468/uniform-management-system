const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Uniform, Manufacturer } = require('../models');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 使用绝对路径确保目录正确
        const uploadPath = path.join(process.cwd(), 'public/uploads/images');
        // 确保目录存在
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('上传目录:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // 获取原始文件扩展名，如果没有则默认为jpg
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = 'uniform-' + uniqueSuffix + ext;
        console.log('生成文件名:', filename);
        cb(null, filename);
    }
});

// 文件类型过滤器
const fileFilter = function (req, file, cb) {
    console.log('上传文件:', file.originalname, '类型:', file.mimetype);
    // 暂时放宽限制，允许所有文件类型以排查问题
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB限制
    fileFilter: fileFilter
}).array('images', 5); // 最多5张图片

// 1. 校服管理接口
// 1.1 添加校服
router.post('/uniforms', async (req, res) => {
    try {
        const uniform = new Uniform(req.body);
        await uniform.save();
        res.status(201).json(uniform);
    } catch (err) {
        console.error('添加校服失败:', err);
        res.status(400).json({ message: '添加校服失败', error: err.message });
    }
});

// 1.2 获取校服列表（分页）
router.get('/uniforms', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [uniforms, total] = await Promise.all([
            Uniform.find()
                .populate('manufacturer_id')
                .skip(skip)
                .limit(limit)
                .sort('-created_at'),
            Uniform.countDocuments()
        ]);

        res.json({
            data: uniforms,
            pagination: {
                current: page,
                pageSize: limit,
                total
            }
        });
    } catch (err) {
        console.error('获取校服列表失败:', err);
        res.status(500).json({ message: '获取校服列表失败' });
    }
});

// 1.3 更新校服信息
router.put('/uniforms/:id', async (req, res) => {
    try {
        const uniform = await Uniform.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('manufacturer_id');

        if (!uniform) {
            return res.status(404).json({ message: '未找到该校服' });
        }

        res.json(uniform);
    } catch (err) {
        console.error('更新校服失败:', err);
        res.status(400).json({ message: '更新校服失败', error: err.message });
    }
});

// 1.4 删除校服
router.delete('/uniforms/:id', async (req, res) => {
    try {
        const uniform = await Uniform.findByIdAndDelete(req.params.id);
        if (!uniform) {
            return res.status(404).json({ message: '未找到该校服' });
        }
        res.json({ message: '删除成功' });
    } catch (err) {
        console.error('删除校服失败:', err);
        res.status(500).json({ message: '删除校服失败' });
    }
});

// 1.5 上传校服图片
router.post('/uniforms/:id/images', function(req, res) {
    console.log('收到图片上传请求，ID:', req.params.id);
    
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer错误:', err);
            return res.status(400).json({ message: 'Multer上传失败', error: err.message });
        } else if (err) {
            console.error('其他上传错误:', err);
            return res.status(400).json({ message: '文件上传失败', error: err.message });
        }
        
        console.log('请求体:', req.body);
        console.log('上传的文件:', req.files);
        
        // 确保有文件上传
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '未收到任何文件' });
        }
        
        // 将文件路径转换为URL
        const imageUrls = req.files.map(file => {
            // 只保留public后面的路径
            const relativePath = file.path.replace(path.join(process.cwd(), 'public'), '');
            // 确保路径分隔符是/
            return relativePath.replace(/\\/g, '/');
        });
        
        console.log('生成的图片URL:', imageUrls);
        
        // 更新校服记录
        Uniform.findById(req.params.id)
            .then(uniform => {
                if (!uniform) {
                    // 删除已上传的文件
                    req.files.forEach(file => {
                        try {
                            fs.unlinkSync(file.path);
                            console.log('删除文件:', file.path);
                        } catch (e) {
                            console.error('删除文件失败:', e);
                        }
                    });
                    
                    throw new Error('未找到该校服');
                }
                
                // 添加到现有图片列表
                if (!uniform.images) {
                    uniform.images = [];
                }
                
                uniform.images = uniform.images.concat(imageUrls);
                uniform.updated_at = new Date();
                
                return uniform.save();
            })
            .then(updatedUniform => {
                console.log('校服记录更新成功，包含图片数:', updatedUniform.images ? updatedUniform.images.length : 0);
                res.json({ message: '上传成功', images: updatedUniform.images });
            })
            .catch(error => {
                console.error('更新校服记录失败:', error);
                res.status(500).json({ message: '处理上传文件失败', error: error.message });
            });
    });
});

// 1.6 删除校服图片
router.delete('/uniforms/:id/images/:imageIndex', async (req, res) => {
    try {
        const uniform = await Uniform.findById(req.params.id);
        if (!uniform) {
            return res.status(404).json({ message: '未找到该校服' });
        }
        
        const imageIndex = parseInt(req.params.imageIndex);
        if (isNaN(imageIndex) || imageIndex < 0 || !uniform.images || imageIndex >= uniform.images.length) {
            return res.status(400).json({ message: '图片索引无效' });
        }
        
        // 获取要删除的图片路径
        const imagePath = uniform.images[imageIndex];
        
        // 从数组中移除该图片
        uniform.images.splice(imageIndex, 1);
        uniform.updated_at = new Date();
        await uniform.save();
        
        // 尝试从磁盘删除文件
        try {
            const fullPath = path.join(process.cwd(), 'public', imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        } catch (fileErr) {
            console.error('删除图片文件失败:', fileErr);
            // 继续执行，不影响接口返回
        }
        
        res.json({ message: '删除成功', images: uniform.images });
    } catch (err) {
        console.error('删除校服图片失败:', err);
        res.status(500).json({ message: '删除校服图片失败', error: err.message });
    }
});

// 2. 厂家管理接口
// 2.1 添加厂家
router.post('/manufacturers', async (req, res) => {
    try {
        const manufacturer = new Manufacturer(req.body);
        await manufacturer.save();
        res.status(201).json(manufacturer);
    } catch (err) {
        console.error('添加厂家失败:', err);
        res.status(400).json({ message: '添加厂家失败', error: err.message });
    }
});

// 2.2 获取厂家列表
router.get('/manufacturers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [manufacturers, total] = await Promise.all([
            Manufacturer.find()
                .skip(skip)
                .limit(limit)
                .sort('-created_at'),
            Manufacturer.countDocuments()
        ]);

        res.json({
            data: manufacturers,
            pagination: {
                current: page,
                pageSize: limit,
                total
            }
        });
    } catch (err) {
        console.error('获取厂家列表失败:', err);
        res.status(500).json({ message: '获取厂家列表失败' });
    }
});

// 2.3 更新厂家信息
router.put('/manufacturers/:id', async (req, res) => {
    try {
        const manufacturer = await Manufacturer.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!manufacturer) {
            return res.status(404).json({ message: '未找到该厂家' });
        }

        res.json(manufacturer);
    } catch (err) {
        console.error('更新厂家失败:', err);
        res.status(400).json({ message: '更新厂家失败', error: err.message });
    }
});

// 2.4 删除厂家
router.delete('/manufacturers/:id', async (req, res) => {
    try {
        // 检查是否有关联的校服
        const uniformCount = await Uniform.countDocuments({ manufacturer_id: req.params.id });
        if (uniformCount > 0) {
            return res.status(400).json({ 
                message: '无法删除该厂家，存在关联的校服信息',
                uniformCount
            });
        }

        const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);
        if (!manufacturer) {
            return res.status(404).json({ message: '未找到该厂家' });
        }

        res.json({ message: '删除成功' });
    } catch (err) {
        console.error('删除厂家失败:', err);
        res.status(500).json({ message: '删除厂家失败' });
    }
});

// 3. 统计接口
// 3.1 获取基础统计数据
router.get('/stats/basic', async (req, res) => {
    try {
        const [
            uniformCount,
            manufacturerCount,
            recentUniforms
        ] = await Promise.all([
            Uniform.countDocuments(),
            Manufacturer.countDocuments(),
            Uniform.find()
                .sort('-created_at')
                .limit(5)
                .populate('manufacturer_id')
        ]);

        res.json({
            uniformCount,
            manufacturerCount,
            recentUniforms
        });
    } catch (err) {
        console.error('获取统计数据失败:', err);
        res.status(500).json({ message: '获取统计数据失败' });
    }
});

// 3.1 获取仪表盘统计数据
router.get('/dashboard/stats', async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const [
            uniformCount,
            manufacturerCount,
            recentUniforms,
            expiringCertificates
        ] = await Promise.all([
            Uniform.countDocuments(),
            Manufacturer.countDocuments(),
            Uniform.find()
                .sort('-created_at')
                .limit(5)
                .populate('manufacturer_id'),
            Uniform.find({
                'quality_cert.valid_until': {
                    $gte: new Date(),
                    $lte: thirtyDaysFromNow
                }
            }).populate('manufacturer_id').limit(10)
        ]);

        res.json({
            stats: {
                uniformCount,
                manufacturerCount,
                expiringCertificates: expiringCertificates.length
            },
            recentUniforms,
            expiringCertificates: expiringCertificates.map(cert => {
                const daysRemaining = Math.ceil(
                    (new Date(cert.quality_cert.valid_until) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return {
                    uniform_id: cert._id,
                    uniform_name: cert.name || cert.qr_code,
                    valid_until: cert.quality_cert.valid_until,
                    days_remaining: daysRemaining
                };
            })
        });
    } catch (err) {
        console.error('获取仪表盘统计数据失败:', err);
        res.status(500).json({ message: '获取仪表盘统计数据失败' });
    }
});

module.exports = router; 