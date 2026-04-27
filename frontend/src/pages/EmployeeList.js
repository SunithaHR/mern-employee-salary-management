import React, { useEffect, useState } from "react";
import { apiFetch, formatDate, exportToCSV } from "../utils/api";

const DESIGNATIONS = ["Mason", "Electrician", "Plumber", "Supervisor", "Helper"];

export default function EmployeeList({ onAdd, onEdit }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/employees");
      setEmployees(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    setDeleting(id);
    try {
      await apiFetch(`/employees/${id}`, { method: "DELETE" });
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  // LF-104: CSV export
  const handleExport = () => exportToCSV(employees, "employees.csv");

  const totalSalary = employees.reduce((s, e) => s + (e.salary || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👷 Employees</h1>
        <div className="page-actions">
          {/* LF-104 */}
          <button className="btn btn-success" onClick={handleExport}>
            ⬇ Export CSV
          </button>
          <button className="btn btn-primary" onClick={onAdd}>
            + Add Employee
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{employees.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Salary/Month</div>
          <div className="stat-value" style={{ fontSize: "1.3rem" }}>₹{totalSalary.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👷</div>
          <p>No employees yet. Add your first worker.</p>
        </div>
      ) : (
        /* LF-105: table-wrap for horizontal scroll on mobile */
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>{/* LF-103 */}
                <th>Department</th>
                <th>Salary</th>
                <th>Join Date</th>{/* LF-101: DD/MM/YYYY */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id}>
                  <td>
                    <strong>{e.name}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{e.email}</div>
                  </td>
                  <td>
                    {e.designation ? (
                      <span className="badge badge-orange">{e.designation}</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>{e.department}</td>
                  <td>₹{Number(e.salary).toLocaleString("en-IN")}</td>
                  <td>{formatDate(e.joinDate)}</td>{/* LF-101 */}
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => onEdit(e)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(e._id)}
                        disabled={deleting === e._id}
                      >
                        {deleting === e._id ? "..." : "Del"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
