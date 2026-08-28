
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        profileResponse,
        attendanceTodayResponse,
        attendanceHistoryResponse,
        leaveResponse,
        payrollResponse,
      ] = await Promise.all([
        api.get("/employee/profile"),
        api.get("/employee/attendance/today"),
        api.get("/employee/attendance"),
        api.get("/employee/leave"),
        api.get("/employee/payroll"),
      ]);

      setProfile(profileResponse.data || null);

      setAttendance(
        attendanceTodayResponse.data || null
      );

      setAttendanceHistory(
        Array.isArray(attendanceHistoryResponse.data)
          ? attendanceHistoryResponse.data
          : []
      );

      setLeaves(
        Array.isArray(leaveResponse.data)
          ? leaveResponse.data
          : []
      );

      setPayroll(
        Array.isArray(payrollResponse.data)
          ? payrollResponse.data
          : []
      );
    } catch (err) {
      console.error(
        "Employee dashboard loading failed:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load employee data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================================
     CHECK IN
  ========================================================= */

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await api.post(
        "/employee/attendance/check-in"
      );

      setAttendance(response.data);

      const historyResponse = await api.get(
        "/employee/attendance"
      );

      setAttendanceHistory(
        Array.isArray(historyResponse.data)
          ? historyResponse.data
          : []
      );
    } catch (err) {
      console.error("Check-in failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to check in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     CHECK OUT
  ========================================================= */

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await api.post(
        "/employee/attendance/check-out"
      );

      setAttendance(response.data);

      const historyResponse = await api.get(
        "/employee/attendance"
      );

      setAttendanceHistory(
        Array.isArray(historyResponse.data)
          ? historyResponse.data
          : []
      );
    } catch (err) {
      console.error("Check-out failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to check out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     WORKED TIME
  ========================================================= */

  const calculateWorkedTime = () => {
    if (!attendance?.check_in) {
      return "0h 00m";
    }

    const parseTime = (value) => {
      if (!value) return null;

      const parts = String(value)
        .split(":")
        .map(Number);

      if (parts.length < 2) {
        return null;
      }

      const date = new Date();

      date.setHours(
        parts[0] || 0,
        parts[1] || 0,
        parts[2] || 0,
        0
      );

      return date;
    };

    const checkIn = parseTime(
      attendance.check_in
    );

    if (!checkIn) {
      return "0h 00m";
    }

    const checkOut = attendance.check_out
      ? parseTime(attendance.check_out)
      : new Date();

    if (!checkOut) {
      return "0h 00m";
    }

    const difference = Math.max(
      0,
      checkOut.getTime() -
        checkIn.getTime()
    );

    const totalMinutes = Math.floor(
      difference / 60000
    );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    return `${hours}h ${String(
      minutes
    ).padStart(2, "0")}m`;
  };

  /* =========================================================
     EMPLOYEE INFORMATION
  ========================================================= */

  const employeeName =
    profile?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Employee";

  const initials =
    employeeName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "E";

  const isCheckedIn =
    Boolean(attendance?.check_in);

  const isCheckedOut =
    Boolean(attendance?.check_out);

  /* =========================================================
     MONTHLY ATTENDANCE
  ========================================================= */

  const currentMonth =
    today.getMonth() + 1;

  const currentYear =
    today.getFullYear();

  const daysPresentThisMonth =
    attendanceHistory.filter((record) => {
      if (!record?.date) {
        return false;
      }

      const recordDate = new Date(
        `${record.date}T00:00:00`
      );

      return (
        recordDate.getMonth() + 1 ===
          currentMonth &&
        recordDate.getFullYear() ===
          currentYear &&
        String(record.status || "")
          .toLowerCase() === "present"
      );
    }).length;

  /* =========================================================
     LEAVE
  ========================================================= */

  const pendingLeaves =
    leaves.filter(
      (leave) =>
        String(leave.status || "")
          .toLowerCase() === "pending"
    ).length;

  const approvedLeaves =
    leaves.filter(
      (leave) =>
        String(leave.status || "")
          .toLowerCase() === "approved"
    );

  const usedLeaveDays =
    approvedLeaves.reduce(
      (total, leave) => {
        if (
          !leave.start_date ||
          !leave.end_date
        ) {
          return total;
        }

        const start = new Date(
          `${leave.start_date}T00:00:00`
        );

        const end = new Date(
          `${leave.end_date}T00:00:00`
        );

        const difference =
          end.getTime() -
          start.getTime();

        const days =
          Math.floor(
            difference /
              (1000 * 60 * 60 * 24)
          ) + 1;

        return total + Math.max(0, days);
      },
      0
    );

  const leaveBalance = "—";

  /* =========================================================
     PAYROLL
  ========================================================= */

  const latestPayroll =
    payroll.length > 0
      ? payroll[0]
      : null;

  const getPayrollMonth = (record) => {
    if (!record) {
      return "—";
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `${monthNames[
      Number(record.month) - 1
    ] || "Unknown"} ${record.year || ""}`;
  };

  const getSalary = (record) => {
    if (!record) {
      return "—";
    }

    const salary = Number(
      record.net_salary ?? 0
    );

    return `₹${salary.toLocaleString(
      "en-IN"
    )}`;
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const employeeNavigation = [
    {
      label: "Dashboard",
      path: "/employee",
      icon: "⌂",
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
      label: "Tasks",
      path: "/employee/tasks",
      icon: "✓",
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

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="employee-dashboard-root">
        <div className="employee-loading-screen">
          <div className="employee-loading-spinner" />

          <h2>
            Loading your workspace
          </h2>

          <p>
            Preparing your Atlas employee portal...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !profile) {
    return (
      <div className="employee-dashboard-root">
        <div className="employee-error-screen">
          <div className="employee-error-icon">
            !
          </div>

          <h2>
            Unable to load dashboard
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="employee-primary-button"
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="employee-dashboard-root">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="employee-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
          IMPORTANT: NO DashboardLayout HERE
      ===================================================== */}

      <aside
        className={`employee-sidebar ${
          sidebarOpen
            ? "employee-sidebar-open"
            : ""
        }`}
      >

        <div className="employee-sidebar-logo">
          <div className="employee-logo-title">
            ATLAS
          </div>

          <div className="employee-logo-subtitle">
            EMPLOYEE PORTAL
          </div>
        </div>

        <div className="employee-sidebar-profile">

          <div className="employee-sidebar-avatar">
            {initials}
          </div>

          <div className="employee-sidebar-profile-text">
            <strong>
              {employeeName}
            </strong>

            <span>
              {profile?.department ||
                "Employee"}
            </span>
          </div>

        </div>

        <nav className="employee-navigation">

          <div className="employee-navigation-title">
            WORKSPACE
          </div>

          {employeeNavigation.map(
            (item) => {
              const isActive =
                location.pathname ===
                item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`employee-nav-item ${
                    isActive
                      ? "employee-nav-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      item.path
                    )
                  }
                >
                  <span className="employee-nav-icon">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </button>
              );
            }
          )}

        </nav>

        <div className="employee-sidebar-footer">
          <span>
            PROJECT ATLAS
          </span>

          <small>
            Employee workspace
          </small>
        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT

          This starts DIRECTLY after the 250px sidebar.
          No DashboardLayout.
      ===================================================== */}

      <main className="employee-main">

        {/* MOBILE HEADER */}

        <header className="employee-mobile-header">

          <button
            type="button"
            className="employee-menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          <strong>
            ATLAS
          </strong>

          <div className="employee-mobile-spacer" />

        </header>

        <div className="employee-page">

          {/* HEADER */}

          <header className="employee-header">

            <div>
              <span className="employee-eyebrow">
                EMPLOYEE PORTAL
              </span>

              <h1>
                Good morning,{" "}
                {employeeName}
              </h1>

              <p>
                Here’s your personal workspace
                for attendance, leave, payroll
                and company updates.
              </p>
            </div>

            <div className="employee-date">
              <span>
                Today
              </span>

              <strong>
                {formattedDate}
              </strong>
            </div>

          </header>

          {/* ERROR */}

          {error && (
            <div className="employee-inline-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {/* =================================================
              ATTENDANCE
          ================================================= */}

          <section className="employee-attendance-card">

            <div className="employee-attendance-info">

              <div
                className={`employee-card-icon ${
                  isCheckedIn
                    ? "attendance-active"
                    : ""
                }`}
              >
                {isCheckedIn
                  ? "✓"
                  : "○"}
              </div>

              <div>

                <span className="employee-card-label">
                  TODAY'S ATTENDANCE
                </span>

                <h2>
                  {!attendance
                    ? "Not Checked In"
                    : isCheckedOut
                    ? "Day Completed"
                    : "Checked In"}
                </h2>

                <p>
                  {!attendance
                    ? "Your working day has not started yet."
                    : isCheckedOut
                    ? `Checked in at ${attendance.check_in} and checked out at ${attendance.check_out}.`
                    : `Checked in at ${attendance.check_in}.`}
                </p>

              </div>

            </div>

            <div className="employee-attendance-actions">

              {!isCheckedIn && (
                <button
                  type="button"
                  className="employee-primary-button"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Checking in..."
                    : "Check In"}
                </button>
              )}

              {isCheckedIn &&
                !isCheckedOut && (
                  <button
                    type="button"
                    className="employee-primary-button"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? "Checking out..."
                      : "Check Out"}
                  </button>
                )}

              {isCheckedOut && (
                <span className="employee-completed-badge">
                  ✓ Completed
                </span>
              )}

            </div>

          </section>

          {/* =================================================
              KPI
          ================================================= */}

          <section className="employee-kpis">

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                WORKED TODAY
              </span>

              <strong>
                {calculateWorkedTime()}
              </strong>

              <small>
                Current working hours
              </small>
            </div>

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                THIS MONTH
              </span>

              <strong>
                {daysPresentThisMonth}
              </strong>

              <small>
                Days present
              </small>
            </div>

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                LEAVE BALANCE
              </span>

              <strong>
                {leaveBalance}
              </strong>

              <small>
                Available leave
              </small>
            </div>

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                LATEST PAYROLL
              </span>

              <strong>
                {getSalary(latestPayroll)}
              </strong>

              <small>
                {latestPayroll
                  ? getPayrollMonth(
                      latestPayroll
                    )
                  : "No payroll available"}
              </small>
            </div>

          </section>

          {/* =================================================
              DASHBOARD GRID
          ================================================= */}

          <section className="employee-dashboard-grid">

            {/* ATTENDANCE */}

            <div className="employee-panel">

              <div className="employee-panel-header">

                <div>
                  <span className="employee-section-label">
                    ATTENDANCE
                  </span>

                  <h2>
                    Today
                  </h2>
                </div>

                <button
                  type="button"
                  className="employee-link-button"
                  onClick={() =>
                    navigate(
                      "/employee/attendance"
                    )
                  }
                >
                  View Attendance
                </button>

              </div>

              <div className="employee-timeline">

                <div className="employee-timeline-item">

                  <div
                    className={`employee-timeline-dot ${
                      attendance?.check_in
                        ? ""
                        : "pending"
                    }`}
                  />

                  <div>
                    <strong>
                      Check In
                    </strong>

                    <span>
                      {attendance?.check_in
                        ? "Recorded"
                        : "Not recorded"}
                    </span>
                  </div>

                  <time>
                    {attendance?.check_in ||
                      "--:--"}
                  </time>

                </div>

                <div className="employee-timeline-line" />

                <div className="employee-timeline-item">

                  <div
                    className={`employee-timeline-dot ${
                      attendance?.check_out
                        ? ""
                        : "pending"
                    }`}
                  />

                  <div>
                    <strong>
                      Check Out
                    </strong>

                    <span>
                      {attendance?.check_out
                        ? "Recorded"
                        : "Not recorded"}
                    </span>
                  </div>

                  <time>
                    {attendance?.check_out ||
                      "--:--"}
                  </time>

                </div>

              </div>

            </div>

            {/* LEAVE */}

            <div className="employee-panel">

              <div className="employee-panel-header">

                <div>
                  <span className="employee-section-label">
                    LEAVE
                  </span>

                  <h2>
                    My Leave
                  </h2>
                </div>

                <button
                  type="button"
                  className="employee-link-button"
                  onClick={() =>
                    navigate(
                      "/employee/leave"
                    )
                  }
                >
                  View All
                </button>

              </div>

              <div className="employee-leave-summary">

                <div>
                  <span>
                    Available
                  </span>

                  <strong>
                    {leaveBalance}
                  </strong>
                </div>

                <div>
                  <span>
                    Used
                  </span>

                  <strong>
                    {usedLeaveDays}
                  </strong>
                </div>

                <div>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {pendingLeaves}
                  </strong>
                </div>

              </div>

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() =>
                  navigate(
                    "/employee/leave"
                  )
                }
              >
                Apply for Leave
              </button>

            </div>

            {/* PAYROLL */}

            <div className="employee-panel">

              <div className="employee-panel-header">

                <div>
                  <span className="employee-section-label">
                    PAYROLL
                  </span>

                  <h2>
                    Latest Payslip
                  </h2>
                </div>

                <button
                  type="button"
                  className="employee-link-button"
                  onClick={() =>
                    navigate(
                      "/employee/payslips"
                    )
                  }
                >
                  View Payroll
                </button>

              </div>

              <div className="employee-payslip">

                <div>
                  <span>
                    {latestPayroll
                      ? getPayrollMonth(
                          latestPayroll
                        )
                      : "Payroll"}
                  </span>

                  <strong>
                    {getSalary(
                      latestPayroll
                    )}
                  </strong>
                </div>

                <div className="employee-payslip-status">
                  {latestPayroll?.status ||
                    "—"}
                </div>

              </div>

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() =>
                  navigate(
                    "/employee/payslips"
                  )
                }
              >
                View Payslip
              </button>

            </div>

            {/* PROFILE */}

            <div className="employee-panel">

              <div className="employee-panel-header">

                <div>
                  <span className="employee-section-label">
                    MY PROFILE
                  </span>

                  <h2>
                    Employee Information
                  </h2>
                </div>

                <button
                  type="button"
                  className="employee-link-button"
                  onClick={() =>
                    navigate(
                      "/employee/profile"
                    )
                  }
                >
                  View
                </button>

              </div>

              <div className="employee-profile-info">

                <div className="employee-avatar">
                  {initials}
                </div>

                <div>

                  <strong>
                    {profile?.name ||
                      employeeName}
                  </strong>

                  <span>
                    Employee ID:{" "}
                    {profile?.id ??
                      user?.employee_id ??
                      "—"}
                  </span>

                  <span>
                    Department:{" "}
                    {profile?.department ||
                      "Not assigned"}
                  </span>

                  <span>
                    {profile?.email ||
                      user?.email ||
                      "—"}
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              QUICK ACCESS
          ================================================= */}

          <section className="employee-panel">

            <div className="employee-panel-header">

              <div>
                <span className="employee-section-label">
                  QUICK ACCESS
                </span>

                <h2>
                  Employee Services
                </h2>
              </div>

            </div>

            <div className="employee-quick-grid">

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() =>
                  navigate(
                    "/employee/attendance"
                  )
                }
              >
                Attendance
              </button>

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() =>
                  navigate(
                    "/employee/leave"
                  )
                }
              >
                Apply Leave
              </button>

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() =>
                  navigate(
                    "/employee/payslips"
                  )
                }
              >
                Payslips
              </button>

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() =>
                  navigate(
                    "/employee/profile"
                  )
                }
              >
                My Profile
              </button>

            </div>

          </section>

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <section className="employee-panel employee-activity-panel">

            <div className="employee-panel-header">

              <div>
                <span className="employee-section-label">
                  ACTIVITY
                </span>

                <h2>
                  Recent Activity
                </h2>
              </div>

            </div>

            <div className="employee-activity-list">

              {attendance?.check_out && (
                <div className="employee-activity-item">

                  <div className="employee-activity-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Attendance completed
                    </strong>

                    <span>
                      Your check-in and check-out
                      have been recorded.
                    </span>
                  </div>

                  <time>
                    Today
                  </time>

                </div>
              )}

              {attendance?.check_in &&
                !attendance?.check_out && (
                  <div className="employee-activity-item">

                    <div className="employee-activity-icon">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Attendance recorded
                      </strong>

                      <span>
                        You checked in at{" "}
                        {attendance.check_in}.
                      </span>
                    </div>

                    <time>
                      Today
                    </time>

                  </div>
                )}

              {!attendance && (
                <div className="employee-activity-item">

                  <div className="employee-activity-icon">
                    —
                  </div>

                  <div>
                    <strong>
                      No attendance recorded
                    </strong>

                    <span>
                      Your attendance has not been
                      recorded today.
                    </span>
                  </div>

                  <time>
                    Today
                  </time>

                </div>
              )}

              {pendingLeaves > 0 && (
                <div className="employee-activity-item">

                  <div className="employee-activity-icon">
                    !
                  </div>

                  <div>
                    <strong>
                      Leave request pending
                    </strong>

                    <span>
                      You have{" "}
                      {pendingLeaves} pending
                      leave request
                      {pendingLeaves > 1
                        ? "s"
                        : ""}.
                    </span>
                  </div>

                  <time>
                    Pending
                  </time>

                </div>
              )}

              {latestPayroll && (
                <div className="employee-activity-item">

                  <div className="employee-activity-icon">
                    ₹
                  </div>

                  <div>
                    <strong>
                      Latest payroll available
                    </strong>

                    <span>
                      {getPayrollMonth(
                        latestPayroll
                      )}{" "}
                      payroll is available.
                    </span>
                  </div>

                  <time>
                    {latestPayroll.status ||
                      "Available"}
                  </time>

                </div>
              )}

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}