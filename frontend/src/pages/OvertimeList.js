import React, { useEffect, useState } from "react";
import { apiFetch, formatDate } from "../utils/api";

export default function OvertimeList({ onAdd }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/overtime");
      setEntries(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      const updated = await apiFetch(`/overtime/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setEntries((prev) => prev.map((e) => (e._id === id ? { ...e, status: updated.status } : e)));
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this overtime entry?")) return;
    try {
      await apiFetch(`/overtime/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const totalHours = entries.reduce((s, e) => s + (e.hours || 0), 0);
  const approvedCount = entries.filter((e) => e.status === "approved").length;
  const pendingCount = entries.filter((e) => e.status === "pending").length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⏱ Overtime Entries</h1>
        <button className="btn btn-primary" onClick={onAdd}>+ Log Overtime</button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{entries.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total OT Hours</div>
          <div className="stat-value">{totalHours}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approval</div>
          <div className="stat-value" style={{ color: "var(--warning)" }}>{pendingCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Approved</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{approvedCount}</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⏱</div>
          <p>No overtime entries yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id}>
                  <td>
                    <strong>{e.employee?.name || "Unknown"}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {e.employee?.designation || e.employee?.department}
                    </div>
                  </td>
                  <td>{formatDate(e.date)}</td>
                  <td>
                    <span className="badge badge-orange">{e.hours}h</span>
                  </td>
                  <td style={{ maxWidth: 220, fontSize: "0.85rem" }}>{e.reason}</td>
                  <td>
                    <span className={
                      e.status === "approved" ? "badge badge-green" :
                      e.status === "rejected" ? "badge badge-red" : "badge badge-yellow"
                    }>
                      {e.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {e.status !== "approved" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleStatus(e._id, "approved")}
                          disabled={updating === e._id + "approved"}
                        >
                          {updating === e._id + "approved" ? "..." : "✓ Approve"}
                        </button>
                      )}
                      {e.status !== "rejected" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatus(e._id, "rejected")}
                          disabled={updating === e._id + "rejected"}
                        >
                          {updating === e._id + "rejected" ? "..." : "✗ Reject"}
                        </button>
                      )}
                      {e.status !== "pending" && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStatus(e._id, "pending")}
                          disabled={!!updating}
                        >
                          Reset
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(e._id)}
                      >
                        Del
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