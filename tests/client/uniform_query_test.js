const axios = require('axios');
const { expect } = require('chai');
const config = require('../../config');

describe('校服信息查询测试', () => {
  const API_BASE_URL = config.apiBaseUrl || 'http://localhost:3000/api';
  
  // 测试数据
  const testQRCode = 'QR001';
  const nonExistentQRCode = 'QR999';

  describe('1. 校服基本信息查询', () => {
    it('通过二维码查询校服的材质和价格信息', async () => {
      const response = await axios.get(`${API_BASE_URL}/uniforms/qr/${testQRCode}`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success');
      expect(response.data.success).to.equal(true);
      expect(response.data).to.have.property('data');
      
      // 验证材质信息
      expect(response.data.data).to.have.property('materials');
      expect(response.data.data.materials).to.be.an('array');
      response.data.data.materials.forEach(material => {
        expect(material).to.have.property('name');
        expect(material).to.have.property('percentage');
        expect(material.percentage).to.be.a('number');
        expect(material.percentage).to.be.within(0, 100);
      });
      
      // 验证材质总和为100%
      const totalPercentage = response.data.data.materials.reduce(
        (sum, material) => sum + material.percentage, 
        0
      );
      expect(totalPercentage).to.equal(100);
      
      // 验证价格信息
      expect(response.data.data).to.have.property('price');
      expect(response.data.data.price).to.be.a('number');
      expect(response.data.data.price).to.be.above(0);
    });

    it('查询不存在的二维码应返回404错误', async () => {
      try {
        await axios.get(`${API_BASE_URL}/uniforms/qr/NONEXISTENT`);
        throw new Error('应该抛出404错误');
      } catch (error) {
        expect(error.response.status).to.equal(404);
        expect(error.response.data.message).to.include('未找到');
      }
    });
  });

  describe('2. 厂家合格证查询', () => {
    it('应能查看校服的质量合格证信息', async () => {
      const response = await axios.get(`${API_BASE_URL}/uniforms/qr/${testQRCode}`);
      
      expect(response.data.data).to.have.property('quality_cert');
      const cert = response.data.data.quality_cert;
      
      // 验证合格证信息完整性
      expect(cert).to.have.property('cert_no');
      expect(cert.cert_no).to.be.a('string');
      expect(cert).to.have.property('issue_date');
      expect(new Date(cert.issue_date)).to.be.an.instanceof(Date);
      expect(cert).to.have.property('valid_until');
      expect(new Date(cert.valid_until)).to.be.an.instanceof(Date);
      
      // 验证合格证在有效期内
      const validUntil = new Date(cert.valid_until);
      const now = new Date();
      expect(validUntil.getTime()).to.be.above(now.getTime());
    });
  });

  describe('3. 第三方检测报告查询', () => {
    it('应能查看校服的检测报告信息', async () => {
      const response = await axios.get(`${API_BASE_URL}/uniforms/qr/${testQRCode}`);
      
      expect(response.data.data).to.have.property('edu_inspection_report');
      const report = response.data.data.edu_inspection_report;
      
      // 验证检测报告信息完整性
      expect(report).to.have.property('report_no');
      expect(report.report_no).to.be.a('string');
      expect(report).to.have.property('inspection_org');
      expect(report.inspection_org).to.be.a('string');
      expect(report).to.have.property('inspection_date');
      expect(new Date(report.inspection_date)).to.be.an.instanceof(Date);
    });
  });

  describe('批次查询测试', () => {
    const testBatchNo = 'B2024001';

    it('应该能查询到同批次的所有校服', async () => {
      const response = await axios.get(`${API_BASE_URL}/uniforms/batch/${testBatchNo}`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success');
      expect(response.data.success).to.be.true;
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.be.at.least(2); // 每个批次有多件校服
      
      // 验证返回的所有校服都属于同一批次
      response.data.data.forEach(uniform => {
        expect(uniform.batch_no).to.equal(testBatchNo);
      });
    });
  });

  describe('厂家校服查询测试', () => {
    it('应该能查询到指定厂家的所有校服', async () => {
      // 先获取一个校服的厂家ID
      const uniformResponse = await axios.get(`${API_BASE_URL}/uniforms/qr/${testQRCode}`);
      const manufacturerId = uniformResponse.data.data.manufacturer_id._id;
      
      const response = await axios.get(`${API_BASE_URL}/uniforms/manufacturer/${manufacturerId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success');
      expect(response.data.success).to.be.true;
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.be.at.least(1);
      
      // 验证返回的所有校服都属于同一厂家
      response.data.data.forEach(uniform => {
        expect(uniform.manufacturer_id._id.toString()).to.equal(manufacturerId.toString());
      });
    });

    it('查询不存在的厂家ID应返回空数组', async () => {
      const nonExistentId = '000000000000000000000000';
      const response = await axios.get(`${API_BASE_URL}/uniforms/manufacturer/${nonExistentId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success');
      expect(response.data.success).to.be.true;
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(0);
    });
  });

  describe('材质信息测试', () => {
    it('应该能正确显示材质百分比总和为100%', async () => {
      const response = await axios.get(`${API_BASE_URL}/uniforms/qr/${testQRCode}`);
      
      const totalPercentage = response.data.data.materials.reduce(
        (sum, material) => sum + material.percentage, 
        0
      );
      
      expect(totalPercentage).to.equal(100);
    });
  });

  describe('证书有效期测试', () => {
    it('应该能正确显示质量合格证的有效期状态', async () => {
      const response = await axios.get(`${API_BASE_URL}/uniforms/qr/${testQRCode}`);
      
      const validUntil = new Date(response.data.data.quality_cert.valid_until);
      const now = new Date();
      
      // 检查日期是否为有效的Date对象
      expect(validUntil).to.be.an.instanceof(Date);
      expect(validUntil.toString()).to.not.equal('Invalid Date');
      
      // 检查有效期是否在当前日期之后（允许1天的误差）
      const oneDayInMs = 24 * 60 * 60 * 1000;
      expect(validUntil.getTime() - now.getTime()).to.be.at.least(-oneDayInMs);
    });
  });
}); 