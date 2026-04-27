const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

const DESIGNATIONS = ["Mason", "Electrician", "Plumber", "Supervisor", "Helper"];

// GET all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST create employee
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joinDate } = req.body;

    // Validations - LF-102: salary must be positive
    if (!name || !email || !department || salary === undefined) {
      return res.status(400).json({ error: "Name, email, department, and salary are required" });
    }
    if (isNaN(salary) || Number(salary) < 0) {
      return res.status(400).json({ error: "Salary must be a non-negative number" });
    }
    if (designation && !DESIGNATIONS.includes(designation)) {
      return res.status(400).json({ error: "Invalid designation" });
    }

    const employee = new Employee({ name, email, phone, department, designation, salary: Number(salary), joinDate });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// PUT update employee
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joinDate } = req.body;

    if (salary !== undefined && (isNaN(salary) || Number(salary) < 0)) {
      return res.status(400).json({ error: "Salary must be a non-negative number" });
    }
    if (designation && !DESIGNATIONS.includes(designation)) {
      return res.status(400).json({ error: "Invalid designation" });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, department, designation, salary: salary !== undefined ? Number(salary) : undefined, joinDate },
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
