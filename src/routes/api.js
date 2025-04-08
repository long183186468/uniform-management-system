const express = require('express');
const router = express.Router();
const { Uniform, Manufacturer } = require('../models');

// 校服查询接口 - 支持二维码和编号查询
router.get('/uniforms/qr/:code', async (req, res) => {
  try {
    // 尝试直接查询输入的编号
    let uniform = await Uniform.findOne({ qr_code: req.params.code })
      .populate('manufacturer_id');
    
    // 如果没找到，尝试添加 QC 前缀再查询
    if (!uniform && !req.params.code.startsWith('QC')) {
      uniform = await Uniform.findOne({ qr_code: `QC${req.params.code}` })
        .populate('manufacturer_id');
    }
    
    if (!uniform) {
      return res.status(404).json({ 
        success: false,
        message: '未找到该校服信息'
      });
    }
    
    res.json({
      success: true,
      data: uniform
    });
  } catch (err) {
    console.error('查询校服信息错误:', err);
    res.status(500).json({ 
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 校服管理接口
router.get('/uniforms', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const [uniforms, total] = await Promise.all([
      Uniform.find()
        .populate('manufacturer_id')
        .skip(skip)
        .limit(pageSize)
        .sort('-created_at'),
      Uniform.countDocuments()
    ]);

    res.json({
      success: true,
      data: uniforms,
      pagination: {
        current: page,
        pageSize,
        total
      }
    });
  } catch (err) {
    console.error('获取校服列表错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 厂家管理接口
router.get('/manufacturers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const [manufacturers, total] = await Promise.all([
      Manufacturer.find()
        .skip(skip)
        .limit(pageSize)
        .sort('-created_at'),
      Manufacturer.countDocuments()
    ]);

    res.json({
      success: true,
      data: manufacturers,
      pagination: {
        current: page,
        pageSize,
        total
      }
    });
  } catch (err) {
    console.error('获取厂家列表错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 统计数据接口
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [uniformCount, manufacturerCount, recentUniforms] = await Promise.all([
      Uniform.countDocuments(),
      Manufacturer.countDocuments(),
      Uniform.find()
        .populate('manufacturer_id')
        .sort('-created_at')
        .limit(5)
    ]);

    res.json({
      success: true,
      data: {
        uniformCount,
        manufacturerCount,
        recentUniforms
      }
    });
  } catch (err) {
    console.error('获取统计数据错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 按批次查询校服
router.get('/uniforms/batch/:batchNo', async (req, res) => {
  try {
    const uniforms = await Uniform.find({ batch_no: req.params.batchNo })
      .populate('manufacturer_id');
    
    res.json({
      success: true,
      data: uniforms
    });
  } catch (err) {
    console.error('查询批次校服信息错误:', err);
    res.status(500).json({ 
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 按厂家查询校服
router.get('/uniforms/manufacturer/:manufacturerId', async (req, res) => {
  try {
    const uniforms = await Uniform.find({ manufacturer_id: req.params.manufacturerId })
      .populate('manufacturer_id');
    
    res.json({
      success: true,
      data: uniforms
    });
  } catch (err) {
    console.error('查询厂家校服信息错误:', err);
    res.status(500).json({ 
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 