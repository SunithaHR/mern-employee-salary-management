import React, { useState } from "react";
import { apiFetch } from "../utils/api";

const DESIGNATIONS = ["Mason", "Electrician", "Plumber", "Supervisor", "Helper"];
const DEPARTMENTS = ["Construction", "Electrical", "Plumbing", "Civil", "Management", "Safety"];

const empty = { name: "", email: "", phone: "", department: "", designation: "", salary: "", joinDate: "" };

function validate(f) {
  const errs = {};
  if (!f.name.trim()) errs.name = "Name is required";
  if (!f.email.trim()) errs.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(f.email)) errs.email = "Invalid email";
  if (!f.department) errs.department = "Department is required";
  if (f.salary === "" || f.salary === undefined) errs.salary = "Salary is required";
  else if (isNaN(Number(f.salary)) || Number(f.salary) < 0) errs.salary = "Salary must be a positive number"; // LF-102
  return errs;
}

export default function EmployeeForm({ employee, onBack, onSaved }) {
  const [form, setForm] = useState(
    employee
      ? { ...employee, salary: employee.salary, joinDate: employee.joinDate ? employee.joinDate.slice(0, 10) : "" }
      : { ...empty }
  );
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiError("");
    try {
      if (employee) {
        await apiFetch(`/employees/${employee._id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/employees", { method: "POST", body: JSON.stringify(form) });
      }
      onSaved();
    } catch (e) {
      setApiError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{employee ? "✏️ Edit Employee" : "➕ Add Employee"}</h1>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
      </div>

      <div className="card">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input className={errors.name ? "error" : ""} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rajesh Kumar" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input className={errors.email ? "error" : ""} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="rajesh@example.com" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
          </div>

          <div className="form-group">
            <label>Department *</label>
            <select className={errors.department ? "error" : ""} value={form.department} onChange={(e) => set("department", e.target.value)}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            {errors.department && <span className="field-error">{errors.department}</span>}
          </div>

          {/* LF-103: Designation dropdown */}
          <div className="form-group">
            <label>Designation</label>
            <select value={form.designation} onChange={(e) => set("designation", e.target.value)}>
              <option value="">Select Designation</option>
              {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* LF-102: Salary — min=0, no negatives */}
          <div className="form-group">
            <label>Monthly Salary (₹) *</label>
            <input
              className={errors.salary ? "error" : ""}
              type="number"
              min="0"
              value={form.salary}
              onChange={(e) => set("salary", e.target.value)}
              placeholder="18000"
            />
            {errors.salary && <span className="field-error">{errors.salary}</span>}
          </div>

          <div className="form-group">
            <label>Join Date</label>
            <input type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : employee ? "Update Employee" : "Add Employee"}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
