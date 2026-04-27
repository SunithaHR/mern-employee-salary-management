import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function validate(form) {
  const errs = {};
  if (!form.employee) errs.employee = "Please select a worker";
  if (!form.date) errs.date = "Date is required";
  else {
    const d = new Date(form.date);
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7); sevenAgo.setHours(0, 0, 0, 0);
    if (d > today) errs.date = "Date cannot be in the future";
    else if (d < sevenAgo) errs.date = "Date cannot be more than 7 days in the past";
  }
  if (form.hours === "" || form.hours === undefined) errs.hours = "Hours are required";
  else {
    const h = Number(form.hours);
    if (isNaN(h) || h < 1 || h > 6) errs.hours = "Overtime hours must be between 1 and 6";
  }
  if (!form.reason.trim()) errs.reason = "Reason is required";
  else if (form.reason.trim().length < 10) errs.reason = "Reason must be at least 10 characters";
  return errs;
}

export default function OvertimeForm({ onBack, onSaved }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: "", date: getToday(), hours: "", reason: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/employees").then(setEmployees).catch(console.error);
  }, []);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setApiError("");
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiError("");
    setSuccess("");
    try {
      await apiFetch("/overtime", { method: "POST", body: JSON.stringify(form) });
      setSuccess("Overtime entry submitted successfully!");
      setForm({ employee: "", date: getToday(), hours: "", reason: "" });
      setErrors({});
    } catch (e) {
      setApiError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Min/max date for date picker
  const todayStr = getToday();
  const sevenAgoDate = new Date();
  sevenAgoDate.setDate(sevenAgoDate.getDate() - 7);
  const minDate = sevenAgoDate.toISOString().slice(0, 10);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⏱ Log Overtime</h1>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 20 }}>
          Log daily overtime for site workers. Max 6 hours/day, 60 hours/month per worker.
        </p>

        {apiError && <div className="alert alert-error">⚠ {apiError}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        <div className="form-grid">
          <div className="form-group full">
            <label>Worker *</label>
            <select className={errors.employee ? "error" : ""} value={form.employee} onChange={(e) => set("employee", e.target.value)}>
              <option value="">Select Worker</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.designation || emp.department}
                </option>
              ))}
            </select>
            {errors.employee && <span className="field-error">{errors.employee}</span>}
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              className={errors.date ? "error" : ""}
              value={form.date}
              min={minDate}
              max={todayStr}
              onChange={(e) => set("date", e.target.value)}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label>Overtime Hours * (1–6)</label>
            <input
              type="number"
              className={errors.hours ? "error" : ""}
              value={form.hours}
              min="1"
              max="6"
              step="0.5"
              onChange={(e) => set("hours", e.target.value)}
              placeholder="e.g. 2"
            />
            {errors.hours && <span className="field-error">{errors.hours}</span>}
          </div>

          <div className="form-group full">
            <label>Reason * (min 10 characters)</label>
            <textarea
              className={errors.reason ? "error" : ""}
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              placeholder="e.g. Emergency foundation work to meet project deadline"
            />
            <span style={{ fontSize: "0.75rem", color: form.reason.length < 10 ? "var(--text-muted)" : "var(--success)" }}>
              {form.reason.length} / 10 min characters
            </span>
            {errors.reason && <span className="field-error">{errors.reason}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Submitting..." : "Submit Overtime"}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
