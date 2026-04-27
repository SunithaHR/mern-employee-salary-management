const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// LF-101: Date formatter — DD/MM/YYYY
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// LF-104: CSV export
export function exportToCSV(data, filename = "employees.csv") {
  const headers = ["Name", "Designation", "Department", "Salary", "Email", "Phone", "Join Date"];
  const rows = data.map((e) => [
    e.name,
    e.designation || "",
    e.department,
    e.salary,
    e.email,
    e.phone || "",
    formatDate(e.joinDate),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
