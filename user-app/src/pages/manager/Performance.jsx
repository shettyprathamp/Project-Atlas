import {
  Activity,
  AlertCircle,
  CalendarCheck,
  Clock3,
  DollarSign,
  RefreshCw,
  Users,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import api from "../../services/api";

import "./Performance.css";


export default function ManagerPerformance() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // FETCH PERFORMANCE
  // =========================================================

  const fetchPerformance = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get(
        "/manager/performance/"
      );

      setData(response.data);

    } catch (err) {

      console.error(
        "Failed to load manager performance:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        "Unable to load performance data."
      );

    } finally {

      setLoading(false);

    }

  }, []);


  useEffect(() => {

    fetchPerformance();

  }, [fetchPerformance]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="manager-performance-page">

        <div className="performance-loading-panel">

          <RefreshCw
            size={22}
            className="performance-loading-icon"
          />

          <span>
            Loading performance data...
          </span>

        </div>

      </div>
    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (
      <div className="manager-performance-page">

        <div className="performance-error-panel">

          <AlertCircle size={20} />

          <div>

            <strong>
              Unable to load performance
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={fetchPerformance}
          >
            <RefreshCw size={14} />
            Retry
          </button>

        </div>

      </div>
    );

  }


  if (!data) {
    return null;
  }


  const summary = data.summary || {};
  const teams = data.teams || [];
  const employees = data.employees || [];
  const recentAttendance =
    data.recent_attendance || [];


  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatCurrency = (value) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value || 0);

  };


  const formatDate = (value) => {

    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  const formatTime = (value) => {

    if (!value) {
      return "—";
    }

    return value.slice(0, 5);

  };


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="manager-performance-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="performance-header">

        <div>

          <div className="performance-header-label">
            MANAGER / PERFORMANCE
          </div>

          <h1>
            Performance
          </h1>

          <p>
            Real-time workforce performance and operational
            analytics.
          </p>

        </div>

        <button
          type="button"
          className="performance-refresh-button"
          onClick={fetchPerformance}
          title="Refresh performance data"
        >
          <RefreshCw size={14} />

          <span>
            Refresh
          </span>
        </button>

      </header>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="performance-summary-grid">

        <div className="performance-summary-card">

          <div className="performance-summary-icon">
            <Users size={18} />
          </div>

          <div>

            <span>
              Total Employees
            </span>

            <strong>
              {summary.total_employees ?? 0}
            </strong>

            <small>
              {summary.active_employees ?? 0} active
            </small>

          </div>

        </div>


        <div className="performance-summary-card">

          <div className="performance-summary-icon">
            <CalendarCheck size={18} />
          </div>

          <div>

            <span>
              Attendance Rate
            </span>

            <strong>
              {summary.attendance_rate ?? 0}%
            </strong>

            <small>
              {summary.present ?? 0} present
            </small>

          </div>

        </div>


        <div className="performance-summary-card">

          <div className="performance-summary-icon">
            <Clock3 size={18} />
          </div>

          <div>

            <span>
              Attendance Records
            </span>

            <strong>
              {summary.total_attendance_records ?? 0}
            </strong>

            <small>
              {summary.late ?? 0} late
            </small>

          </div>

        </div>


        <div className="performance-summary-card">

          <div className="performance-summary-icon">
            <DollarSign size={18} />
          </div>

          <div>

            <span>
              Total Payroll
            </span>

            <strong className="performance-currency">
              {formatCurrency(summary.total_payroll)}
            </strong>

            <small>
              {formatCurrency(summary.paid_payroll)} paid
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          ATTENDANCE + LEAVE
      ===================================================== */}

      <section className="performance-two-column">


        {/* ATTENDANCE */}

        <div className="performance-panel">

          <div className="performance-panel-header">

            <div>

              <h2>
                Attendance Overview
              </h2>

              <p>
                Current attendance records across the company.
              </p>

            </div>

            <Activity size={18} />

          </div>


          <div className="performance-stat-list">

            <div className="performance-stat-row">

              <span>
                Present
              </span>

              <strong>
                {summary.present ?? 0}
              </strong>

            </div>

            <div className="performance-stat-row">

              <span>
                Absent
              </span>

              <strong>
                {summary.absent ?? 0}
              </strong>

            </div>

            <div className="performance-stat-row">

              <span>
                Late
              </span>

              <strong>
                {summary.late ?? 0}
              </strong>

            </div>

            <div className="performance-stat-row">

              <span>
                Other
              </span>

              <strong>
                {summary.other_attendance ?? 0}
              </strong>

            </div>

          </div>

        </div>


        {/* LEAVE */}

        <div className="performance-panel">

          <div className="performance-panel-header">

            <div>

              <h2>
                Leave Overview
              </h2>

              <p>
                Real leave requests recorded in the system.
              </p>

            </div>

            <CalendarCheck size={18} />

          </div>


          <div className="performance-stat-list">

            <div className="performance-stat-row">

              <span>
                Total Requests
              </span>

              <strong>
                {summary.total_leaves ?? 0}
              </strong>

            </div>

            <div className="performance-stat-row">

              <span>
                Pending
              </span>

              <strong>
                {summary.pending_leaves ?? 0}
              </strong>

            </div>

            <div className="performance-stat-row">

              <span>
                Approved
              </span>

              <strong>
                {summary.approved_leaves ?? 0}
              </strong>

            </div>

            <div className="performance-stat-row">

              <span>
                Rejected
              </span>

              <strong>
                {summary.rejected_leaves ?? 0}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TEAMS
      ===================================================== */}

      <section className="performance-panel">

        <div className="performance-panel-header">

          <div>

            <h2>
              Team Performance
            </h2>

            <p>
              Attendance performance across manager teams.
            </p>

          </div>

          <Users size={18} />

        </div>


        {teams.length === 0 ? (

          <div className="performance-empty">
            No teams found.
          </div>

        ) : (

          <div className="performance-table-wrapper">

            <table className="performance-table">

              <thead>

                <tr>

                  <th>
                    Team
                  </th>

                  <th>
                    Employees
                  </th>

                  <th>
                    Attendance
                  </th>

                  <th>
                    Present
                  </th>

                  <th>
                    Absent
                  </th>

                  <th>
                    Late
                  </th>

                  <th>
                    Pending Leave
                  </th>

                </tr>

              </thead>

              <tbody>

                {teams.map((team) => (

                  <tr key={team.team_id}>

                    <td>

                      <strong>
                        {team.team_name}
                      </strong>

                    </td>

                    <td>
                      {team.employee_count}
                    </td>

                    <td>

                      <span className="performance-rate">
                        {team.attendance_rate}%
                      </span>

                    </td>

                    <td>
                      {team.present}
                    </td>

                    <td>
                      {team.absent}
                    </td>

                    <td>
                      {team.late}
                    </td>

                    <td>
                      {team.pending_leaves}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          EMPLOYEES
      ===================================================== */}

      <section className="performance-panel">

        <div className="performance-panel-header">

          <div>

            <h2>
              Employee Performance
            </h2>

            <p>
              Attendance-based performance from real records.
            </p>

          </div>

          <Activity size={18} />

        </div>


        {employees.length === 0 ? (

          <div className="performance-empty">
            No employee performance data found.
          </div>

        ) : (

          <div className="performance-table-wrapper">

            <table className="performance-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Team
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Days
                  </th>

                  <th>
                    Present
                  </th>

                  <th>
                    Absent
                  </th>

                  <th>
                    Late
                  </th>

                  <th>
                    Attendance
                  </th>

                </tr>

              </thead>

              <tbody>

                {employees.map((employee) => (

                  <tr key={employee.employee_id}>

                    <td>

                      <strong>
                        {employee.employee_name}
                      </strong>

                    </td>

                    <td>
                      {employee.team_name || "Unassigned"}
                    </td>

                    <td>
                      {employee.role || "—"}
                    </td>

                    <td>
                      {employee.total_days}
                    </td>

                    <td>
                      {employee.present_days}
                    </td>

                    <td>
                      {employee.absent_days}
                    </td>

                    <td>
                      {employee.late_days}
                    </td>

                    <td>

                      <span className="performance-rate">
                        {employee.attendance_rate}%
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          RECENT ATTENDANCE
      ===================================================== */}

      <section className="performance-panel">

        <div className="performance-panel-header">

          <div>

            <h2>
              Recent Attendance
            </h2>

            <p>
              Latest attendance activity from the database.
            </p>

          </div>

          <Clock3 size={18} />

        </div>


        {recentAttendance.length === 0 ? (

          <div className="performance-empty">
            No attendance records found.
          </div>

        ) : (

          <div className="performance-table-wrapper">

            <table className="performance-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Team
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Check In
                  </th>

                  <th>
                    Check Out
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentAttendance.map((record) => (

                  <tr key={record.attendance_id}>

                    <td>

                      <strong>
                        {record.employee_name}
                      </strong>

                    </td>

                    <td>
                      {record.team_name || "Unassigned"}
                    </td>

                    <td>
                      {formatDate(record.date)}
                    </td>

                    <td>
                      {formatTime(record.check_in)}
                    </td>

                    <td>
                      {formatTime(record.check_out)}
                    </td>

                    <td>

                      <span
                        className={
                          `performance-status ${
                            (
                              record.status || ""
                            ).toLowerCase()
                          }`
                        }
                      >
                        {record.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}