const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  title: String,
  date: {
    type: Date,
    default: Date.now
  },
  image: String,
  desc: String
});
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
