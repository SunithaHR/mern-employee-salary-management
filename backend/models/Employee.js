const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true },
    designation: {
      type: String,
      enum: ["Mason", "Electrician", "Plumber", "Supervisor", "Helper", ""],
      default: "",
    },
    salary: {
      type: Number,
      required: true,
      min: [0, "Salary cannot be negative"], // LF-102
    },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
