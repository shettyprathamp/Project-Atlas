import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "./EmployeeDashboard.css";
/* =========================================================
   HELPERS
========================================================= */

const getArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const getObject = (value) => {
  if (!value) return {};

  if (value?.data && typeof value.data === "object") {
    return value.data;
  }

  return value;
};

const getName = (profile, user) =>
  profile?.name ||
  profile?.full_name ||
  profile?.employee_name ||
  user?.name ||
  user?.full_name ||
  user?.employee_name ||
  user?.email?.split("@")[0] ||
  "Employee";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "E";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const text = String(value).trim();

  /*
   * Handle plain SQL time values such as:
   * 15:30
   * 15:30:32
   * 15:30:32.1987
   *
   * This is important because new Date("15:30:32")
   * is not reliably parsed by browsers.
   */

  const timeMatch = text.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/
  );

  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = timeMatch[2];

    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${suffix}`;
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return text;
};

const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "₹0";
  }

  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const getAttendanceDate = (record) =>
  record?.date ||
  record?.attendance_date ||
  record?.work_date ||
  record?.created_at ||
  record?.check_in;

const getAttendanceCheckIn = (record) =>
  record?.check_in ||
  record?.check_in_time ||
  record?.clock_in ||
  record?.start_time;

const getAttendanceCheckOut = (record) =>
  record?.check_out ||
  record?.check_out_time ||
  record?.clock_out ||
  record?.end_time;

const getAttendanceStatus = (record) =>
  record?.status ||
  (getAttendanceCheckIn(record) ? "Present" : "Absent");

const getLeaveStatus = (leave) =>
  leave?.status ||
  leave?.leave_status ||
  leave?.approval_status ||
  "Pending";

const getLeaveDays = (leave) => {
  const direct =
    leave?.days ??
    leave?.total_days ??
    leave?.number_of_days;

  if (direct !== undefined && direct !== null) {
    return Number(direct) || 0;
  }

  if (leave?.start_date && leave?.end_date) {
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime())
    ) {
      return (
        Math.floor(
          (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      );
    }
  }

  return 0;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

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

  /* =======================================================
     DATA
  ======================================================= */

  const [profile, setProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] =
    useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        profileResponse,
        todayResponse,
        attendanceResponse,
        leaveResponse,
        payrollResponse,
      ] = await Promise.allSettled([
        api.get("/employee/profile"),
        api.get("/employee/attendance/today"),
        api.get("/employee/attendance"),
        api.get("/employee/leave"),
        api.get("/employee/payroll"),
      ]);

      let successfulRequests = 0;

      if (profileResponse.status === "fulfilled") {
        setProfile(
          getObject(profileResponse.value?.data)
        );

        successfulRequests += 1;
      }

      if (todayResponse.status === "fulfilled") {
        const todayData = getObject(
          todayResponse.value?.data
        );

        setTodayAttendance(
          todayData?.attendance ||
            todayData?.record ||
            todayData ||
            null
        );

        successfulRequests += 1;
      }

      if (attendanceResponse.status === "fulfilled") {
        setAttendanceHistory(
          getArray(attendanceResponse.value?.data)
        );

        successfulRequests += 1;
      }

      if (leaveResponse.status === "fulfilled") {
        setLeaveRecords(
          getArray(leaveResponse.value?.data)
        );

        successfulRequests += 1;
      }

      if (payrollResponse.status === "fulfilled") {
        setPayrollRecords(
          getArray(payrollResponse.value?.data)
        );

        successfulRequests += 1;
      }

      if (successfulRequests === 0) {
        throw new Error(
          "Unable to load employee dashboard."
        );
      }
    } catch (err) {
      console.error(
        "Employee dashboard error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     TODAY ATTENDANCE
  ======================================================= */

  const todayCheckIn = useMemo(
    () => getAttendanceCheckIn(todayAttendance),
    [todayAttendance]
  );

  const todayCheckOut = useMemo(
    () => getAttendanceCheckOut(todayAttendance),
    [todayAttendance]
  );

  const attendanceCompleted = Boolean(
    todayCheckIn && todayCheckOut
  );

  const canCheckIn = !todayCheckIn;

  const canCheckOut =
    Boolean(todayCheckIn) && !todayCheckOut;

  /* =======================================================
     CHECK IN
  ======================================================= */

  const handleCheckIn = async () => {
    if (!canCheckIn || attendanceLoading) {
      return;
    }

    setAttendanceLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/employee/attendance/check-in"
      );

      const data = getObject(response?.data);

      setTodayAttendance(
        data?.attendance ||
          data?.record ||
          data
      );

      await loadDashboard();
    } catch (err) {
      console.error("Check-in error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to check in."
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  /* =======================================================
     CHECK OUT
  ======================================================= */

  const handleCheckOut = async () => {
    if (!canCheckOut || attendanceLoading) {
      return;
    }

    setAttendanceLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/employee/attendance/check-out"
      );

      const data = getObject(response?.data);

      setTodayAttendance(
        data?.attendance ||
          data?.record ||
          data
      );

      await loadDashboard();
    } catch (err) {
      console.error("Check-out error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to check out."
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("atlas_token");
    localStorage.removeItem("token");
    localStorage.removeItem("atlas_user");

    navigate("/login", {
      replace: true,
    });
  };

  /* =======================================================
     EMPLOYEE INFORMATION
  ======================================================= */

  const employeeName = getName(
    profile,
    user
  );

  const initials = getInitials(
    employeeName
  );

  const employeeEmail =
    profile?.email ||
    user?.email ||
    "Employee";

  const employeeRole =
    profile?.designation ||
    profile?.role ||
    profile?.job_title ||
    user?.role ||
    "Employee";

  /* =======================================================
     ATTENDANCE KPI
  ======================================================= */

  const presentDays = useMemo(() => {
    return attendanceHistory.filter((record) => {
      const status = String(
        getAttendanceStatus(record)
      ).toLowerCase();

      return (
        status === "present" ||
        status === "late" ||
        status === "half day" ||
        status === "half_day"
      );
    }).length;
  }, [attendanceHistory]);

  const currentMonthAttendance = useMemo(() => {
    const now = new Date();

    const currentMonth =
      now.getMonth();

    const currentYear =
      now.getFullYear();

    return attendanceHistory.filter(
      (record) => {
        const dateValue =
          getAttendanceDate(record);

        if (!dateValue) {
          return false;
        }

        const date =
          new Date(dateValue);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return false;
        }

        return (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );
      }
    );
  }, [attendanceHistory]);

  const currentMonthPresent =
    useMemo(() => {
      return currentMonthAttendance.filter(
        (record) => {
          const status = String(
            getAttendanceStatus(record)
          ).toLowerCase();

          return (
            status === "present" ||
            status === "late" ||
            status === "half day" ||
            status === "half_day"
          );
        }
      ).length;
    }, [currentMonthAttendance]);

  /* =======================================================
     LEAVE KPI
  ======================================================= */

  const approvedLeaves = useMemo(
    () =>
      leaveRecords.filter(
        (leave) =>
          String(
            getLeaveStatus(leave)
          ).toLowerCase() ===
          "approved"
      ),
    [leaveRecords]
  );

  const pendingLeaves = useMemo(
    () =>
      leaveRecords.filter(
        (leave) =>
          String(
            getLeaveStatus(leave)
          ).toLowerCase() ===
          "pending"
      ),
    [leaveRecords]
  );

  const totalLeaveDays = useMemo(
    () =>
      approvedLeaves.reduce(
        (total, leave) =>
          total +
          getLeaveDays(leave),
        0
      ),
    [approvedLeaves]
  );

  /* =======================================================
     PAYROLL
  ======================================================= */

  const latestPayroll =
    payrollRecords.length
      ? payrollRecords[0]
      : null;

  const latestSalary =
    latestPayroll?.net_salary ??
    latestPayroll?.net_pay ??
    latestPayroll?.salary ??
    latestPayroll?.amount ??
    latestPayroll?.total_salary ??
    0;

  /* =======================================================
     RECENT ATTENDANCE
  ======================================================= */

  const recentAttendance =
    useMemo(() => {
      return [...attendanceHistory]
        .sort((a, b) => {
          const dateA = new Date(
            getAttendanceDate(a) || 0
          ).getTime();

          const dateB = new Date(
            getAttendanceDate(b) || 0
          ).getTime();

          return dateB - dateA;
        })
        .slice(0, 5);
    }, [attendanceHistory]);

  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  const activities = useMemo(() => {
    const items = [];

    if (todayCheckIn) {
      items.push({
        icon: "✓",
        title: "Checked in",
        description: `Attendance marked at ${formatTime(
          todayCheckIn
        )}`,
        time: todayCheckIn,
        sortTime:
          new Date(
            todayCheckIn
          ).getTime() || 0,
      });
    }

    if (todayCheckOut) {
      items.push({
        icon: "↪",
        title: "Checked out",
        description: `Attendance completed at ${formatTime(
          todayCheckOut
        )}`,
        time: todayCheckOut,
        sortTime:
          new Date(
            todayCheckOut
          ).getTime() || 0,
      });
    }

    pendingLeaves
      .slice(0, 2)
      .forEach((leave) => {
        items.push({
          icon: "▣",
          title: "Leave request",
          description: `${getLeaveDays(
            leave
          )} day${
            getLeaveDays(leave) === 1
              ? ""
              : "s"
          } — ${getLeaveStatus(
            leave
          )}`,
          time:
            leave?.created_at ||
            leave?.applied_on ||
            leave?.start_date,
          sortTime: new Date(
            leave?.created_at ||
              leave?.applied_on ||
              leave?.start_date ||
              0
          ).getTime(),
        });
      });

    if (latestPayroll) {
      items.push({
        icon: "₹",
        title: "Latest payslip",
        description: `Net pay ${formatCurrency(
          latestSalary
        )}`,
        time:
          latestPayroll?.pay_date ||
          latestPayroll?.payment_date ||
          latestPayroll?.created_at,
        sortTime: new Date(
          latestPayroll?.pay_date ||
            latestPayroll?.payment_date ||
            latestPayroll?.created_at ||
            0
        ).getTime(),
      });
    }

    return items
      .sort(
        (a, b) =>
          b.sortTime - a.sortTime
      )
      .slice(0, 5);
  }, [
    todayCheckIn,
    todayCheckOut,
    pendingLeaves,
    latestPayroll,
    latestSalary,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="employee-loading-screen">
        <div className="employee-loading-spinner" />

        <h2>
          Loading Dashboard
        </h2>

        <p>
          Please wait while your
          employee information is
          loaded.
        </p>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div className="employee-dashboard-root">

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <div
          className="employee-dashboard-sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`employee-dashboard-sidebar ${
          sidebarOpen
            ? "employee-dashboard-sidebar-open"
            : ""
        }`}
      >

        {/* ===============================================
            BRAND
        =============================================== */}

        <div className="employee-dashboard-sidebar-brand">
          <div className="employee-dashboard-brand-mark">
            A
          </div>

          <div>
            <strong>
              ATLAS
            </strong>

            <span>
              Employee Portal
            </span>
          </div>
        </div>

        {/* ===============================================
            NAVIGATION
        =============================================== */}

        <nav className="employee-dashboard-navigation">

          <div className="employee-dashboard-navigation-title">
            WORKSPACE
          </div>

          {employeeNavigation.map(
            (item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path ===
                  "/employee"
                }
                onClick={
                  closeSidebar
                }
                className={({
                  isActive,
                }) =>
                  `employee-dashboard-nav-item ${
                    isActive
                      ? "employee-dashboard-nav-active"
                      : ""
                  }`
                }
              >
                <span className="employee-dashboard-nav-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

                <span className="employee-dashboard-nav-chevron">
                  ›
                </span>
              </NavLink>
            )
          )}

        </nav>

        {/* ===============================================
            ACCOUNT
        =============================================== */}

        <div className="employee-dashboard-sidebar-footer">

          <div className="employee-dashboard-navigation-title">
            ACCOUNT
          </div>

          <button
            type="button"
            className="employee-dashboard-nav-item"
            onClick={() => {
              closeSidebar();
              navigate(
                "/employee/settings"
              );
            }}
          >
            <span className="employee-dashboard-nav-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>

            <span className="employee-dashboard-nav-chevron">
              ›
            </span>
          </button>

          <button
            type="button"
            className="employee-dashboard-nav-item employee-dashboard-logout"
            onClick={
              handleLogout
            }
          >
            <span className="employee-dashboard-nav-icon">
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

          {/* =============================================
              USER
          ============================================= */}

          <div className="employee-dashboard-sidebar-user">

            <div className="employee-dashboard-sidebar-avatar">
              {initials}
            </div>

            <div>
              <strong
                title={employeeName}
              >
                {employeeName}
              </strong>

              <span>
                Employee
              </span>
            </div>

          </div>

        </div>

      </aside>

      {/* =================================================
          MOBILE HEADER
      ================================================= */}

      <header className="employee-dashboard-mobile-header">

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open employee menu"
        >
          ☰
        </button>

        <strong>
          ATLAS
        </strong>

        <div />
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="employee-main">

        <div className="employee-page">

          {/* ===============================================
              HEADER
          =============================================== */}

          <header className="employee-header">

            <div>
              <span className="employee-eyebrow">
                EMPLOYEE PORTAL
              </span>

              <h1>
                Welcome back,{" "}
                {
                  employeeName.split(
                    " "
                  )[0]
                }
              </h1>

              <p>
                Here's your work
                overview for today.
              </p>
            </div>

            <div className="employee-date">

              <span>
                Today
              </span>

              <strong>
                {new Date().toLocaleDateString(
                  "en-IN",
                  {
                    weekday:
                      "long",
                    day: "2-digit",
                    month:
                      "long",
                    year:
                      "numeric",
                  }
                )}
              </strong>

            </div>

          </header>

          {/* ===============================================
              ERROR
          =============================================== */}

          {error && (
            <div className="employee-inline-error">

              <span>
                !
              </span>

              <p>
                {error}
              </p>

            </div>
          )}

          {/* ===============================================
              ATTENDANCE
          =============================================== */}

          <section className="employee-attendance-card">

            <div className="employee-attendance-info">

              <div
                className={`employee-card-icon ${
                  todayCheckIn
                    ? "attendance-active"
                    : ""
                }`}
              >
                ◷
              </div>

              <div>

                <span className="employee-card-label">
                  TODAY'S ATTENDANCE
                </span>

                <h2>
                  {attendanceCompleted
                    ? "Attendance completed"
                    : todayCheckIn
                    ? "You're currently working"
                    : "You haven't checked in yet"}
                </h2>

                <p>
                  {todayCheckIn
                    ? `Check-in: ${formatTime(
                        todayCheckIn
                      )}${
                        todayCheckOut
                          ? ` • Check-out: ${formatTime(
                              todayCheckOut
                            )}`
                          : ""
                      }`
                    : "Mark your attendance when you start your workday."}
                </p>

              </div>

            </div>

            <div className="employee-attendance-actions">

              {attendanceCompleted ? (
                <div className="employee-completed-badge">
                  ✓ Day Completed
                </div>
              ) : canCheckIn ? (
                <button
                  type="button"
                  className="employee-primary-button"
                  onClick={
                    handleCheckIn
                  }
                  disabled={
                    attendanceLoading
                  }
                >
                  {attendanceLoading
                    ? "Checking in..."
                    : "Check In"}
                </button>
              ) : (
                <button
                  type="button"
                  className="employee-primary-button"
                  onClick={
                    handleCheckOut
                  }
                  disabled={
                    attendanceLoading
                  }
                >
                  {attendanceLoading
                    ? "Checking out..."
                    : "Check Out"}
                </button>
              )}

            </div>

          </section>

          {/* ===============================================
              KPI
          =============================================== */}

          <section className="employee-kpis">

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                PRESENT DAYS
              </span>

              <strong>
                {currentMonthPresent}
              </strong>

              <small>
                This month
              </small>
            </div>

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                ATTENDANCE RECORDS
              </span>

              <strong>
                {presentDays}
              </strong>

              <small>
                Total recorded
              </small>
            </div>

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                LEAVE DAYS
              </span>

              <strong>
                {totalLeaveDays}
              </strong>

              <small>
                Approved leave
              </small>
            </div>

            <div className="employee-kpi-card">
              <span className="employee-kpi-label">
                LATEST PAY
              </span>

              <strong>
                {formatCurrency(
                  latestSalary
                )}
              </strong>

              <small>
                Latest payroll
              </small>
            </div>

          </section>

          {/* ===============================================
              MAIN GRID
          =============================================== */}

          <section className="employee-dashboard-grid">

            {/* =============================================
                ATTENDANCE
            ============================================= */}

            <div className="employee-panel">

              <div className="employee-panel-header">

                <div>
                  <span className="employee-section-label">
                    ATTENDANCE
                  </span>

                  <h2>
                    Recent Attendance
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
                  View all →
                </button>

              </div>

              <div className="employee-timeline">

                {recentAttendance.length ===
                0 ? (
                  <p
                    style={{
                      margin: 0,
                      color:
                        "#68738a",
                      fontSize:
                        "12px",
                    }}
                  >
                    No attendance
                    records
                    available.
                  </p>
                ) : (
                  recentAttendance.map(
                    (
                      record,
                      index
                    ) => {

                      const date =
                        getAttendanceDate(
                          record
                        );

                      const checkIn =
                        getAttendanceCheckIn(
                          record
                        );

                      const checkOut =
                        getAttendanceCheckOut(
                          record
                        );

                      const status =
                        getAttendanceStatus(
                          record
                        );

                      const isPresent =
                        String(
                          status
                        ).toLowerCase() !==
                        "absent";

                      return (
                        <div
                          key={
                            record?.id ||
                            record?.attendance_id ||
                            `${date}-${index}`
                          }
                        >

                          <div className="employee-timeline-item">

                            <span
                              className={`employee-timeline-dot ${
                                isPresent
                                  ? ""
                                  : "pending"
                              }`}
                            />

                            <div>

                              <strong>
                                {formatDate(
                                  date
                                )}
                              </strong>

                              <span>
                                {status}
                              </span>

                            </div>

                            <time>
                              {checkIn
                                ? formatTime(
                                    checkIn
                                  )
                                : "—"}

                              {checkOut
                                ? ` — ${formatTime(
                                    checkOut
                                  )}`
                                : ""}
                            </time>

                          </div>

                          {index <
                            recentAttendance.length -
                              1 && (
                            <div className="employee-timeline-line" />
                          )}

                        </div>
                      );
                    }
                  )
                )}

              </div>

            </div>

            {/* =============================================
                LEAVE
            ============================================= */}

            <div className="employee-panel">

              <div className="employee-panel-header">

                <div>
                  <span className="employee-section-label">
                    LEAVE
                  </span>

                  <h2>
                    Leave Overview
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
                  View all →
                </button>

              </div>

              <div className="employee-leave-summary">

                <div>
                  <span>
                    Requests
                  </span>

                  <strong>
                    {
                      leaveRecords.length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Approved
                  </span>

                  <strong>
                    {
                      approvedLeaves.length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {
                      pendingLeaves.length
                    }
                  </strong>
                </div>

              </div>

              {pendingLeaves.length >
              0 ? (
                <div
                  style={{
                    marginBottom:
                      "16px",
                    color:
                      "#8b95aa",
                    fontSize:
                      "12px",
                    lineHeight:
                      1.6,
                  }}
                >
                  You have{" "}
                  <strong
                    style={{
                      color:
                        "#ffffff",
                    }}
                  >
                    {
                      pendingLeaves.length
                    }
                  </strong>{" "}
                  pending leave
                  request
                  {pendingLeaves.length ===
                  1
                    ? ""
                    : "s"}.
                </div>
              ) : (
                <div
                  style={{
                    marginBottom:
                      "16px",
                    color:
                      "#68738a",
                    fontSize:
                      "12px",
                  }}
                >
                  No pending leave
                  requests.
                </div>
              )}

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() =>
                  navigate(
                    "/employee/leave"
                  )
                }
              >
                Manage Leave
              </button>

            </div>

            {/* =============================================
                PAYROLL
            ============================================= */}

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
                  View all →
                </button>

              </div>

              {latestPayroll ? (
                <>
                  <div className="employee-payslip">

                    <div>
                      <span>
                        Net Pay
                      </span>

                      <strong>
                        {formatCurrency(
                          latestSalary
                        )}
                      </strong>
                    </div>

                    <div className="employee-payslip-status">
                      {latestPayroll?.status ||
                        latestPayroll?.payment_status ||
                        "Processed"}
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
                    View Payslips
                  </button>
                </>
              ) : (
                <div>

                  <p
                    style={{
                      margin:
                        "0 0 16px",
                      color:
                        "#68738a",
                      fontSize:
                        "12px",
                    }}
                  >
                    No payroll
                    records are
                    available yet.
                  </p>

                  <button
                    type="button"
                    className="employee-secondary-button"
                    onClick={() =>
                      navigate(
                        "/employee/payslips"
                      )
                    }
                  >
                    Open Payslips
                  </button>

                </div>
              )}

            </div>

            {/* =============================================
                PROFILE
            ============================================= */}

            <div className="employee-panel">

              <div className="employee-panel-header">

                <div>
                  <span className="employee-section-label">
                    PROFILE
                  </span>

                  <h2>
                    My Profile
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
                  Edit →
                </button>

              </div>

              <div className="employee-profile-info">

                <div className="employee-avatar">
                  {initials}
                </div>

                <div>

                  <strong>
                    {employeeName}
                  </strong>

                  <span>
                    {employeeRole}
                  </span>

                  <span>
                    {employeeEmail}
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* ===============================================
              QUICK ACCESS
          =============================================== */}

          <section className="employee-panel">

            <div className="employee-panel-header">

              <div>
                <span className="employee-section-label">
                  WORKSPACE
                </span>

                <h2>
                  Quick Access
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
                ◷ &nbsp; Attendance
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
                ▣ &nbsp; Leave
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
                ₹ &nbsp; Payslips
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
                ● &nbsp; My Profile
              </button>

            </div>

          </section>

          {/* ===============================================
              RECENT ACTIVITY
          =============================================== */}

          <section
            className="employee-panel employee-activity-panel"
            style={{
              marginTop: "18px",
            }}
          >

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

              {activities.length ===
              0 ? (
                <p
                  style={{
                    margin: 0,
                    color:
                      "#68738a",
                    fontSize:
                      "12px",
                  }}
                >
                  No recent
                  activity.
                </p>
              ) : (
                activities.map(
                  (
                    activity,
                    index
                  ) => (
                    <div
                      className="employee-activity-item"
                      key={`${activity.title}-${index}`}
                    >

                      <div className="employee-activity-icon">
                        {
                          activity.icon
                        }
                      </div>

                      <div>

                        <strong>
                          {
                            activity.title
                          }
                        </strong>

                        <span>
                          {
                            activity.description
                          }
                        </span>

                      </div>

                      <time>
                        {activity.time
                          ? formatTime(
                              activity.time
                            )
                          : "—"}
                      </time>

                    </div>
                  )
                )
              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}