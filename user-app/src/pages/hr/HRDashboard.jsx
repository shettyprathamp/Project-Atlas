import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "./HRDashboard.css";

export default function HRDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employees/");
      setEmployees(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load employee statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) =>
      employee.status?.toLowerCase() === "active"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) =>
      employee.status?.toLowerCase() === "inactive"
  ).length;

  const departmentCount = useMemo(() => {
    const departments = new Set();

    employees.forEach((employee) => {
      if (employee.department) {
        departments.add(employee.department);
      }
    });

    return departments.size;
  }, [employees]);

  const activePercentage =
    totalEmployees > 0
      ? Math.round(
          (activeEmployees / totalEmployees) * 100
        )
      : 0;

  const quickActions = [
    {
      title: "Manage Employees",
      description:
        "Add, update and manage your workforce.",
      icon: "01",
      path: "/hr/employees",
    },
    {
      title: "Attendance",
      description:
        "Monitor daily attendance and working hours.",
      icon: "02",
      path: "/hr/attendance",
    },
    {
      title: "Leave Management",
      description:
        "Review and manage employee leave requests.",
      icon: "03",
      path: "/hr/leave",
    },
    {
      title: "Recruitment",
      description:
        "Manage candidates and hiring pipelines.",
      icon: "04",
      path: "/hr/recruitment",
    },
    {
      title: "Payroll",
      description:
        "Review employee salary and payroll records.",
      icon: "05",
      path: "/hr/payroll",
    },
    {
      title: "Reports",
      description:
        "View workforce and HR performance reports.",
      icon: "06",
      path: "/hr/reports",
    },
  ];

  return (
    <div className="hr-dashboard">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <section className="hr-dashboard-header">
        <div>
          <span className="hr-dashboard-eyebrow">
            PEOPLE OPERATIONS
          </span>

          <h1>
            HR Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.email || "HR User"}
            </strong>
            . Here's an overview of your
            workforce and HR operations.
          </p>
        </div>

        <button
          className="hr-primary-button"
          onClick={() =>
            navigate("/hr/employees")
          }
        >
          <span>+</span>
          Add Employee
        </button>
      </section>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="hr-error">
          <span>!</span>

          <div>
            <strong>
              Unable to load dashboard
            </strong>

            <p>{error}</p>
          </div>

          <button
            onClick={fetchEmployees}
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================================
          OVERVIEW
      ========================================= */}

      <section className="hr-overview-grid">

        <div className="hr-stat-card primary">
          <div className="hr-stat-top">
            <span>
              TOTAL EMPLOYEES
            </span>

            <div className="hr-stat-icon">
              👥
            </div>
          </div>

          <strong className="hr-stat-number">
            {loading ? "—" : totalEmployees}
          </strong>

          <p>
            Total company workforce
          </p>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-top">
            <span>
              ACTIVE
            </span>

            <div className="hr-stat-icon green">
              ✓
            </div>
          </div>

          <strong className="hr-stat-number">
            {loading ? "—" : activeEmployees}
          </strong>

          <div className="hr-stat-meta">
            <span className="hr-positive">
              {activePercentage}%
            </span>

            <span>
              of workforce active
            </span>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-top">
            <span>
              INACTIVE
            </span>

            <div className="hr-stat-icon muted">
              —
            </div>
          </div>

          <strong className="hr-stat-number">
            {loading ? "—" : inactiveEmployees}
          </strong>

          <p>
            Currently inactive
          </p>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-top">
            <span>
              DEPARTMENTS
            </span>

            <div className="hr-stat-icon purple">
              #
            </div>
          </div>

          <strong className="hr-stat-number">
            {loading ? "—" : departmentCount}
          </strong>

          <p>
            Active workforce departments
          </p>
        </div>

      </section>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <div className="hr-dashboard-grid">

        {/* =======================================
            EMPLOYEES
        ======================================= */}

        <section className="hr-panel">

          <div className="hr-panel-header">
            <div>
              <span className="hr-panel-eyebrow">
                WORKFORCE
              </span>

              <h2>
                Employees
              </h2>

              <p>
                Your current company workforce.
              </p>
            </div>

            <button
              className="hr-panel-action"
              onClick={() =>
                navigate("/hr/employees")
              }
            >
              View All
              <span>→</span>
            </button>
          </div>

          {loading ? (
            <div className="hr-loading-list">

              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    className="hr-skeleton-row"
                    key={item}
                  >
                    <div className="hr-skeleton-avatar" />

                    <div className="hr-skeleton-content">
                      <div />
                      <span />
                    </div>
                  </div>
                )
              )}

            </div>
          ) : employees.length === 0 ? (
            <div className="hr-empty-state">

              <div className="hr-empty-icon">
                👥
              </div>

              <h3>
                No employees yet
              </h3>

              <p>
                Add your first employee to
                start building your workforce.
              </p>

              <button
                onClick={() =>
                  navigate("/hr/employees")
                }
              >
                Add First Employee
              </button>

            </div>
          ) : (
            <div className="hr-employee-list">

              {employees
                .slice(0, 6)
                .map((employee) => {

                  const initial =
                    employee.name
                      ?.charAt(0)
                      .toUpperCase() || "U";

                  return (
                    <div
                      className="hr-employee-row"
                      key={employee.id}
                    >

                      <div className="hr-employee-main">

                        <div className="hr-employee-avatar">
                          {initial}
                        </div>

                        <div>
                          <strong>
                            {employee.name}
                          </strong>

                          <span>
                            {employee.email}
                          </span>
                        </div>

                      </div>

                      <div className="hr-employee-details">

                        <span className="hr-role">
                          {employee.role ||
                            "Employee"}
                        </span>

                        <span>
                          {employee.department ||
                            "No department"}
                        </span>

                      </div>

                      <span
                        className={`hr-status ${
                          employee.status
                            ?.toLowerCase() ===
                          "active"
                            ? "active"
                            : "neutral"
                        }`}
                      >
                        <i />

                        {employee.status ||
                          "Active"}
                      </span>

                    </div>
                  );
                })}

            </div>
          )}

        </section>

        {/* =======================================
            QUICK ACTIONS
        ======================================= */}

        <section className="hr-panel hr-actions-panel">

          <div className="hr-panel-header">
            <div>
              <span className="hr-panel-eyebrow">
                OPERATIONS
              </span>

              <h2>
                Quick Actions
              </h2>

              <p>
                Access your most-used HR tools.
              </p>
            </div>
          </div>

          <div className="hr-quick-actions">

            {quickActions.map(
              (action) => (
                <button
                  className="hr-action-card"
                  key={action.path}
                  onClick={() =>
                    navigate(action.path)
                  }
                >

                  <div className="hr-action-number">
                    {action.icon}
                  </div>

                  <div className="hr-action-content">
                    <strong>
                      {action.title}
                    </strong>

                    <span>
                      {action.description}
                    </span>
                  </div>

                  <span className="hr-action-arrow">
                    →
                  </span>

                </button>
              )
            )}

          </div>

        </section>

      </div>

      {/* =========================================
          HR MODULES
      ========================================= */}

      <section className="hr-module-section">

        <div className="hr-module-heading">

          <div>
            <span>
              HR OPERATIONS
            </span>

            <h2>
              Manage your workforce
            </h2>
          </div>

          <p>
            Everything you need to manage
            people, attendance, hiring and payroll.
          </p>

        </div>

        <div className="hr-module-grid">

          <button
            onClick={() =>
              navigate("/hr/attendance")
            }
          >
            <span className="module-icon">
              ◷
            </span>

            <strong>
              Attendance
            </strong>

            <span>
              Daily workforce register
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/hr/leave")
            }
          >
            <span className="module-icon">
              ◫
            </span>

            <strong>
              Leave
            </strong>

            <span>
              Time-off requests
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/hr/recruitment")
            }
          >
            <span className="module-icon">
              ◇
            </span>

            <strong>
              Recruitment
            </strong>

            <span>
              Candidate pipeline
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/hr/payroll")
            }
          >
            <span className="module-icon">
              ₹
            </span>

            <strong>
              Payroll
            </strong>

            <span>
              Salary management
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/hr/reports")
            }
          >
            <span className="module-icon">
              ▥
            </span>

            <strong>
              Reports
            </strong>

            <span>
              Workforce insights
            </span>
          </button>

        </div>

      </section>

    </div>
  );
}