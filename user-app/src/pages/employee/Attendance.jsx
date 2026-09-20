import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";
import "./Attendance.css";

export default function Attendance() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     SIDEBAR NAVIGATION
  ========================================================= */

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

  /* =========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================= */

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("atlas_user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("atlas_user");

    setSidebarOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================================================
     LOAD ATTENDANCE
  ========================================================= */

  const loadAttendance = useCallback(async () => {
    try {
      setError("");

      const results = await Promise.allSettled([
        api.get("/employee/attendance/today"),
        api.get("/employee/attendance"),
      ]);

      const todayResult = results[0];
      const historyResult = results[1];

      if (todayResult.status === "fulfilled") {
        setTodayAttendance(todayResult.value.data);
      } else {
        setTodayAttendance(null);
      }

      if (historyResult.status === "fulfilled") {
        const data = historyResult.value.data;

        if (Array.isArray(data)) {
          setAttendanceHistory(data);
        } else if (Array.isArray(data?.items)) {
          setAttendanceHistory(data.items);
        } else if (Array.isArray(data?.data)) {
          setAttendanceHistory(data.data);
        } else {
          setAttendanceHistory([]);
        }
      } else {
        setAttendanceHistory([]);
      }

      const successfulRequest = results.some(
        (result) => result.status === "fulfilled"
      );

      if (!successfulRequest) {
        throw new Error("Unable to load attendance.");
      }
    } catch (err) {
      console.error(
        "Attendance loading error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to load attendance information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /* =========================================================
     DATE
  ========================================================= */

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  /* =========================================================
     ATTENDANCE VALUES
  ========================================================= */

  const checkInTime =
    todayAttendance?.check_in ??
    todayAttendance?.checkIn ??
    todayAttendance?.check_in_time ??
    todayAttendance?.checkInTime ??
    null;

  const checkOutTime =
    todayAttendance?.check_out ??
    todayAttendance?.checkOut ??
    todayAttendance?.check_out_time ??
    todayAttendance?.checkOutTime ??
    null;

  const attendanceStatus =
    todayAttendance?.status ||
    (checkOutTime
      ? "Completed"
      : checkInTime
      ? "Working"
      : "Not Started");

  const isCheckedIn =
    Boolean(checkInTime) && !checkOutTime;

  const isCompleted =
    Boolean(checkInTime) && Boolean(checkOutTime);

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatTime = (value) => {
    if (!value) {
      return "--:--";
    }

    const raw = String(value).trim();

    /*
     * Backend time formats:
     * HH:mm:ss
     * HH:mm:ss.SSSS
     * HH:mm
     */

    const match = raw.match(
      /^(\d{1,2}):(\d{2}):(\d{2})(?:\.\d+)?$/
    );

    if (match) {
      let hours = Number(match[1]);
      const minutes = match[2];

      const period =
        hours >= 12 ? "PM" : "AM";

      hours = hours % 12;

      if (hours === 0) {
        hours = 12;
      }

      return `${hours}:${minutes} ${period}`;
    }

    const shortMatch = raw.match(
      /^(\d{1,2}):(\d{2})$/
    );

    if (shortMatch) {
      let hours = Number(shortMatch[1]);
      const minutes = shortMatch[2];

      const period =
        hours >= 12 ? "PM" : "AM";

      hours = hours % 12;

      if (hours === 0) {
        hours = 12;
      }

      return `${hours}:${minutes} ${period}`;
    }

    const date = new Date(raw);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return raw;
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(value);
    }
  };

  /* =========================================================
     WORKED TIME
  ========================================================= */

  const calculateWorkedTime = (
    checkIn,
    checkOut
  ) => {
    if (!checkIn) {
      return "Not started";
    }

    if (!checkOut) {
      return "In progress";
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "Completed";
    }

    const difference = Math.max(
      0,
      end.getTime() - start.getTime()
    );

    const totalMinutes = Math.floor(
      difference / 60000
    );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes =
      totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  /* =========================================================
     TODAY WORKED TIME
  ========================================================= */

  const workedToday = useMemo(() => {
    return calculateWorkedTime(
      checkInTime,
      checkOutTime
    );
  }, [checkInTime, checkOutTime]);

  /* =========================================================
     MONTHLY SUMMARY
  ========================================================= */

  const monthlySummary = useMemo(() => {
    const now = new Date();

    const month = now.getMonth();
    const year = now.getFullYear();

    let present = 0;
    let late = 0;
    let absent = 0;

    attendanceHistory.forEach((item) => {
      const dateValue =
        item?.date ||
        item?.attendance_date ||
        item?.attendanceDate ||
        item?.created_at;

      if (!dateValue) {
        return;
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      if (
        date.getMonth() !== month ||
        date.getFullYear() !== year
      ) {
        return;
      }

      const status = String(
        item?.status || ""
      ).toLowerCase();

      if (status === "late") {
        present += 1;
        late += 1;
        return;
      }

      if (
        status === "present" ||
        status === "checked_in" ||
        status === "completed" ||
        item?.check_in ||
        item?.checkIn
      ) {
        present += 1;
        return;
      }

      if (status === "absent") {
        absent += 1;
      }
    });

    return {
      present,
      late,
      absent,
    };
  }, [attendanceHistory]);

  /* =========================================================
     SORT HISTORY
  ========================================================= */

  const sortedHistory = useMemo(() => {
    return [...attendanceHistory].sort(
      (a, b) => {
        const dateA = new Date(
          a?.date ||
            a?.attendance_date ||
            a?.attendanceDate ||
            a?.created_at ||
            0
        );

        const dateB = new Date(
          b?.date ||
            b?.attendance_date ||
            b?.attendanceDate ||
            b?.created_at ||
            0
        );

        return (
          dateB.getTime() -
          dateA.getTime()
        );
      }
    );
  }, [attendanceHistory]);

  /* =========================================================
     CHECK IN
  ========================================================= */

  const handleCheckIn = async () => {
    if (actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.post(
        "/employee/attendance/check-in"
      );

      await loadAttendance();
    } catch (err) {
      console.error(
        "Check-in error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to check in. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     CHECK OUT
  ========================================================= */

  const handleCheckOut = async () => {
    if (actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.post(
        "/employee/attendance/check-out"
      );

      await loadAttendance();
    } catch (err) {
      console.error(
        "Check-out error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to check out. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="atlas-attendance-root">

        <AttendanceSidebar
          navigation={employeeNavigation}
          sidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
          handleLogout={handleLogout}
        />

        <main className="atlas-attendance-main">

          <div className="atlas-attendance-page">

            <div className="atlas-attendance-loading">

              <div className="atlas-attendance-spinner" />

              <h2>
                Loading attendance
              </h2>

              <p>
                Please wait while we load your attendance.
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="atlas-attendance-root">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <AttendanceSidebar
        navigation={employeeNavigation}
        sidebarOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        handleLogout={handleLogout}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="atlas-attendance-main">

        {/* MOBILE HEADER */}

        <div className="atlas-attendance-mobile-header">

          <button
            type="button"
            className="atlas-attendance-menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="atlas-attendance-mobile-brand">
            <div className="atlas-attendance-mobile-brand-mark">
              A
            </div>

            <span>
              ATLAS
            </span>
          </div>

        </div>

        <div className="atlas-attendance-page">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <header className="atlas-attendance-header">

            <div>

              <div className="atlas-attendance-eyebrow">
                EMPLOYEE PORTAL
              </div>

              <h1>
                Attendance
              </h1>

              <p>
                Track your working hours and attendance history.
              </p>

            </div>

            <div className="atlas-attendance-date">

              <span>
                TODAY
              </span>

              <strong>
                {today}
              </strong>

            </div>

          </header>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="atlas-attendance-error">

              <div className="atlas-attendance-error-icon">
                !
              </div>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =====================================================
              TODAY ATTENDANCE
          ===================================================== */}

          <section className="atlas-attendance-today-card">

            <div className="atlas-attendance-today-info">

              <div
                className={`atlas-attendance-status-icon ${
                  isCheckedIn
                    ? "is-working"
                    : isCompleted
                    ? "is-completed"
                    : ""
                }`}
              >
                ◷
              </div>

              <div>

                <div className="atlas-attendance-card-label">
                  TODAY'S ATTENDANCE
                </div>

                <h2>
                  {isCompleted
                    ? "Attendance completed"
                    : isCheckedIn
                    ? "You're currently working"
                    : "Ready to start your day?"}
                </h2>

                <p>
                  {isCompleted
                    ? `Worked ${workedToday} today.`
                    : isCheckedIn
                    ? `Checked in at ${formatTime(
                        checkInTime
                      )}.`
                    : "Check in when you begin work."}
                </p>

              </div>

            </div>

            <div className="atlas-attendance-actions">

              {!checkInTime && (
                <button
                  type="button"
                  className="atlas-attendance-primary-button"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Checking in..."
                    : "Check In"}
                </button>
              )}

              {isCheckedIn && (
                <button
                  type="button"
                  className="atlas-attendance-primary-button"
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Checking out..."
                    : "Check Out"}
                </button>
              )}

              {isCompleted && (
                <div className="atlas-attendance-completed">
                  ✓ Day completed
                </div>
              )}

            </div>

          </section>

          {/* =====================================================
              TODAY SUMMARY
          ===================================================== */}

          <section className="atlas-attendance-summary-grid">

            <SummaryCard
              label="CHECK IN"
              value={formatTime(checkInTime)}
              detail="Today's start time"
            />

            <SummaryCard
              label="CHECK OUT"
              value={formatTime(checkOutTime)}
              detail="Today's end time"
            />

            <SummaryCard
              label="WORKED TODAY"
              value={workedToday}
              detail="Total working time"
            />

            <SummaryCard
              label="STATUS"
              value={String(
                attendanceStatus
              )}
              detail="Current attendance"
            />

          </section>

          {/* =====================================================
              MONTHLY SUMMARY
          ===================================================== */}

          <section className="atlas-attendance-panel">

            <div className="atlas-attendance-panel-heading">

              <div>

                <span>
                  THIS MONTH
                </span>

                <h2>
                  Attendance Summary
                </h2>

              </div>

            </div>

            <div className="atlas-attendance-month-grid">

              <SummaryCard
                label="PRESENT"
                value={monthlySummary.present}
                detail="Days present"
              />

              <SummaryCard
                label="LATE"
                value={monthlySummary.late}
                detail="Late arrivals"
              />

              <SummaryCard
                label="ABSENT"
                value={monthlySummary.absent}
                detail="Absent days"
              />

            </div>

          </section>

          {/* =====================================================
              HISTORY
          ===================================================== */}

          <section className="atlas-attendance-panel">

            <div className="atlas-attendance-panel-heading">

              <div>

                <span>
                  HISTORY
                </span>

                <h2>
                  Attendance Records
                </h2>

              </div>

              <button
                type="button"
                className="atlas-attendance-refresh"
                onClick={loadAttendance}
                disabled={
                  loading ||
                  actionLoading
                }
              >
                ↻ Refresh
              </button>

            </div>

            {sortedHistory.length === 0 ? (

              <div className="atlas-attendance-empty">

                <div className="atlas-attendance-empty-icon">
                  ◷
                </div>

                <strong>
                  No attendance records
                </strong>

                <span>
                  Your attendance history will appear here.
                </span>

              </div>

            ) : (

              <div className="atlas-attendance-table-wrapper">

                <table className="atlas-attendance-table">

                  <thead>

                    <tr>
                      <th>
                        DATE
                      </th>

                      <th>
                        CHECK IN
                      </th>

                      <th>
                        CHECK OUT
                      </th>

                      <th>
                        WORKED
                      </th>

                      <th>
                        STATUS
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {sortedHistory.map(
                      (item, index) => {

                        const itemDate =
                          item?.date ||
                          item?.attendance_date ||
                          item?.attendanceDate ||
                          item?.created_at;

                        const itemCheckIn =
                          item?.check_in ||
                          item?.checkIn ||
                          item?.check_in_time ||
                          item?.checkInTime ||
                          null;

                        const itemCheckOut =
                          item?.check_out ||
                          item?.checkOut ||
                          item?.check_out_time ||
                          item?.checkOutTime ||
                          null;

                        const itemStatus =
                          item?.status ||
                          (itemCheckOut
                            ? "Completed"
                            : itemCheckIn
                            ? "Present"
                            : "Absent");

                        const normalizedStatus =
                          String(
                            itemStatus
                          ).toLowerCase();

                        return (
                          <tr
                            key={
                              item?.id ??
                              `${itemDate}-${index}`
                            }
                          >

                            <td>
                              <strong>
                                {formatDate(
                                  itemDate
                                )}
                              </strong>
                            </td>

                            <td>
                              {formatTime(
                                itemCheckIn
                              )}
                            </td>

                            <td>
                              {formatTime(
                                itemCheckOut
                              )}
                            </td>

                            <td>
                              {calculateWorkedTime(
                                itemCheckIn,
                                itemCheckOut
                              )}
                            </td>

                            <td>

                              <span
                                className={`atlas-attendance-status-badge ${
                                  normalizedStatus ===
                                  "absent"
                                    ? "status-absent"
                                    : normalizedStatus ===
                                      "late"
                                    ? "status-late"
                                    : "status-present"
                                }`}
                              >
                                {String(
                                  itemStatus
                                )}
                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   ATTENDANCE SIDEBAR
========================================================= */

function AttendanceSidebar({
  navigation,
  sidebarOpen,
  closeSidebar,
  handleLogout,
}) {
  return (
    <>
      <aside
        className={`atlas-attendance-sidebar ${
          sidebarOpen
            ? "atlas-attendance-sidebar-open"
            : ""
        }`}
      >

        {/* BRAND */}

        <div className="atlas-attendance-sidebar-brand">

          <div className="atlas-attendance-brand-mark">
            A
          </div>

          <div className="atlas-attendance-brand-text">

            <strong>
              ATLAS
            </strong>

            <span>
              EMPLOYEE PORTAL
            </span>

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="atlas-attendance-navigation">

          <div className="atlas-attendance-navigation-title">
            WORKSPACE
          </div>

          <nav>

            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/employee"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `atlas-attendance-nav-item ${
                    isActive
                      ? "atlas-attendance-nav-active"
                      : ""
                  }`
                }
              >

                <span className="atlas-attendance-nav-icon">
                  {item.icon}
                </span>

                <span className="atlas-attendance-nav-label">
                  {item.label}
                </span>

                <span className="atlas-attendance-nav-chevron">
                  ›
                </span>

              </NavLink>
            ))}

          </nav>

        </div>

        {/* FOOTER */}

        <div className="atlas-attendance-sidebar-footer">

          <div className="atlas-attendance-sidebar-user">

            <div className="atlas-attendance-sidebar-avatar">
              E
            </div>

            <div className="atlas-attendance-sidebar-user-info">

              <strong>
                Employee
              </strong>

              <span>
                Employee Portal
              </span>

            </div>

          </div>

          <button
            type="button"
            className="atlas-attendance-logout"
            onClick={handleLogout}
          >

            <span className="atlas-attendance-logout-icon">
              ↪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="atlas-attendance-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}
    </>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  detail,
}) {
  return (
    <div className="atlas-attendance-summary-card">

      <span className="atlas-attendance-summary-label">
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {detail}
      </small>

    </div>
  );
}