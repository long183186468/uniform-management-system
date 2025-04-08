const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  license_no: { type: String, required: true },
  contact_person: String,
  contact_phone: String,
  status: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Manufacturer', manufacturerSchema); 