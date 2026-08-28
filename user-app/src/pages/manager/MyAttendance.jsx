
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

import "./MyAttendance.css";


function ManagerMyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadAttendance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * Manager's personal attendance.
       *
       * The backend may return either a list directly
       * or an object containing an attendance list.
       */

      const response = await api.get("/attendance/me");

      const data = response?.data;

      if (Array.isArray(data)) {
        setAttendance(data);
      } else if (Array.isArray(data?.attendance)) {
        setAttendance(data.attendance);
      } else if (Array.isArray(data?.items)) {
        setAttendance(data.items);
      } else {
        setAttendance([]);
      }
    } catch (err) {
      console.error(
        "Failed to load manager attendance:",
        err
      );

      setAttendance([]);

      setError(
        err?.response?.data?.detail ||
        "Unable to load your attendance right now."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const stats = useMemo(() => {
    const present = attendance.filter(
      (item) =>
        String(item?.status || "").toLowerCase() === "present"
    ).length;

    const absent = attendance.filter(
      (item) =>
        String(item?.status || "").toLowerCase() === "absent"
    ).length;

    const late = attendance.filter(
      (item) =>
        String(item?.status || "").toLowerCase() === "late"
    ).length;

    return {
      total: attendance.length,
      present,
      absent,
      late,
    };
  }, [attendance]);

  const getStatusClass = (status) => {
    const normalized = String(
      status || "unknown"
    ).toLowerCase();

    if (normalized === "present") {
      return "manager-my-attendance-status present";
    }

    if (normalized === "absent") {
      return "manager-my-attendance-status absent";
    }

    if (normalized === "late") {
      return "manager-my-attendance-status late";
    }

    if (
      normalized === "half_day" ||
      normalized === "half-day"
    ) {
      return "manager-my-attendance-status half-day";
    }

    return "manager-my-attendance-status unknown";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return String(status)
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getDateValue = (item) => {
    return (
      item?.date ||
      item?.attendance_date ||
      item?.created_at ||
      null
    );
  };

  const getCheckIn = (item) => {
    return (
      item?.check_in ||
      item?.check_in_time ||
      item?.clock_in ||
      null
    );
  };

  const getCheckOut = (item) => {
    return (
      item?.check_out ||
      item?.check_out_time ||
      item?.clock_out ||
      null
    );
  };

  return (
    <div className="manager-my-attendance-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="manager-my-attendance-header">

        <div>
          <span className="manager-my-attendance-eyebrow">
            MY WORKSPACE
          </span>

          <h1>
            My Attendance
          </h1>

          <p>
            View your personal attendance history and
            daily attendance status.
          </p>
        </div>

        <button
          type="button"
          className="manager-my-attendance-refresh-btn"
          onClick={() => loadAttendance(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "manager-my-attendance-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </header>


      {/* =====================================================
          TODAY CARD
      ===================================================== */}

      <section className="manager-my-attendance-today">

        <div className="manager-my-attendance-today-icon">
          <CalendarDays size={23} />
        </div>

        <div className="manager-my-attendance-today-content">

          <span>
            TODAY
          </span>

          <strong>
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>

          <p>
            Your attendance record for today.
          </p>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="manager-my-attendance-stats">

        <div className="manager-my-attendance-stat-card">

          <div className="manager-my-attendance-stat-icon total">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>
              Total Records
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="manager-my-attendance-stat-card">

          <div className="manager-my-attendance-stat-icon present">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>
              Present
            </span>

            <strong>
              {stats.present}
            </strong>
          </div>

        </div>


        <div className="manager-my-attendance-stat-card">

          <div className="manager-my-attendance-stat-icon late">
            <Clock3 size={19} />
          </div>

          <div>
            <span>
              Late
            </span>

            <strong>
              {stats.late}
            </strong>
          </div>

        </div>


        <div className="manager-my-attendance-stat-card">

          <div className="manager-my-attendance-stat-icon absent">
            <XCircle size={19} />
          </div>

          <div>
            <span>
              Absent
            </span>

            <strong>
              {stats.absent}
            </strong>
          </div>

        </div>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="manager-my-attendance-error">

          <AlertCircle size={18} />

          <div>
            <strong>
              Attendance could not be loaded
            </strong>

            <p>
              {error}
            </p>
          </div>

        </div>
      )}


      {/* =====================================================
          ATTENDANCE HISTORY
      ===================================================== */}

      <section className="manager-my-attendance-card">

        <div className="manager-my-attendance-card-header">

          <div>
            <h2>
              Attendance History
            </h2>

            <p>
              Your personal attendance records
            </p>
          </div>

          <div className="manager-my-attendance-count">
            <strong>
              {attendance.length}
            </strong>

            <span>
              records
            </span>
          </div>

        </div>


        {loading ? (

          <div className="manager-my-attendance-loading">

            <RefreshCw
              size={25}
              className="manager-my-attendance-spin"
            />

            <p>
              Loading attendance...
            </p>

          </div>

        ) : attendance.length === 0 ? (

          <div className="manager-my-attendance-empty">

            <div className="manager-my-attendance-empty-icon">
              <CalendarDays size={31} />
            </div>

            <h3>
              No attendance records yet
            </h3>

            <p>
              Your attendance records will appear here
              once attendance has been recorded.
            </p>

          </div>

        ) : (

          <div className="manager-my-attendance-table-wrapper">

            <table className="manager-my-attendance-table">

              <thead>
                <tr>
                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Check In
                  </th>

                  <th>
                    Check Out
                  </th>

                  <th>
                    Working Hours
                  </th>
                </tr>
              </thead>

              <tbody>

                {attendance.map((item, index) => {

                  const dateValue =
                    getDateValue(item);

                  const checkIn =
                    getCheckIn(item);

                  const checkOut =
                    getCheckOut(item);

                  const workingHours =
                    item?.working_hours ??
                    item?.hours ??
                    item?.total_hours ??
                    "—";

                  return (
                    <tr
                      key={
                        item?.id ??
                        item?.attendance_id ??
                        `${dateValue}-${index}`
                      }
                    >

                      <td>
                        <span className="manager-my-attendance-date">
                          {formatDate(dateValue)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            item?.status
                          )}
                        >
                          <span className="manager-my-attendance-status-dot" />

                          {getStatusLabel(
                            item?.status
                          )}
                        </span>
                      </td>

                      <td>
                        {formatTime(checkIn)}
                      </td>

                      <td>
                        {formatTime(checkOut)}
                      </td>

                      <td>
                        <span className="manager-my-attendance-hours">
                          {workingHours}
                        </span>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


export default ManagerMyAttendance;
