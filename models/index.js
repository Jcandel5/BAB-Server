var mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("debug", true);
mongoose.connect(
  process.env.DATABASE_URI,
  { useNewUrlParser: true }
);

mongoose.Promise = Promise;

module.exports.Employee = require("./employee");
