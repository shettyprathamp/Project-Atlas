import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./Attendance.css";

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusClass(status) {
  if (!status) {
    return "not-marked";
  }

  return status
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function Attendance() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    getLocalDate()
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [form, setForm] = useState({
    employee_id: "",
    date: getLocalDate(),
    check_in: "",
    check_out: "",
    status: "Present",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        attendanceResponse,
        employeesResponse,
      ] = await Promise.all([
        api.get("/attendance/"),
        api.get("/employees/"),
      ]);

      setAttendance(
        Array.isArray(attendanceResponse.data)
          ? attendanceResponse.data
          : []
      );

      setEmployees(
        Array.isArray(employeesResponse.data)
          ? employeesResponse.data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAttendanceForm() {
    setForm({
      employee_id: "",
      date: selectedDate,
      check_in: "",
      check_out: "",
      status: "Present",
    });

    setShowForm(true);
  }

  function closeAttendanceForm() {
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      await api.post("/attendance/", {
        employee_id: Number(form.employee_id),
        date: form.date,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        status: form.status,
      });

      setForm({
        employee_id: "",
        date: selectedDate,
        check_in: "",
        check_out: "",
        status: "Present",
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to create attendance record."
      );
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/attendance/${id}`);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete attendance record."
      );
    }
  }

  function changeDate(days) {
    const current = new Date(
      `${selectedDate}T00:00:00`
    );

    current.setDate(current.getDate() + days);

    const year = current.getFullYear();
    const month = String(
      current.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      current.getDate()
    ).padStart(2, "0");

    const newDate = `${year}-${month}-${day}`;

    setSelectedDate(newDate);

    setForm((previous) => ({
      ...previous,
      date: newDate,
    }));
  }

  function goToToday() {
    const today = getLocalDate();

    setSelectedDate(today);

    setForm((previous) => ({
      ...previous,
      date: today,
    }));
  }

  function formatSelectedDate() {
    return new Date(
      `${selectedDate}T00:00:00`
    ).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getInitials(name) {
    if (!name) {
      return "?";
    }

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  function calculateHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) {
      return "—";
    }

    const [inHours, inMinutes] =
      checkIn.split(":").map(Number);

    const [outHours, outMinutes] =
      checkOut.split(":").map(Number);

    const start =
      inHours * 60 + inMinutes;

    const end =
      outHours * 60 + outMinutes;

    const difference = end - start;

    if (difference <= 0) {
      return "—";
    }

    const hours = Math.floor(
      difference / 60
    );

    const minutes = difference % 60;

    return `${hours}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;
  }

  /*
   * Attendance records for selected date.
   */

  const selectedDateAttendance = useMemo(() => {
    return attendance.filter(
      (record) =>
        record.date === selectedDate
    );
  }, [attendance, selectedDate]);

  /*
   * Build one row for every employee.
   */

  const dailyEmployees = useMemo(() => {
    return employees.map((employee) => {
      const record =
        selectedDateAttendance.find(
          (item) =>
            Number(item.employee_id) ===
            Number(employee.id)
        );

      return {
        employee,
        record,
      };
    });
  }, [
    employees,
    selectedDateAttendance,
  ]);

  /*
   * Search + status filtering.
   */

  const filteredEmployees = useMemo(() => {
    return dailyEmployees.filter(
      ({ employee, record }) => {
        const searchValue = search
          .toLowerCase()
          .trim();

        const employeeName =
          employee.name?.toLowerCase() || "";

        const employeeEmail =
          employee.email?.toLowerCase() || "";

        const employeeDepartment =
          employee.department?.toLowerCase() || "";

        const matchesSearch =
          !searchValue ||
          employeeName.includes(searchValue) ||
          employeeEmail.includes(searchValue) ||
          employeeDepartment.includes(
            searchValue
          );

        const employeeStatus =
          record?.status || "Not Marked";

        const matchesStatus =
          statusFilter === "All" ||
          employeeStatus === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    dailyEmployees,
    search,
    statusFilter,
  ]);

  /*
   * Daily statistics.
   */

  const presentCount =
    dailyEmployees.filter(
      ({ record }) =>
        record?.status?.toLowerCase() ===
        "present"
    ).length;

  const absentCount =
    dailyEmployees.filter(
      ({ record }) =>
        record?.status?.toLowerCase() ===
        "absent"
    ).length;

  const lateCount =
    dailyEmployees.filter(
      ({ record }) =>
        record?.status?.toLowerCase() ===
        "late"
    ).length;

  const leaveCount =
    dailyEmployees.filter(
      ({ record }) =>
        record?.status?.toLowerCase() ===
        "on leave"
    ).length;

  const notMarkedCount =
    dailyEmployees.filter(
      ({ record }) => !record
    ).length;

  /*
   * Attendance percentage.
   */

  const attendancePercentage =
    employees.length > 0
      ? Math.round(
          (presentCount /
            employees.length) *
            100
        )
      : 0;

  /*
   * Employee attendance history.
   */

  const employeeHistory = selectedEmployee
    ? attendance
        .filter(
          (record) =>
            Number(record.employee_id) ===
            Number(selectedEmployee.id)
        )
        .sort((a, b) =>
          b.date.localeCompare(a.date)
        )
    : [];

  const selectedEmployeeToday =
    selectedEmployee
      ? selectedDateAttendance.find(
          (record) =>
            Number(record.employee_id) ===
            Number(selectedEmployee.id)
        )
      : null;

  return (
    <div className="attendance-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <header className="attendance-header">

        <div className="attendance-header-content">

          <span className="attendance-eyebrow">
            WORKFORCE
          </span>

          <h1>
            Employee Attendance
          </h1>

          <p>
            Monitor daily attendance,
            working hours and employee
            presence across the organization.
          </p>

        </div>

        <button
          type="button"
          className="attendance-primary-button"
          onClick={
            showForm
              ? closeAttendanceForm
              : openAttendanceForm
          }
        >
          <span className="button-icon">
            {showForm ? "×" : "+"}
          </span>

          {showForm
            ? "Close"
            : "Mark Attendance"}
        </button>

      </header>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="attendance-error">

          <div className="attendance-error-icon">
            !
          </div>

          <div>
            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>
          </div>

        </div>
      )}

      {/* =========================================
          DATE NAVIGATION
      ========================================= */}

      <section className="attendance-date-card">

        <button
          type="button"
          className="attendance-date-arrow"
          onClick={() =>
            changeDate(-1)
          }
          aria-label="Previous day"
        >
          ←
        </button>

        <div className="attendance-date-center">

          <span className="attendance-date-label">
            SELECTED DATE
          </span>

          <strong>
            {formatSelectedDate()}
          </strong>

        </div>

        <button
          type="button"
          className="attendance-date-arrow"
          onClick={() =>
            changeDate(1)
          }
          aria-label="Next day"
        >
          →
        </button>

        <button
          type="button"
          className="attendance-today-button"
          onClick={goToToday}
        >
          Today
        </button>

      </section>

      {/* =========================================
          KPI CARDS
      ========================================= */}

      <section className="attendance-kpis">

        <div className="attendance-kpi-card">

          <div className="attendance-kpi-icon total">
            #
          </div>

          <div className="attendance-kpi-content">

            <span>
              Total Employees
            </span>

            <strong>
              {employees.length}
            </strong>

            <small>
              Active workforce
            </small>

          </div>

        </div>

        <div className="attendance-kpi-card present">

          <div className="attendance-kpi-icon">
            ✓
          </div>

          <div className="attendance-kpi-content">

            <span>
              Present
            </span>

            <strong>
              {presentCount}
            </strong>

            <small>
              {attendancePercentage}% of workforce
            </small>

          </div>

        </div>

        <div className="attendance-kpi-card absent">

          <div className="attendance-kpi-icon">
            ×
          </div>

          <div className="attendance-kpi-content">

            <span>
              Absent
            </span>

            <strong>
              {absentCount}
            </strong>

            <small>
              Not present today
            </small>

          </div>

        </div>

        <div className="attendance-kpi-card late">

          <div className="attendance-kpi-icon">
            !
          </div>

          <div className="attendance-kpi-content">

            <span>
              Late
            </span>

            <strong>
              {lateCount}
            </strong>

            <small>
              Late arrivals
            </small>

          </div>

        </div>

        <div className="attendance-kpi-card leave">

          <div className="attendance-kpi-icon">
            ◷
          </div>

          <div className="attendance-kpi-content">

            <span>
              On Leave
            </span>

            <strong>
              {leaveCount}
            </strong>

            <small>
              Approved leave
            </small>

          </div>

        </div>

        <div className="attendance-kpi-card pending">

          <div className="attendance-kpi-icon">
            —
          </div>

          <div className="attendance-kpi-content">

            <span>
              Not Marked
            </span>

            <strong>
              {notMarkedCount}
            </strong>

            <small>
              Awaiting attendance
            </small>

          </div>

        </div>

      </section>

      {/* =========================================
          ATTENDANCE FORM
      ========================================= */}

      {showForm && (
        <section className="attendance-form-card">

          <div className="attendance-form-header">

            <div>

              <span className="attendance-section-label">
                ATTENDANCE ENTRY
              </span>

              <h2>
                Mark Employee Attendance
              </h2>

              <p>
                Add attendance details for
                an employee.
              </p>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="attendance-form-grid">

              <div className="attendance-field">

                <label>
                  Employee
                </label>

                <select
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map(
                    (employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="attendance-field">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="attendance-field">

                <label>
                  Check In
                </label>

                <input
                  type="time"
                  name="check_in"
                  value={form.check_in}
                  onChange={handleChange}
                />

              </div>

              <div className="attendance-field">

                <label>
                  Check Out
                </label>

                <input
                  type="time"
                  name="check_out"
                  value={form.check_out}
                  onChange={handleChange}
                />

              </div>

              <div className="attendance-field">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                  <option value="Late">
                    Late
                  </option>

                  <option value="On Leave">
                    On Leave
                  </option>

                </select>

              </div>

            </div>

            <div className="attendance-form-actions">

              <button
                type="button"
                className="attendance-secondary-button"
                onClick={
                  closeAttendanceForm
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="attendance-primary-button"
              >
                Save Attendance
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =========================================
          DAILY REGISTER
      ========================================= */}

      <section className="attendance-register-card">

        <div className="attendance-register-header">

          <div>

            <span className="attendance-section-label">
              DAILY REGISTER
            </span>

            <h2>
              Employee Attendance
            </h2>

            <p>
              Attendance status for{" "}
              {formatSelectedDate()}.
            </p>

          </div>

          <div className="attendance-register-count">

            <strong>
              {filteredEmployees.length}
            </strong>

            <span>
              employees
            </span>

          </div>

        </div>

        {/* CONTROLS */}

        <div className="attendance-controls">

          <div className="attendance-search">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search employee, email or department..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="attendance-filter">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Present">
                Present
              </option>

              <option value="Absent">
                Absent
              </option>

              <option value="Late">
                Late
              </option>

              <option value="On Leave">
                On Leave
              </option>

              <option value="Not Marked">
                Not Marked
              </option>

            </select>

          </div>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="attendance-state">

            <div className="attendance-spinner" />

            <strong>
              Loading attendance
            </strong>

            <span>
              Fetching today's workforce
              records...
            </span>

          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="attendance-state">

            <div className="attendance-state-icon">
              ⌕
            </div>

            <strong>
              No employees found
            </strong>

            <span>
              Try changing your search or
              status filter.
            </span>

          </div>
        ) : (
          <div className="attendance-table-wrapper">

            <table className="attendance-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Check In
                  </th>

                  <th>
                    Check Out
                  </th>

                  <th>
                    Hours
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredEmployees.map(
                  ({ employee, record }) => {

                    const status =
                      record?.status ||
                      "Not Marked";

                    const statusClass =
                      getStatusClass(status);

                    return (
                      <tr
                        key={employee.id}
                        onClick={() =>
                          setSelectedEmployee(
                            employee
                          )
                        }
                        className="attendance-table-row"
                      >

                        <td>

                          <div className="attendance-employee">

                            <div className="attendance-avatar">
                              {getInitials(
                                employee.name
                              )}
                            </div>

                            <div className="attendance-employee-info">

                              <strong>
                                {employee.name ||
                                  "Unnamed Employee"}
                              </strong>

                              <span>
                                {employee.email ||
                                  "No email available"}
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="attendance-department">
                            {employee.department ||
                              "—"}
                          </span>

                        </td>

                        <td>

                          <span className="attendance-time">
                            {record?.check_in ||
                              "—"}
                          </span>

                        </td>

                        <td>

                          <span className="attendance-time">
                            {record?.check_out ||
                              "—"}
                          </span>

                        </td>

                        <td>

                          <span className="attendance-hours">
                            {calculateHours(
                              record?.check_in,
                              record?.check_out
                            )}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`attendance-status ${statusClass}`}
                          >

                            <span className="status-dot" />

                            {status}

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

      {/* =========================================
          EMPLOYEE HISTORY
      ========================================= */}

      {selectedEmployee && (
        <section className="employee-history-card">

          <div className="employee-history-header">

            <div className="employee-history-profile">

              <div className="history-avatar">
                {getInitials(
                  selectedEmployee.name
                )}
              </div>

              <div>

                <span className="attendance-section-label">
                  EMPLOYEE ATTENDANCE
                </span>

                <h2>
                  {selectedEmployee.name}
                </h2>

                <p>
                  {selectedEmployee.department ||
                    "No department"}
                  {" · "}
                  {selectedEmployee.email ||
                    "No email"}
                </p>

              </div>

            </div>

            <button
              type="button"
              className="attendance-secondary-button"
              onClick={() =>
                setSelectedEmployee(null)
              }
            >
              Close
            </button>

          </div>

          <div className="employee-history-summary">

            <div>

              <span>
                Today's Status
              </span>

              <strong>
                {selectedEmployeeToday?.status ||
                  "Not Marked"}
              </strong>

            </div>

            <div>

              <span>
                Check In
              </span>

              <strong>
                {selectedEmployeeToday?.check_in ||
                  "—"}
              </strong>

            </div>

            <div>

              <span>
                Check Out
              </span>

              <strong>
                {selectedEmployeeToday?.check_out ||
                  "—"}
              </strong>

            </div>

            <div>

              <span>
                Total Records
              </span>

              <strong>
                {employeeHistory.length}
              </strong>

            </div>

          </div>

          <div className="employee-history-content">

            <div className="employee-history-title">

              <div>

                <h3>
                  Attendance History
                </h3>

                <p>
                  Previous attendance
                  records for this employee.
                </p>

              </div>

            </div>

            {employeeHistory.length === 0 ? (
              <div className="attendance-state compact">

                <div className="attendance-state-icon">
                  ◷
                </div>

                <strong>
                  No attendance history
                </strong>

                <span>
                  No attendance records
                  have been recorded for
                  this employee.
                </span>

              </div>
            ) : (
              <div className="history-table-wrapper">

                <table className="attendance-table">

                  <thead>

                    <tr>

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
                        Hours
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {employeeHistory.map(
                      (record) => {

                        const status =
                          record.status ||
                          "Unknown";

                        const statusClass =
                          getStatusClass(
                            status
                          );

                        return (
                          <tr
                            key={record.id}
                          >

                            <td>
                              <strong>
                                {formatDate(
                                  record.date
                                )}
                              </strong>
                            </td>

                            <td>
                              {record.check_in ||
                                "—"}
                            </td>

                            <td>
                              {record.check_out ||
                                "—"}
                            </td>

                            <td>
                              {calculateHours(
                                record.check_in,
                                record.check_out
                              )}
                            </td>

                            <td>

                              <span
                                className={`attendance-status ${statusClass}`}
                              >

                                <span className="status-dot" />

                                {status}

                              </span>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="history-delete-button"
                                onClick={() =>
                                  handleDelete(
                                    record.id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </section>
      )}

    </div>
  );
}