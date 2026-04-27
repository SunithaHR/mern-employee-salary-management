import React, { useState } from "react";
import EmployeeList from "./pages/EmployeeList";
import EmployeeForm from "./pages/EmployeeForm";
import OvertimeForm from "./pages/OvertimeForm";
import OvertimeList from "./pages/OvertimeList";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("employees");
  const [editEmployee, setEditEmployee] = useState(null);

  const nav = (p, data = null) => {
    setEditEmployee(data);
    setPage(p);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="brand-icon">🏗</span>
          <span className="brand-name">ConstructHR</span>
        </div>
        <nav className="header-nav">
          <button className={page === "employees" || page === "add-employee" || page === "edit-employee" ? "nav-btn active" : "nav-btn"} onClick={() => nav("employees")}>
            Employees
          </button>
          <button className={page === "overtime" || page === "add-overtime" ? "nav-btn active" : "nav-btn"} onClick={() => nav("overtime")}>
            Overtime
          </button>
        </nav>
      </header>

      <main className="main">
        {page === "employees" && <EmployeeList onAdd={() => nav("add-employee")} onEdit={(emp) => nav("edit-employee", emp)} />}
        {page === "add-employee" && <EmployeeForm onBack={() => nav("employees")} onSaved={() => nav("employees")} />}
        {page === "edit-employee" && <EmployeeForm employee={editEmployee} onBack={() => nav("employees")} onSaved={() => nav("employees")} />}
        {page === "overtime" && <OvertimeList onAdd={() => nav("add-overtime")} />}
        {page === "add-overtime" && <OvertimeForm onBack={() => nav("overtime")} onSaved={() => nav("overtime")} />}
      </main>
    </div>
  );
}
