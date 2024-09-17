const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subname: { type: String, },
  amount: { type: Number, required: true },
  offeramount: { type: Number, required: true },
  images: [String], // Array to store multiple image URLs
  color: String,
  weight: String,
  dimensions: String,
  sku: String,
  availability: String,
  qty: { type: Number },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // Assuming you have a User model
  category: { type: String, required: true }, // Assuming you have a Category model
  brand_id: { type: String, }, // Assuming you have a Category model
  createdAt: { type: Date, default: Date.now },
  lang: { type: String },
  exta_add_item: { type: String },
  options:  {type: Boolean, default: false },
  is_type:  { type: String, },
  itemid: { type: mongoose.Schema.Types.Mixed }, // Accepts any type
  itemObject: { type: mongoose.Schema.Types.Mixed }, // Accepts any type
  itemIdArray: { type: mongoose.Schema.Types.Mixed }, // Accepts any type (array or non-array)
  itemObjectArray: { type: mongoose.Schema.Types.Mixed } // Accepts any type (array or non-array)

});

const Product = mongoose.model('Products', ProductSchema);

module.exports = Product;
