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

// 添加USF编号校服数据
async function addUSFData() {
  try {
    // 查找测试厂家，如果没有则创建一个
    let manufacturer = await Manufacturer.findOne({ code: 'MF001' });
    if (!manufacturer) {
      manufacturer = await Manufacturer.create({
        code: 'MF001',
        name: '测试厂家',
        license_no: 'L123456',
        contact_person: '张三',
        contact_phone: '13800138000'
      });
    }

    // 创建USF编号校服
    const uniform = await Uniform.create({
      qr_code: 'USF20240001',
      batch_no: 'B2024002',
      manufacturer_id: manufacturer._id,
      materials: [
        { name: '棉', percentage: 65 },
        { name: '涤纶', percentage: 35 }
      ],
      price: 249.99,
      quality_cert: {
        cert_no: 'C2024001',
        issue_date: new Date(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      edu_inspection_report: {
        report_no: 'R2024001',
        inspection_org: '贵州省纺织品检测中心',
        inspection_date: new Date()
      }
    });

    console.log('USF校服数据添加成功');
    console.log('校服ID:', uniform._id);
    console.log('校服编号:', uniform.qr_code);
    console.log('批次号:', uniform.batch_no);

  } catch (err) {
    console.error('添加USF校服数据失败:', err);
  } finally {
    mongoose.connection.close();
  }
}

addUSFData(); 