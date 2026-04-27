const express = require("express");
const router = express.Router();
const Overtime = require("../models/Overtime");
const Employee = require("../models/Employee");

// GET all overtime entries
router.get("/", async (req, res) => {
  try {
    const entries = await Overtime.find()
      .populate("employee", "name department designation")
      .sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST create overtime entry — Part 1 Feature
router.post("/", async (req, res) => {
  try {
    const { employee: employeeId, date, hours, reason } = req.body;

    // All fields required
    if (!employeeId || !date || hours === undefined || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Hours: 1–6
    const h = Number(hours);
    if (isNaN(h) || h < 1 || h > 6) {
      return res.status(400).json({ error: "Overtime hours must be between 1 and 6" });
    }

    // Reason min 10 chars
    if (reason.trim().length < 10) {
      return res.status(400).json({ error: "Reason must be at least 10 characters" });
    }

    const entryDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Date not in future
    if (entryDate > today) {
      return res.status(400).json({ error: "Date cannot be in the future" });
    }

    // Date not more than 7 days ago
    if (entryDate < sevenDaysAgo) {
      return res.status(400).json({ error: "Date cannot be more than 7 days in the past" });
    }

    // Worker must exist
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(400).json({ error: "Worker not found in the system" });
    }

    // Duplicate check: same worker + same date
    const startOfDay = new Date(entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(entryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicate = await Overtime.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (duplicate) {
      return res.status(400).json({ error: "Overtime entry already exists for this worker on this date" });
    }

    // Monthly cap: total cannot exceed 60 hours
    const startOfMonth = new Date(entryDate.getFullYear(), entryDate.getMonth(), 1);
    const endOfMonth = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0, 23, 59, 59);

    const monthlyEntries = await Overtime.find({
      employee: employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const totalMonthlyHours = monthlyEntries.reduce((sum, e) => sum + e.hours, 0);

    if (totalMonthlyHours + h > 60) {
      return res.status(400).json({
        error: `This entry would exceed the monthly limit of 60 hours. Current total: ${totalMonthlyHours}h, adding ${h}h would be ${totalMonthlyHours + h}h`,
      });
    }

    const entry = new Overtime({ employee: employeeId, date: entryDate, hours: h, reason: reason.trim() });
    await entry.save();
    await entry.populate("employee", "name department designation");

    res.status(201).json(entry);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Overtime entry already exists for this worker on this date" });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status (approve / reject)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const entry = await Overtime.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("employee", "name department designation");
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE overtime entry
router.delete("/:id", async (req, res) => {
  try {
    const entry = await Overtime.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;