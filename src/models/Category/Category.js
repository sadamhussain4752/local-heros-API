// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  // Add new fields below
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lang: { type: String, required: true },
  order_by:{ type: String}

});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
