const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  image: String,
  date: {
    type: Date,
    default: Date.now
  }
});
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
