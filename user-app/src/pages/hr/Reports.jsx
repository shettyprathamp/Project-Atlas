import "./reports.css";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const MONTHS = [
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

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [recruitment, setRecruitment] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSection, setSelectedSection] = useState("overview");

  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [payrollFilter, setPayrollFilter] = useState("All");
  const [leaveFilter, setLeaveFilter] = useState("All");
  const [recruitmentFilter, setRecruitmentFilter] = useState("All");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const [
        employeesResponse,
        attendanceResponse,
        leaveResponse,
        recruitmentResponse,
        payrollResponse,
      ] = await Promise.all([
        api.get("/employees/"),
        api.get("/attendance/"),
        api.get("/leave/"),
        api.get("/recruitment/"),
        api.get("/payroll/"),
      ]);

      setEmployees(
        Array.isArray(employeesResponse.data)
          ? employeesResponse.data
          : []
      );

      setAttendance(
        Array.isArray(attendanceResponse.data)
          ? attendanceResponse.data
          : []
      );

      setLeaves(
        Array.isArray(leaveResponse.data)
          ? leaveResponse.data
          : []
      );

      setRecruitment(
        Array.isArray(recruitmentResponse.data)
          ? recruitmentResponse.data
          : []
      );

      setPayroll(
        Array.isArray(payrollResponse.data)
          ? payrollResponse.data
          : []
      );
    } catch (err) {
      console.error("Reports loading error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load reports."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function getNumber(value) {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  }

  function formatCurrency(value) {
    return getNumber(value).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getEmployeeName(employeeId) {
    const employee = employees.find(
      (item) =>
        Number(item.id) === Number(employeeId)
    );

    return (
      employee?.name ||
      `Employee #${employeeId}`
    );
  }

  function getStatusClass(status) {
    const normalized = String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (
      normalized === "paid" ||
      normalized === "present" ||
      normalized === "approved" ||
      normalized === "selected" ||
      normalized === "hired" ||
      normalized === "active"
    ) {
      return "status-success";
    }

    if (
      normalized === "absent" ||
      normalized === "rejected" ||
      normalized === "cancelled"
    ) {
      return "status-danger";
    }

    if (
      normalized === "late" ||
      normalized === "pending" ||
      normalized === "on-leave" ||
      normalized === "applied"
    ) {
      return "status-warning";
    }

    return "status-neutral";
  }

  const statistics = useMemo(() => {
    const activeEmployees = employees.filter(
      (employee) =>
        String(employee.status || "")
          .toLowerCase() === "active"
    ).length;

    const presentAttendance = attendance.filter(
      (record) =>
        String(record.status || "")
          .toLowerCase() === "present"
    ).length;

    const absentAttendance = attendance.filter(
      (record) =>
        String(record.status || "")
          .toLowerCase() === "absent"
    ).length;

    const lateAttendance = attendance.filter(
      (record) =>
        String(record.status || "")
          .toLowerCase() === "late"
    ).length;

    const leaveAttendance = attendance.filter(
      (record) =>
        String(record.status || "")
          .toLowerCase() === "on leave"
    ).length;

    const pendingLeaves = leaves.filter(
      (leave) =>
        String(leave.status || "")
          .toLowerCase() === "pending"
    ).length;

    const approvedLeaves = leaves.filter(
      (leave) =>
        String(leave.status || "")
          .toLowerCase() === "approved"
    ).length;

    const rejectedLeaves = leaves.filter(
      (leave) =>
        String(leave.status || "")
          .toLowerCase() === "rejected"
    ).length;

    const totalCandidates = recruitment.length;

    const hiredCandidates = recruitment.filter(
      (candidate) =>
        ["hired", "selected"].includes(
          String(candidate.status || "")
            .toLowerCase()
        )
    ).length;

    const pendingCandidates = recruitment.filter(
      (candidate) =>
        ["pending", "applied"].includes(
          String(candidate.status || "")
            .toLowerCase()
        )
    ).length;

    const pendingPayroll = payroll.filter(
      (record) =>
        String(record.status || "")
          .toLowerCase() === "pending"
    ).length;

    const paidPayroll = payroll.filter(
      (record) =>
        String(record.status || "")
          .toLowerCase() === "paid"
    ).length;

    const totalPayroll = payroll.reduce(
      (sum, record) =>
        sum + getNumber(record.net_salary),
      0
    );

    const paidAmount = payroll
      .filter(
        (record) =>
          String(record.status || "")
            .toLowerCase() === "paid"
      )
      .reduce(
        (sum, record) =>
          sum + getNumber(record.net_salary),
        0
      );

    const pendingAmount = payroll
      .filter(
        (record) =>
          String(record.status || "")
            .toLowerCase() === "pending"
      )
      .reduce(
        (sum, record) =>
          sum + getNumber(record.net_salary),
        0
      );

    const totalDeductions = payroll.reduce(
      (sum, record) =>
        sum + getNumber(record.total_deductions),
      0
    );

    const totalEarnings = payroll.reduce(
      (sum, record) =>
        sum + getNumber(record.total_earnings),
      0
    );

    return {
      activeEmployees,
      presentAttendance,
      absentAttendance,
      lateAttendance,
      leaveAttendance,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalCandidates,
      hiredCandidates,
      pendingCandidates,
      pendingPayroll,
      paidPayroll,
      totalPayroll,
      paidAmount,
      pendingAmount,
      totalDeductions,
      totalEarnings,
    };
  }, [
    employees,
    attendance,
    leaves,
    recruitment,
    payroll,
  ]);

  const attendanceReport = useMemo(() => {
    return attendance.filter((record) => {
      if (attendanceFilter === "All") {
        return true;
      }

      return (
        String(record.status || "")
          .toLowerCase() ===
        attendanceFilter.toLowerCase()
      );
    });
  }, [attendance, attendanceFilter]);

  const payrollReport = useMemo(() => {
    return payroll.filter((record) => {
      if (payrollFilter === "All") {
        return true;
      }

      return (
        String(record.status || "")
          .toLowerCase() ===
        payrollFilter.toLowerCase()
      );
    });
  }, [payroll, payrollFilter]);

  const leaveReport = useMemo(() => {
    return leaves.filter((leave) => {
      if (leaveFilter === "All") {
        return true;
      }

      return (
        String(leave.status || "")
          .toLowerCase() ===
        leaveFilter.toLowerCase()
      );
    });
  }, [leaves, leaveFilter]);

  const recruitmentReport = useMemo(() => {
    return recruitment.filter((candidate) => {
      if (recruitmentFilter === "All") {
        return true;
      }

      return (
        String(candidate.status || "")
          .toLowerCase() ===
        recruitmentFilter.toLowerCase()
      );
    });
  }, [recruitment, recruitmentFilter]);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">
        <div>
          <span className="reports-eyebrow">
            HUMAN RESOURCES
          </span>

          <h1>HR Reports</h1>

          <p>
            Overview of employees, attendance,
            leave, recruitment and payroll.
          </p>
        </div>

        <button
          className="reports-refresh-button"
          onClick={loadReports}
        >
          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      {/* NAVIGATION */}

      <div className="reports-navigation">

        <button
          className={
            selectedSection === "overview"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedSection("overview")
          }
        >
          Overview
        </button>

        <button
          className={
            selectedSection === "employees"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedSection("employees")
          }
        >
          Employees
        </button>

        <button
          className={
            selectedSection === "attendance"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedSection("attendance")
          }
        >
          Attendance
        </button>

        <button
          className={
            selectedSection === "leave"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedSection("leave")
          }
        >
          Leave
        </button>

        <button
          className={
            selectedSection === "recruitment"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedSection("recruitment")
          }
        >
          Recruitment
        </button>

        <button
          className={
            selectedSection === "payroll"
              ? "active"
              : ""
          }
          onClick={() =>
            setSelectedSection("payroll")
          }
        >
          Payroll
        </button>

      </div>

      {/* OVERVIEW */}

      {selectedSection === "overview" && (
        <>

          <div className="reports-summary-grid">

            <div className="report-card">
              <span className="report-card-label">
                Active Employees
              </span>

              <strong>
                {statistics.activeEmployees}
              </strong>

              <small>
                Total employees:{" "}
                {employees.length}
              </small>
            </div>

            <div className="report-card">
              <span className="report-card-label">
                Present Attendance
              </span>

              <strong>
                {statistics.presentAttendance}
              </strong>

              <small>
                Present records
              </small>
            </div>

            <div className="report-card">
              <span className="report-card-label">
                Pending Leave
              </span>

              <strong>
                {statistics.pendingLeaves}
              </strong>

              <small>
                Approved:{" "}
                {statistics.approvedLeaves}
              </small>
            </div>

            <div className="report-card">
              <span className="report-card-label">
                Recruitment
              </span>

              <strong>
                {statistics.totalCandidates}
              </strong>

              <small>
                Selected/Hired:{" "}
                {statistics.hiredCandidates}
              </small>
            </div>

            <div className="report-card">
              <span className="report-card-label">
                Pending Payroll
              </span>

              <strong>
                {statistics.pendingPayroll}
              </strong>

              <small>
                Pending amount:{" "}
                {formatCurrency(
                  statistics.pendingAmount
                )}
              </small>
            </div>

            <div className="report-card">
              <span className="report-card-label">
                Net Payroll
              </span>

              <strong>
                {formatCurrency(
                  statistics.totalPayroll
                )}
              </strong>

              <small>
                Across all records
              </small>
            </div>

          </div>

          {/* ATTENDANCE SUMMARY */}

          <section className="reports-section">

            <div className="reports-section-header">
              <div>
                <span className="reports-section-label">
                  WORKFORCE
                </span>

                <h2>
                  Attendance Summary
                </h2>

                <p>
                  Overall attendance statistics.
                </p>
              </div>

              <span className="reports-count">
                {attendance.length} records
              </span>
            </div>

            <div className="reports-mini-grid">

              <div className="reports-mini-card">
                <span>Present</span>

                <strong>
                  {statistics.presentAttendance}
                </strong>
              </div>

              <div className="reports-mini-card">
                <span>Absent</span>

                <strong>
                  {statistics.absentAttendance}
                </strong>
              </div>

              <div className="reports-mini-card">
                <span>Late</span>

                <strong>
                  {statistics.lateAttendance}
                </strong>
              </div>

              <div className="reports-mini-card">
                <span>On Leave</span>

                <strong>
                  {statistics.leaveAttendance}
                </strong>
              </div>

            </div>

          </section>

          {/* PAYROLL SUMMARY */}

          <section className="reports-section">

            <div className="reports-section-header">
              <div>
                <span className="reports-section-label">
                  FINANCE
                </span>

                <h2>
                  Payroll Summary
                </h2>

                <p>
                  Earnings, deductions and
                  payment status.
                </p>
              </div>

              <span className="reports-count">
                {payroll.length} records
              </span>
            </div>

            <div className="reports-finance-grid">

              <div>
                <span>
                  Total Earnings
                </span>

                <strong>
                  {formatCurrency(
                    statistics.totalEarnings
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Total Deductions
                </span>

                <strong>
                  {formatCurrency(
                    statistics.totalDeductions
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Paid
                </span>

                <strong>
                  {formatCurrency(
                    statistics.paidAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Pending
                </span>

                <strong>
                  {formatCurrency(
                    statistics.pendingAmount
                  )}
                </strong>
              </div>

            </div>

          </section>

        </>
      )}

      {/* EMPLOYEES */}

      {selectedSection === "employees" && (
        <section className="reports-section">

          <div className="reports-section-header">
            <div>
              <span className="reports-section-label">
                HUMAN RESOURCES
              </span>

              <h2>
                Employee Overview
              </h2>

              <p>
                Current employee information.
              </p>
            </div>

            <span className="reports-count">
              {employees.length} records
            </span>
          </div>

          {employees.length === 0 ? (
            <div className="reports-empty">
              No employee records found.
            </div>
          ) : (
            <div className="reports-table-wrapper">

              <table className="reports-table">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {employees.map(
                    (employee) => (
                      <tr
                        key={employee.id}
                      >
                        <td>
                          <strong>
                            {employee.name ||
                              "—"}
                          </strong>
                        </td>

                        <td>
                          {employee.email ||
                            "—"}
                        </td>

                        <td>
                          {employee.department ||
                            "—"}
                        </td>

                        <td>
                          {employee.role ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              employee.status
                            )}`}
                          >
                            {employee.status ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      )}

      {/* ATTENDANCE */}

      {selectedSection === "attendance" && (
        <section className="reports-section">

          <div className="reports-section-header">
            <div>
              <span className="reports-section-label">
                WORKFORCE
              </span>

              <h2>
                Attendance Overview
              </h2>

              <p>
                Employee attendance records.
              </p>
            </div>

            <span className="reports-count">
              {attendanceReport.length} records
            </span>
          </div>

          <div className="reports-filter-bar">

            <select
              value={attendanceFilter}
              onChange={(event) =>
                setAttendanceFilter(
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
            </select>

          </div>

          {attendanceReport.length === 0 ? (
            <div className="reports-empty">
              No attendance records found.
            </div>
          ) : (
            <div className="reports-table-wrapper">

              <table className="reports-table">

                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {attendanceReport.map(
                    (record) => (
                      <tr
                        key={record.id}
                      >
                        <td>
                          <strong>
                            {getEmployeeName(
                              record.employee_id
                            )}
                          </strong>

                          <small className="table-secondary">
                            #{record.employee_id}
                          </small>
                        </td>

                        <td>
                          {formatDate(
                            record.date
                          )}
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
                          <span
                            className={`status-badge ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      )}

      {/* LEAVE */}

      {selectedSection === "leave" && (
        <section className="reports-section">

          <div className="reports-section-header">
            <div>
              <span className="reports-section-label">
                TIME OFF
              </span>

              <h2>
                Leave Overview
              </h2>

              <p>
                Employee leave request
                summary.
              </p>
            </div>

            <span className="reports-count">
              {leaveReport.length} requests
            </span>
          </div>

          <div className="reports-filter-bar">

            <select
              value={leaveFilter}
              onChange={(event) =>
                setLeaveFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>

          </div>

          {leaveReport.length === 0 ? (
            <div className="reports-empty">
              No leave requests found.
            </div>
          ) : (
            <div className="reports-table-wrapper">

              <table className="reports-table">

                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {leaveReport.map(
                    (leave) => (
                      <tr
                        key={leave.id}
                      >
                        <td>
                          <strong>
                            {getEmployeeName(
                              leave.employee_id
                            )}
                          </strong>

                          <small className="table-secondary">
                            #{leave.employee_id}
                          </small>
                        </td>

                        <td>
                          {leave.leave_type ||
                            leave.type ||
                            "—"}
                        </td>

                        <td>
                          {formatDate(
                            leave.start_date ||
                              leave.from_date
                          )}
                        </td>

                        <td>
                          {formatDate(
                            leave.end_date ||
                              leave.to_date
                          )}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              leave.status
                            )}`}
                          >
                            {leave.status ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      )}

      {/* RECRUITMENT */}

      {selectedSection === "recruitment" && (
        <section className="reports-section">

          <div className="reports-section-header">
            <div>
              <span className="reports-section-label">
                TALENT
              </span>

              <h2>
                Recruitment Overview
              </h2>

              <p>
                Candidate pipeline and
                recruitment status.
              </p>
            </div>

            <span className="reports-count">
              {recruitmentReport.length} candidates
            </span>
          </div>

          <div className="reports-filter-bar">

            <select
              value={recruitmentFilter}
              onChange={(event) =>
                setRecruitmentFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Applied">
                Applied
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Selected">
                Selected
              </option>

              <option value="Hired">
                Hired
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>

          </div>

          {recruitmentReport.length === 0 ? (
            <div className="reports-empty">
              No recruitment records found.
            </div>
          ) : (
            <div className="reports-table-wrapper">

              <table className="reports-table">

                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>

                <tbody>

                  {recruitmentReport.map(
                    (candidate) => (
                      <tr
                        key={candidate.id}
                      >
                        <td>
                          <strong>
                            {candidate.candidate_name ||
                              candidate.name ||
                              "—"}
                          </strong>
                        </td>

                        <td>
                          {candidate.position ||
                            "—"}
                        </td>

                        <td>
                          {candidate.department ||
                            "—"}
                        </td>

                        <td>
                          {candidate.experience ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              candidate.status ||
                                "Applied"
                            )}`}
                          >
                            {candidate.status ||
                              "Applied"}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            candidate.created_at
                          )}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      )}

      {/* PAYROLL */}

      {selectedSection === "payroll" && (
        <section className="reports-section">

          <div className="reports-section-header">
            <div>
              <span className="reports-section-label">
                FINANCE
              </span>

              <h2>
                Payroll Overview
              </h2>

              <p>
                Payroll, salary and payment
                information.
              </p>
            </div>

            <span className="reports-count">
              {payrollReport.length} records
            </span>
          </div>

          <div className="reports-filter-bar">

            <select
              value={payrollFilter}
              onChange={(event) =>
                setPayrollFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Paid">
                Paid
              </option>
            </select>

          </div>

          {payrollReport.length === 0 ? (
            <div className="reports-empty">
              No payroll records found.
            </div>
          ) : (
            <div className="reports-table-wrapper">

              <table className="reports-table">

                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Total Earnings</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {payrollReport.map(
                    (record) => (
                      <tr
                        key={record.id}
                      >
                        <td>
                          <strong>
                            {getEmployeeName(
                              record.employee_id
                            )}
                          </strong>

                          <small className="table-secondary">
                            #{record.employee_id}
                          </small>
                        </td>

                        <td>
                          {MONTHS[
                            Number(record.month) - 1
                          ] ||
                            record.month ||
                            "—"}{" "}
                          {record.year || ""}
                        </td>

                        <td>
                          {formatCurrency(
                            record.total_earnings
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            record.total_deductions
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              record.net_salary
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      )}

    </div>
  );
}