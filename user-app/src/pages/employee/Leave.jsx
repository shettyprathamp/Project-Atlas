import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Leave.css";

import api from "../../services/api";

export default function Leave() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // =========================================================
  // SIDEBAR NAVIGATION
  // =========================================================

  const employeeNavigation = [
    {
      label: "Dashboard",
      path: "/employee",
      icon: "▦",
    },
    {
      label: "Attendance",
      path: "/employee/attendance",
      icon: "◷",
    },
    {
      label: "Leave",
      path: "/employee/leave",
      icon: "▣",
    },
    {
      label: "Payslips",
      path: "/employee/payslips",
      icon: "₹",
    },
    {
      label: "My Profile",
      path: "/employee/profile",
      icon: "●",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("atlas_user");

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // FETCH LEAVE
  // =========================================================

  const fetchLeave = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employee/leave");

      setLeaveRequests(response.data || []);
    } catch (err) {
      console.error("Failed to load leave:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load leave information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchLeave();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // APPLY LEAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.leave_type) {
      setError("Please select a leave type.");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError("Please select the start and end date.");
      return;
    }

    if (formData.start_date > formData.end_date) {
      setError("Start date cannot be after end date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/employee/leave", {
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason.trim() || null,
      });

      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setShowForm(false);

      await fetchLeave();
    } catch (err) {
      console.error("Leave application failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // DURATION
  // =========================================================

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "—";
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "—";
    }

    const difference =
      Math.round(
        (end - start) / (1000 * 60 * 60 * 24)
      ) + 1;

    return `${difference} ${
      difference === 1 ? "Day" : "Days"
    }`;
  };

  // =========================================================
  // LEAVE SUMMARY
  // =========================================================

  const totalRequests = leaveRequests.length;

  const approvedRequests = leaveRequests.filter(
    (request) =>
      request.status?.toLowerCase() === "approved"
  ).length;

  const pendingRequests = leaveRequests.filter(
    (request) =>
      request.status?.toLowerCase() === "pending"
  ).length;

  const rejectedRequests = leaveRequests.filter(
    (request) =>
      request.status?.toLowerCase() === "rejected"
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="employee-leave-root">

        {/* SIDEBAR */}
        <aside className="employee-leave-sidebar">

          <div className="employee-leave-sidebar-brand">
            <div className="employee-leave-brand-mark">
              A
            </div>

            <div>
              <strong>ATLAS</strong>
              <span>EMPLOYEE PORTAL</span>
            </div>
          </div>

          <nav className="employee-leave-navigation">

            <div className="employee-leave-navigation-title">
              WORKSPACE
            </div>

            {employeeNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `employee-leave-nav-item ${
                    isActive
                      ? "employee-leave-nav-active"
                      : ""
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="employee-leave-nav-icon">
                  {item.icon}
                </span>

                <span className="employee-leave-nav-label">
                  {item.label}
                </span>

                <span className="employee-leave-nav-chevron">
                  ›
                </span>
              </NavLink>
            ))}

          </nav>

          <div className="employee-leave-sidebar-footer">

            <button
              type="button"
              className="employee-leave-logout"
              onClick={handleLogout}
            >
              <span className="employee-leave-nav-icon">
                ↪
              </span>

              <span>
                Logout
              </span>
            </button>

          </div>

        </aside>

        <div
          className={`employee-leave-sidebar-overlay ${
            sidebarOpen
              ? "employee-leave-sidebar-overlay-open"
              : ""
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <main className="employee-leave-main">

          <div className="employee-leave-mobile-header">

            <button
              type="button"
              className="employee-leave-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              ☰
            </button>

            <strong>
              ATLAS
            </strong>

          </div>

          <div className="employee-leave-page">

            <div className="employee-leave-header">
              <div>
                <span className="employee-leave-eyebrow">
                  EMPLOYEE
                </span>

                <h1>Leave</h1>

                <p>
                  Loading your leave information...
                </p>
              </div>
            </div>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="employee-leave-root">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`employee-leave-sidebar ${
          sidebarOpen
            ? "employee-leave-sidebar-open"
            : ""
        }`}
      >

        <div className="employee-leave-sidebar-brand">

          <div className="employee-leave-brand-mark">
            A
          </div>

          <div>
            <strong>
              ATLAS
            </strong>

            <span>
              EMPLOYEE PORTAL
            </span>
          </div>

        </div>

        <nav className="employee-leave-navigation">

          <div className="employee-leave-navigation-title">
            WORKSPACE
          </div>

          {employeeNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `employee-leave-nav-item ${
                  isActive
                    ? "employee-leave-nav-active"
                    : ""
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >

              <span className="employee-leave-nav-icon">
                {item.icon}
              </span>

              <span className="employee-leave-nav-label">
                {item.label}
              </span>

              <span className="employee-leave-nav-chevron">
                ›
              </span>

            </NavLink>
          ))}

        </nav>

        <div className="employee-leave-sidebar-footer">

          <button
            type="button"
            className="employee-leave-logout"
            onClick={handleLogout}
          >

            <span className="employee-leave-nav-icon">
              ↪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      <div
        className={`employee-leave-sidebar-overlay ${
          sidebarOpen
            ? "employee-leave-sidebar-overlay-open"
            : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="employee-leave-main">

        {/* MOBILE HEADER */}

        <div className="employee-leave-mobile-header">

          <button
            type="button"
            className="employee-leave-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <strong>
            ATLAS
          </strong>

        </div>

        <div className="employee-leave-page">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="employee-leave-header">

            <div>
              <span className="employee-leave-eyebrow">
                EMPLOYEE
              </span>

              <h1>
                Leave
              </h1>

              <p>
                Manage your leave requests and apply for
                time off.
              </p>
            </div>

            <button
              className="employee-leave-primary-btn"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
            >
              <span>+</span>
              Apply for Leave
            </button>

          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="employee-leave-error">
              <span className="employee-leave-error-icon">
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          )}

          {/* =====================================================
              REAL SUMMARY
          ====================================================== */}

          <section className="employee-leave-section">

            <div className="employee-leave-section-header">

              <div>
                <h2>
                  Leave Overview
                </h2>

                <p>
                  Based on your actual leave requests.
                </p>
              </div>

            </div>

            <div className="employee-leave-balance-grid">

              <div className="employee-leave-balance-card annual">

                <div className="employee-leave-balance-top">

                  <div className="employee-leave-balance-icon">
                    T
                  </div>

                  <span>
                    Total Requests
                  </span>

                </div>

                <div className="employee-leave-balance-number">

                  <strong>
                    {totalRequests}
                  </strong>

                  <small>
                    submitted requests
                  </small>

                </div>

              </div>

              <div className="employee-leave-balance-card sick">

                <div className="employee-leave-balance-top">

                  <div className="employee-leave-balance-icon">
                    A
                  </div>

                  <span>
                    Approved
                  </span>

                </div>

                <div className="employee-leave-balance-number">

                  <strong>
                    {approvedRequests}
                  </strong>

                  <small>
                    approved requests
                  </small>

                </div>

              </div>

              <div className="employee-leave-balance-card casual">

                <div className="employee-leave-balance-top">

                  <div className="employee-leave-balance-icon">
                    P
                  </div>

                  <span>
                    Pending
                  </span>

                </div>

                <div className="employee-leave-balance-number">

                  <strong>
                    {pendingRequests}
                  </strong>

                  <small>
                    awaiting approval
                  </small>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              APPLY FORM
          ====================================================== */}

          {showForm && (
            <section className="employee-leave-apply-card">

              <div className="employee-leave-apply-content">

                <div className="employee-leave-apply-icon">
                  +
                </div>

                <div>
                  <h2>
                    Apply for Leave
                  </h2>

                  <p>
                    Submit your leave request to your manager.
                  </p>
                </div>

              </div>

              <form
                className="employee-leave-form"
                onSubmit={handleSubmit}
              >

                <div className="employee-leave-form-field">

                  <label>
                    Leave Type
                  </label>

                  <select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select leave type
                    </option>

                    <option value="Annual Leave">
                      Annual Leave
                    </option>

                    <option value="Sick Leave">
                      Sick Leave
                    </option>

                    <option value="Casual Leave">
                      Casual Leave
                    </option>
                  </select>

                </div>

                <div className="employee-leave-form-date-grid">

                  <div className="employee-leave-form-field">

                    <label>
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="employee-leave-form-field">

                    <label>
                      End Date
                    </label>

                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>

                <div className="employee-leave-form-field">

                  <label>
                    Reason
                  </label>

                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for leave"
                    rows="4"
                  />

                </div>

                <div className="employee-leave-form-actions">

                  <button
                    type="submit"
                    className="employee-leave-primary-btn"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Leave"}
                  </button>

                  <button
                    type="button"
                    className="employee-leave-secondary-btn"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </section>
          )}

          {/* =====================================================
              LEAVE REQUESTS
          ====================================================== */}

          <section className="employee-leave-requests-card">

            <div className="employee-leave-requests-header">

              <div>
                <h2>
                  Leave Requests
                </h2>

                <p>
                  Your actual submitted leave requests.
                </p>
              </div>

              <div className="employee-leave-request-count">

                <strong>
                  {totalRequests}
                </strong>

                <span>
                  Requests
                </span>

              </div>

            </div>

            <div className="employee-leave-table-wrapper">

              <table className="employee-leave-table">

                <thead>

                  <tr>
                    <th>
                      Leave Type
                    </th>

                    <th>
                      From
                    </th>

                    <th>
                      To
                    </th>

                    <th>
                      Duration
                    </th>

                    <th>
                      Reason
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {leaveRequests.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="employee-leave-empty"
                      >
                        No leave requests found.
                      </td>

                    </tr>

                  ) : (

                    leaveRequests.map((request) => {

                      const status =
                        request.status || "Pending";

                      return (
                        <tr key={request.id}>

                          <td>
                            <strong className="employee-leave-type">
                              {request.leave_type || "—"}
                            </strong>
                          </td>

                          <td>
                            {formatDate(
                              request.start_date
                            )}
                          </td>

                          <td>
                            {formatDate(
                              request.end_date
                            )}
                          </td>

                          <td>
                            {calculateDays(
                              request.start_date,
                              request.end_date
                            )}
                          </td>

                          <td className="employee-leave-reason">
                            {request.reason || "—"}
                          </td>

                          <td>

                            <span
                              className={`employee-leave-status ${status
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >

                              <span className="employee-leave-status-dot" />

                              {status}

                            </span>

                          </td>

                        </tr>
                      );
                    })

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}