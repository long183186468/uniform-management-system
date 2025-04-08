const mongoose = require('mongoose');
const config = require('./config');
const { Uniform, Manufacturer } = require('./src/models');

// 连接MongoDB
mongoose.connect(config.mongodb.url, config.mongodb.options)
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  });

// 初始化测试数据
async function initTestData() {
  try {
    // 清空现有数据
    await Uniform.deleteMany({});
    await Manufacturer.deleteMany({});

    // 创建测试厂家
    const manufacturer = await Manufacturer.create({
      code: 'MF001',
      name: '测试厂家',
      license_no: 'L123456',
      contact_person: '张三',
      contact_phone: '13800138000'
    });

    // 创建测试校服
    const uniform = await Uniform.create({
      qr_code: 'QR001',
      batch_no: 'B2024001',
      manufacturer_id: manufacturer._id,
      materials: [
        { name: '棉', percentage: 60 },
        { name: '涤纶', percentage: 40 }
      ],
      price: 199.99,
      images: ['/uploads/images/uniform-sample1.jpg', '/uploads/images/uniform-sample2.jpg'],
      quality_cert: {
        cert_no: 'C001',
        issue_date: new Date(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      edu_inspection_report: {
        report_no: 'R001',
        inspection_org: '纺织品检测中心',
        inspection_date: new Date()
      }
    });
    
    // 再创建几个同批次的校服
    await Promise.all([
      Uniform.create({
        qr_code: 'QR002',
        batch_no: 'B2024001',
        manufacturer_id: manufacturer._id,
        materials: [
          { name: '棉', percentage: 60 },
          { name: '涤纶', percentage: 40 }
        ],
        price: 199.99,
        images: ['/uploads/images/uniform-sample3.jpg'],
        quality_cert: {
          cert_no: 'C002',
          issue_date: new Date(),
          valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        },
        edu_inspection_report: {
          report_no: 'R002',
          inspection_org: '纺织品检测中心',
          inspection_date: new Date()
        }
      }),
      Uniform.create({
        qr_code: 'QR003',
        batch_no: 'B2024001',
        manufacturer_id: manufacturer._id,
        materials: [
          { name: '棉', percentage: 60 },
          { name: '涤纶', percentage: 40 }
        ],
        price: 199.99,
        images: ['/uploads/images/uniform-sample4.jpg'],
        quality_cert: {
          cert_no: 'C003',
          issue_date: new Date(),
          valid_until: new Date(Date.now() + 720 * 24 * 60 * 60 * 1000)
        },
        edu_inspection_report: {
          report_no: 'R003',
          inspection_org: '纺织品检测中心',
          inspection_date: new Date()
        }
      })
    ]);

    console.log('测试数据初始化成功');
    console.log('厂家ID:', manufacturer._id);
    console.log('校服ID:', uniform._id);

    // 查询当前数据
    const uniformCount = await Uniform.countDocuments();
    const manufacturerCount = await Manufacturer.countDocuments();
    console.log(`当前数据：校服 ${uniformCount} 条，厂家 ${manufacturerCount} 条`);
    process.exit(0);
  } catch (err) {
    console.error('初始化测试数据失败:', err);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

initTestData(); 