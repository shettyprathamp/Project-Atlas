import { useEffect, useState } from "react";
import "./Attendance.css";

import api from "../../services/api";
// If your api.js is located somewhere else, adjust this import path.


export default function Attendance() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  // =========================================================
  // FETCH ATTENDANCE
  // =========================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const [todayResponse, historyResponse] = await Promise.all([
        api.get("/employee/attendance/today"),
        api.get("/employee/attendance"),
      ]);

      setTodayAttendance(todayResponse.data);
      setAttendanceHistory(historyResponse.data || []);
    } catch (err) {
      console.error("Failed to load attendance:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load attendance information."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchAttendance();
  }, []);


  // =========================================================
  // CHECKED-IN STATE
  // =========================================================

  const isCheckedIn =
    todayAttendance?.check_in != null &&
    todayAttendance?.check_out == null;


  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };


  // =========================================================
  // WORKING HOURS
  // =========================================================

  const calculateWorkingHours = (
    checkIn,
    checkOut
  ) => {
    if (!checkIn || !checkOut) {
      return "—";
    }

    const [inHours, inMinutes] = checkIn
      .split(":")
      .map(Number);

    const [outHours, outMinutes] = checkOut
      .split(":")
      .map(Number);

    const startMinutes =
      inHours * 60 + inMinutes;

    const endMinutes =
      outHours * 60 + outMinutes;

    let difference =
      endMinutes - startMinutes;

    // Handles overnight shifts.
    if (difference < 0) {
      difference += 24 * 60;
    }

    const hours = Math.floor(
      difference / 60
    );

    const minutes = difference % 60;

    return `${hours}h ${minutes
      .toString()
      .padStart(2, "0")}m`;
  };


  // =========================================================
  // CHECK IN
  // =========================================================

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await api.post(
        "/employee/attendance/check-in"
      );

      setTodayAttendance(response.data);

      // Refresh history as well.
      const historyResponse = await api.get(
        "/employee/attendance"
      );

      setAttendanceHistory(
        historyResponse.data || []
      );
    } catch (err) {
      console.error(
        "Check-in failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to check in."
      );
    } finally {
      setActionLoading(false);
    }
  };


  // =========================================================
  // CHECK OUT
  // =========================================================

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await api.post(
        "/employee/attendance/check-out"
      );

      setTodayAttendance(response.data);

      // Refresh history.
      const historyResponse = await api.get(
        "/employee/attendance"
      );

      setAttendanceHistory(
        historyResponse.data || []
      );
    } catch (err) {
      console.error(
        "Check-out failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to check out."
      );
    } finally {
      setActionLoading(false);
    }
  };


  // =========================================================
  // ATTENDANCE ACTION
  // =========================================================

  const handleAttendance = () => {
    if (actionLoading) {
      return;
    }

    if (isCheckedIn) {
      handleCheckOut();
    } else {
      handleCheckIn();
    }
  };


  // =========================================================
  // MONTHLY DAYS
  // =========================================================

  const presentDays = attendanceHistory.filter(
    (record) =>
      record.status === "Present" ||
      record.status === "Late"
  ).length;


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="employee-attendance-page">
        <div className="employee-attendance-header">
          <div>
            <span className="employee-attendance-eyebrow">
              MY WORK
            </span>

            <h1>Attendance</h1>

            <p>
              Loading your attendance...
            </p>
          </div>
        </div>
      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="employee-attendance-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="employee-attendance-header">
        <div>
          <span className="employee-attendance-eyebrow">
            MY WORK
          </span>

          <h1>Attendance</h1>

          <p>
            Track your daily attendance, working hours
            and attendance history.
          </p>
        </div>
      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}


      {/* =====================================================
          TODAY CARD
          ===================================================== */}

      <section className="employee-attendance-today">

        <div className="employee-attendance-today-info">

          <span className="employee-attendance-date-label">
            TODAY
          </span>

          <h2>
            {formattedDate}
          </h2>

          <p>
            {isCheckedIn
              ? "You are currently checked in."
              : todayAttendance?.check_out
              ? "You have completed your attendance for today."
              : "You have not checked in yet."}
          </p>

        </div>


        <div className="employee-attendance-action">

          <div className="employee-attendance-current-status">

            <span
              className={
                isCheckedIn
                  ? "employee-attendance-status-dot active"
                  : "employee-attendance-status-dot"
              }
            />

            {isCheckedIn
              ? "Checked In"
              : todayAttendance?.check_out
              ? "Completed"
              : "Not Checked In"}

          </div>


          {!todayAttendance?.check_out && (
            <button
              className={
                isCheckedIn
                  ? "employee-attendance-checkout"
                  : "employee-attendance-checkin"
              }
              onClick={handleAttendance}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Please wait..."
                : isCheckedIn
                ? "Check Out"
                : "Check In"}
            </button>
          )}

        </div>

      </section>


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <div className="employee-attendance-summary">

        <div className="employee-attendance-summary-card">
          <span>
            Today's Check In
          </span>

          <strong>
            {formatTime(
              todayAttendance?.check_in
            )}
          </strong>
        </div>


        <div className="employee-attendance-summary-card">
          <span>
            Today's Check Out
          </span>

          <strong>
            {formatTime(
              todayAttendance?.check_out
            )}
          </strong>
        </div>


        <div className="employee-attendance-summary-card">
          <span>
            Working Hours
          </span>

          <strong>
            {calculateWorkingHours(
              todayAttendance?.check_in,
              todayAttendance?.check_out
            )}
          </strong>
        </div>


        <div className="employee-attendance-summary-card">
          <span>
            This Month
          </span>

          <strong>
            {presentDays} Days
          </strong>
        </div>

      </div>


      {/* =====================================================
          ATTENDANCE HISTORY
          ===================================================== */}

      <section className="employee-attendance-card">

        <div className="employee-attendance-card-header">

          <div>
            <h2>
              Attendance History
            </h2>

            <p>
              Your recent attendance records.
            </p>
          </div>


          <button
            className="employee-attendance-filter"
            type="button"
          >
            This Month
            <span>⌄</span>
          </button>

        </div>


        <div className="employee-attendance-table-wrapper">

          <table className="employee-attendance-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>


            <tbody>

              {attendanceHistory.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No attendance records found.
                  </td>
                </tr>

              ) : (

                attendanceHistory.map(
                  (record) => {

                    const recordDate =
                      new Date(
                        `${record.date}T00:00:00`
                      );

                    const formattedRecordDate =
                      recordDate.toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      );

                    const recordDay =
                      recordDate.toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                        }
                      );


                    return (
                      <tr
                        key={record.id}
                      >

                        <td>

                          <div className="employee-attendance-date">

                            <strong>
                              {formattedRecordDate}
                            </strong>

                            <span>
                              {recordDay}
                            </span>

                          </div>

                        </td>


                        <td>
                          {formatTime(
                            record.check_in
                          )}
                        </td>


                        <td>
                          {formatTime(
                            record.check_out
                          )}
                        </td>


                        <td>
                          {calculateWorkingHours(
                            record.check_in,
                            record.check_out
                          )}
                        </td>


                        <td>

                          <span
                            className={`employee-attendance-status ${record.status
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >

                            <span className="employee-attendance-status-small-dot" />

                            {record.status}

                          </span>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}