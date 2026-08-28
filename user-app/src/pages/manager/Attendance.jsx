import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Attendance.css";

function ManagerAttendance() {
  const today = new Date();

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);

  // =========================================================
  // CALENDAR STATE
  // =========================================================

  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(today)
  );

  const [calendarMonth, setCalendarMonth] = useState(
    today.getMonth()
  );

  const [calendarYear, setCalendarYear] = useState(
    today.getFullYear()
  );

  const [form, setForm] = useState({
    employee_id: "",
    date: getLocalDateString(today),
    check_in: "",
    check_out: "",
    status: "Present",
  });

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/manager/attendance/");

      setAttendance(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "MANAGER ATTENDANCE LOAD ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // =========================================================
  // EMPLOYEES
  // =========================================================

  const employees = useMemo(() => {
    const map = new Map();

    attendance.forEach((record) => {
      if (!map.has(record.employee_id)) {
        map.set(record.employee_id, {
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          team_id: record.team_id,
          team_name: record.team_name,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        (a.employee_name || "").localeCompare(
          b.employee_name || ""
        )
    );
  }, [attendance]);

  // =========================================================
  // ALL EMPLOYEES FROM ATTENDANCE
  // =========================================================

  const allEmployees = useMemo(() => {
    const map = new Map();

    attendance.forEach((record) => {
      if (!map.has(record.employee_id)) {
        map.set(record.employee_id, {
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          team_id: record.team_id,
          team_name: record.team_name,
        });
      }
    });

    return Array.from(map.values());
  }, [attendance]);

  // =========================================================
  // TEAMS
  // =========================================================

  const teams = useMemo(() => {
    const values = attendance
      .map((record) => record.team_name)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [attendance]);

  // =========================================================
  // CALENDAR HELPERS
  // =========================================================

  const months = [
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

  const years = useMemo(() => {
    const currentYear = today.getFullYear();

    return Array.from(
      { length: 11 },
      (_, index) => currentYear - 5 + index
    );
  }, []);

  const daysInMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    calendarYear,
    calendarMonth,
    1
  ).getDay();

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  // =========================================================
  // ATTENDANCE DATE MAP
  // =========================================================

  const attendanceByDate = useMemo(() => {
    const map = new Map();

    attendance.forEach((record) => {
      if (!record.date) return;

      const dateKey = String(record.date).split("T")[0];

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }

      map.get(dateKey).push(record);
    });

    return map;
  }, [attendance]);

  // =========================================================
  // CHECK WHETHER DATE HAS RECORD
  // =========================================================

  const hasAttendance = (dateKey) => {
    return attendanceByDate.has(dateKey);
  };

  // =========================================================
  // CHANGE CALENDAR MONTH
  // =========================================================

  const changeMonth = (direction) => {
    let newMonth = calendarMonth + direction;
    let newYear = calendarYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  // =========================================================
  // SELECT CALENDAR DATE
  // =========================================================

  const selectDate = (day) => {
    if (!day) return;

    const dateKey = `${calendarYear}-${String(
      calendarMonth + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    setSelectedDate(dateKey);

    setSearch("");
    setTeamFilter("All");
    setStatusFilter("All");
  };

  // =========================================================
  // SELECTED DATE RECORDS
  // =========================================================

  const selectedDateRecords = useMemo(() => {
    return attendanceByDate.get(selectedDate) || [];
  }, [attendanceByDate, selectedDate]);

  // =========================================================
  // FILTERED RECORDS
  // =========================================================

  const filteredAttendance = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return selectedDateRecords.filter((record) => {
      const matchesSearch =
        !searchValue ||
        record.employee_name
          ?.toLowerCase()
          .includes(searchValue) ||
        record.team_name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesTeam =
        teamFilter === "All" ||
        record.team_name === teamFilter;

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      return (
        matchesSearch &&
        matchesTeam &&
        matchesStatus
      );
    });
  }, [
    selectedDateRecords,
    search,
    teamFilter,
    statusFilter,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const total = selectedDateRecords.length;

    const present = selectedDateRecords.filter(
      (record) =>
        record.status?.toLowerCase() === "present"
    ).length;

    const absent = selectedDateRecords.filter(
      (record) =>
        record.status?.toLowerCase() === "absent"
    ).length;

    const late = selectedDateRecords.filter(
      (record) =>
        record.status?.toLowerCase() === "late"
    ).length;

    return {
      total,
      present,
      absent,
      late,
    };
  }, [selectedDateRecords]);

  // =========================================================
  // FORM
  // =========================================================

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // =========================================================
  // CREATE ATTENDANCE
  // =========================================================

  const handleCreateAttendance = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.employee_id) {
      setError("Please select an employee.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/attendance/", {
        employee_id: Number(form.employee_id),
        date: form.date,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        status: form.status,
      });

      setSuccess(
        "Attendance recorded successfully."
      );

      setShowAddModal(false);

      setSelectedDate(form.date);

      const createdDate = new Date(
        `${form.date}T00:00:00`
      );

      setCalendarMonth(
        createdDate.getMonth()
      );

      setCalendarYear(
        createdDate.getFullYear()
      );

      setForm({
        employee_id: "",
        date: getLocalDateString(new Date()),
        check_in: "",
        check_out: "",
        status: "Present",
      });

      await loadAttendance();
    } catch (err) {
      console.error(
        "CREATE ATTENDANCE ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to record attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(
      `${String(value).split("T")[0]}T00:00:00`
    );

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

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (value) => {
    if (!value) return "—";

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return value;
    }

    const date = new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (
      status?.toLowerCase()
    ) {
      case "present":
        return "status-present";

      case "absent":
        return "status-absent";

      case "late":
        return "status-late";

      default:
        return "status-other";
    }
  };

  // =========================================================
  // CALENDAR DATE KEY
  // =========================================================

  const getCalendarDateKey = (day) => {
    return `${calendarYear}-${String(
      calendarMonth + 1
    ).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  };

  // =========================================================
  // SELECTED DATE DISPLAY
  // =========================================================

  const selectedDateDisplay = formatDate(
    selectedDate
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="manager-attendance-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="manager-attendance-header">

        <div>
          <span className="manager-attendance-eyebrow">
            MANAGEMENT
          </span>

          <h1>
            Attendance
          </h1>

          <p>
            Monitor and manage attendance
            for employees under your management.
          </p>
        </div>

        <button
          type="button"
          className="attendance-add-button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowAddModal(true);
          }}
        >
          + Give Attendance
        </button>

      </div>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="attendance-message attendance-error">
          {error}
        </div>
      )}

      {success && (
        <div className="attendance-message attendance-success">
          {success}
        </div>
      )}


      {/* =====================================================
          ATTENDANCE CALENDAR
      ===================================================== */}

      <div className="attendance-calendar-card">

        <div className="attendance-calendar-header">

          <div>
            <span className="attendance-calendar-eyebrow">
              ATTENDANCE CALENDAR
            </span>

            <h2>
              {months[calendarMonth]} {calendarYear}
            </h2>
          </div>


          <div className="attendance-calendar-selectors">

            <button
              type="button"
              className="calendar-nav-button"
              onClick={() =>
                changeMonth(-1)
              }
              title="Previous month"
            >
              ‹
            </button>


            <select
              value={calendarMonth}
              onChange={(event) =>
                setCalendarMonth(
                  Number(event.target.value)
                )
              }
            >
              {months.map(
                (month, index) => (
                  <option
                    key={month}
                    value={index}
                  >
                    {month}
                  </option>
                )
              )}
            </select>


            <select
              value={calendarYear}
              onChange={(event) =>
                setCalendarYear(
                  Number(event.target.value)
                )
              }
            >
              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>


            <button
              type="button"
              className="calendar-nav-button"
              onClick={() =>
                changeMonth(1)
              }
              title="Next month"
            >
              ›
            </button>

          </div>

        </div>


        {/* ===================================================
            CALENDAR LEGEND
        =================================================== */}

        <div className="attendance-calendar-legend">

          <div>
            <span className="legend-dot legend-green" />
            Attendance recorded
          </div>

          <div>
            <span className="legend-dot legend-red" />
            No attendance record
          </div>

        </div>


        {/* ===================================================
            CALENDAR
        =================================================== */}

        <div className="attendance-calendar">

          <div className="calendar-weekdays">

            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div
                key={day}
                className="calendar-weekday"
              >
                {day}
              </div>
            ))}

          </div>


          <div className="calendar-grid">

            {calendarDays.map(
              (day, index) => {

                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="calendar-day calendar-day-empty"
                    />
                  );
                }

                const dateKey =
                  getCalendarDateKey(day);

                const hasRecord =
                  hasAttendance(dateKey);

                const isSelected =
                  selectedDate === dateKey;

                const isToday =
                  getLocalDateString(
                    new Date()
                  ) === dateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`calendar-day ${
                      isSelected
                        ? "calendar-day-selected"
                        : ""
                    } ${
                      isToday
                        ? "calendar-day-today"
                        : ""
                    }`}
                    onClick={() =>
                      selectDate(day)
                    }
                  >

                    <span className="calendar-day-number">
                      {day}
                    </span>

                    <span
                      className={`calendar-attendance-dot ${
                        hasRecord
                          ? "calendar-dot-green"
                          : "calendar-dot-red"
                      }`}
                    />

                  </button>
                );
              }
            )}

          </div>

        </div>


        {/* ===================================================
            SELECTED DATE
        =================================================== */}

        <div className="attendance-selected-date">

          <span>
            SELECTED DATE
          </span>

          <strong>
            {selectedDateDisplay}
          </strong>

        </div>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="attendance-summary-grid">

        <div className="attendance-summary-card">
          <span>
            Records on Selected Date
          </span>

          <strong>
            {summary.total}
          </strong>
        </div>

        <div className="attendance-summary-card">
          <span>
            Present
          </span>

          <strong>
            {summary.present}
          </strong>
        </div>

        <div className="attendance-summary-card">
          <span>
            Absent
          </span>

          <strong>
            {summary.absent}
          </strong>
        </div>

        <div className="attendance-summary-card">
          <span>
            Late
          </span>

          <strong>
            {summary.late}
          </strong>
        </div>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="attendance-controls">

        <div className="attendance-search">

          <input
            type="text"
            placeholder="Search employee or team..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <select
          value={teamFilter}
          onChange={(event) =>
            setTeamFilter(event.target.value)
          }
        >
          <option value="All">
            All Teams
          </option>

          {teams.map((team) => (
            <option
              key={team}
              value={team}
            >
              {team}
            </option>
          ))}

        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
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

        </select>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="attendance-table-card">

        <div className="attendance-table-header">

          <div>
            <h2>
              Employee Attendance
            </h2>

            <span>
              {selectedDateDisplay}
              {" • "}
              {filteredAttendance.length} record
              {filteredAttendance.length === 1
                ? ""
                : "s"}
            </span>
          </div>

        </div>


        {loading ? (

          <div className="attendance-state">

            <div className="attendance-spinner" />

            <p>
              Loading attendance...
            </p>

          </div>

        ) : filteredAttendance.length === 0 ? (

          <div className="attendance-state">

            <div className="attendance-empty-icon">
              —
            </div>

            <h3>
              No attendance records
            </h3>

            <p>
              There are no attendance records
              for {selectedDateDisplay}.
            </p>

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

                {filteredAttendance.map(
                  (record) => (

                    <tr
                      key={
                        record.attendance_id
                      }
                    >

                      <td>

                        <div className="employee-cell">

                          <div className="employee-avatar">

                            {record.employee_name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "?"}

                          </div>

                          <div>

                            <strong>
                              {record.employee_name ||
                                "Unknown Employee"}
                            </strong>

                            <span>
                              ID #{record.employee_id}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="team-name">
                          {record.team_name ||
                            "Unassigned"}
                        </span>

                      </td>


                      <td>
                        {formatDate(
                          record.date
                        )}
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

                        <span
                          className={`attendance-status ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status ||
                            "Unknown"}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          GIVE ATTENDANCE MODAL
      ===================================================== */}

      {showAddModal && (

        <div
          className="attendance-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setShowAddModal(false);
            }

          }}
        >

          <div className="attendance-modal">

            <div className="attendance-modal-header">

              <div>

                <span>
                  MANAGEMENT
                </span>

                <h2>
                  Give Attendance
                </h2>

              </div>


              <button
                type="button"
                className="attendance-modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleCreateAttendance
              }
            >

              <div className="attendance-form-group">

                <label>
                  Employee
                </label>

                <select
                  value={form.employee_id}
                  onChange={(event) =>
                    updateForm(
                      "employee_id",
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select employee
                  </option>

                  {employees.map(
                    (employee) => (

                      <option
                        key={
                          employee.employee_id
                        }
                        value={
                          employee.employee_id
                        }
                      >
                        {
                          employee.employee_name
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="attendance-form-group">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    updateForm(
                      "date",
                      event.target.value
                    )
                  }
                  required
                />

              </div>


              <div className="attendance-form-row">

                <div className="attendance-form-group">

                  <label>
                    Check In
                  </label>

                  <input
                    type="time"
                    value={form.check_in}
                    onChange={(event) =>
                      updateForm(
                        "check_in",
                        event.target.value
                      )
                    }
                  />

                </div>


                <div className="attendance-form-group">

                  <label>
                    Check Out
                  </label>

                  <input
                    type="time"
                    value={form.check_out}
                    onChange={(event) =>
                      updateForm(
                        "check_out",
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>


              <div className="attendance-form-group">

                <label>
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value
                    )
                  }
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

                </select>

              </div>


              <div className="attendance-modal-actions">

                <button
                  type="button"
                  className="attendance-cancel-button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="attendance-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Give Attendance"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default ManagerAttendance;