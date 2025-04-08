const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../../app');
const { Uniform, Manufacturer } = require('../../src/models');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

chai.use(chaiHttp);

describe('Dashboard API Tests', () => {
  beforeEach(async () => {
    await Uniform.deleteMany({});
    await Manufacturer.deleteMany({});
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      // 创建测试数据
      const manufacturer = await Manufacturer.create({
        code: 'TEST001',
        name: '测试制造商',
        license_no: 'L123456',
        contact_person: '联系人',
        contact_phone: '12345678901'
      });

      const uniform = await Uniform.create({
        qr_code: 'QR001',
        batch_no: 'B001',
        manufacturer_id: manufacturer._id,
        materials: [
          { name: '棉', percentage: 60 },
          { name: '涤纶', percentage: 40 }
        ],
        price: 100,
        quality_cert: {
          cert_no: 'CERT001',
          issue_date: new Date(),
          valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15天后过期
        },
        edu_inspection_report: {
          report_no: 'REP001',
          inspection_org: '测试机构',
          inspection_date: new Date()
        }
      });

      // 发送请求
      const res = await chai.request(app)
        .get('/api/dashboard/stats');

      // 验证响应
      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('object');
      expect(res.body.data.uniformCount).to.equal(1);
      expect(res.body.data.manufacturerCount).to.equal(1);
      expect(res.body.data.recentUniforms).to.be.an('array');
      expect(res.body.data.recentUniforms.length).to.equal(1);
    });

    it('should handle errors gracefully', async () => {
      // 模拟数据库错误
      const originalCountDocuments = Uniform.countDocuments;
      Uniform.countDocuments = () => {
        throw new Error('Database error');
      };

      const res = await chai.request(app)
        .get('/api/dashboard/stats');

      // 恢复原始方法
      Uniform.countDocuments = originalCountDocuments;

      expect(res).to.have.status(500);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.be.a('string');
    });
  });
}); 