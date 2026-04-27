const mongoose = require("mongoose");

const overtimeSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true },
    hours: { type: Number, required: true, min: 1, max: 6 },
    reason: { type: String, required: true, minlength: 10 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Compound unique index: one entry per worker per day
overtimeSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Overtime", overtimeSchema);
