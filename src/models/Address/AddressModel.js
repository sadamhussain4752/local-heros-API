const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  userId: { type: String },
  fullName: { type: String },
  phone: { type: String, required: true },
  companyName: { type: String },
  street: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  pinCode: { type: String, required: true },
  email: { type: String, },
  lat: { type: String, required: true },
  lng:  { type: String, required: true },
  typeAddress: { type: String } // Changed field name to camelCase
});

const Address = mongoose.model('devAddress', AddressSchema);

module.exports = Address;
