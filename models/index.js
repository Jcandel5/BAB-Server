const mongoose = require("mongoose");
const Employee = require("./employee");
const Coupon = require("./coupon");
require("dotenv").config();

mongoose.set("debug", true);
mongoose.connect(
  process.env.DATABASE_URI,
  { useNewUrlParser: true }
);

mongoose.Promise = Promise;

// module.exports.Employee = require("./employee");
module.exports = {
  Employee,
  Coupon
};
