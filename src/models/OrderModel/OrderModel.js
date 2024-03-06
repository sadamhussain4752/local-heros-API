const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  productIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  ],
  totalAmount: { type: Number, required: true }, // You may want to calculate this based on the products
  paymentStatus: {
    type: String,
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Refunded",
      "On Hold",
      "Completed",
      "Failed",
      "Returned",
      "Preparing",
      "Order Placed",
      "Confirmed",
      "Out for Delivery",
    ],
    default: "Pending",
  },
  delivery: { type: String, enum: ["Cash", "Card"], default: "Cash" }, // Add this field
  createdAt: { type: Date, default: Date.now },
  razorpay_payment_id: { type: String, required: true },
  exta_message: { type: String },
  exta_add_item: { type: String },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
