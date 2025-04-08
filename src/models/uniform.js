const mongoose = require('mongoose');

const uniformSchema = new mongoose.Schema({
  qr_code: { type: String, required: true, unique: true },
  batch_no: { type: String, required: true },
  manufacturer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  materials: [{
    name: String,
    percentage: Number
  }],
  price: Number,
  images: [String],
  quality_cert: {
    cert_no: String,
    issue_date: Date,
    valid_until: Date
  },
  edu_inspection_report: {
    report_no: String,
    inspection_org: String,
    inspection_date: Date
  },
  status: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Uniform', uniformSchema); 