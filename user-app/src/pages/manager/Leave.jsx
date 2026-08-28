
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  X,
  Clock3,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

import "./Leave.css";


function ManagerLeave() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");


  // =========================================================
  // FETCH LEAVE REQUESTS
  // =========================================================

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/manager/leave/");

      setLeaveRequests(response.data || []);
    } catch (err) {
      console.error(
        "Failed to load manager leave requests:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load employee leave requests."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchLeaveRequests();
  }, []);


  // =========================================================
  // APPROVE / REJECT
  // =========================================================

  const updateLeaveStatus = async (
    leaveId,
    action
  ) => {
    try {
      setActionLoading(
        `${action}-${leaveId}`
      );

      setError("");
      setSuccess("");

      const endpoint =
        action === "approve"
          ? `/manager/leave/${leaveId}/approve`
          : `/manager/leave/${leaveId}/reject`;

      const response = await api.patch(endpoint);

      const updatedStatus =
        response.data?.status ||
        (action === "approve"
          ? "Approved"
          : "Rejected");

      setLeaveRequests((previous) =>
        previous.map((request) =>
          request.leave_id === leaveId
            ? {
                ...request,
                status: updatedStatus,
              }
            : request
        )
      );

      setSuccess(
        action === "approve"
          ? "Leave request approved successfully."
          : "Leave request rejected successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update leave status:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update leave request."
      );
    } finally {
      setActionLoading(null);
    }
  };


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return dateValue;
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
  // FILTERED REQUESTS
  // =========================================================

  const filteredRequests = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return leaveRequests.filter(
      (request) => {
        const status =
          request.status || "Pending";

        const matchesStatus =
          filter === "All" ||
          status.toLowerCase() ===
            filter.toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          request.employee_name
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          request.employee_email
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          request.team_name
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          request.department
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          request.leave_type
            ?.toLowerCase()
            .includes(normalizedSearch);

        return (
          matchesStatus &&
          matchesSearch
        );
      }
    );
  }, [
    leaveRequests,
    filter,
    search,
  ]);


  // =========================================================
  // SUMMARY
  // =========================================================

  const totalRequests =
    leaveRequests.length;

  const pendingRequests =
    leaveRequests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "pending"
    ).length;

  const approvedRequests =
    leaveRequests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "approved"
    ).length;

  const rejectedRequests =
    leaveRequests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "rejected"
    ).length;


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="manager-leave-page">

        <div className="manager-leave-loading">

          <RefreshCw
            size={22}
            className="manager-leave-spin"
          />

          <span>
            Loading employee leave requests...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="manager-leave-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="manager-leave-header">

        <div>

          <span className="manager-leave-eyebrow">
            MANAGER WORKSPACE
          </span>

          <h1>
            Leave Management
          </h1>

          <p>
            Review and manage leave requests
            submitted by employees in your
            organization.
          </p>

        </div>

        <button
          type="button"
          className="manager-leave-refresh-btn"
          onClick={fetchLeaveRequests}
          disabled={loading}
        >
          <RefreshCw size={15} />

          Refresh
        </button>

      </header>


      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="manager-leave-alert success">

          <CheckCircle2 size={17} />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={15} />
          </button>

        </div>
      )}


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="manager-leave-alert error">

          <XCircle size={17} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>

        </div>
      )}


      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <section className="manager-leave-summary">

        <div className="manager-leave-summary-card">

          <div className="manager-leave-summary-icon total">
            <FileText size={19} />
          </div>

          <div>
            <span>
              Total Requests
            </span>

            <strong>
              {totalRequests}
            </strong>
          </div>

        </div>


        <div className="manager-leave-summary-card">

          <div className="manager-leave-summary-icon pending">
            <Clock3 size={19} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingRequests}
            </strong>
          </div>

        </div>


        <div className="manager-leave-summary-card">

          <div className="manager-leave-summary-icon approved">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>
              Approved
            </span>

            <strong>
              {approvedRequests}
            </strong>
          </div>

        </div>


        <div className="manager-leave-summary-card">

          <div className="manager-leave-summary-icon rejected">
            <XCircle size={19} />
          </div>

          <div>
            <span>
              Rejected
            </span>

            <strong>
              {rejectedRequests}
            </strong>
          </div>

        </div>

      </section>


      {/* =====================================================
          REQUESTS CARD
      ====================================================== */}

      <section className="manager-leave-card">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="manager-leave-card-header">

          <div>

            <div className="manager-leave-title-row">

              <div className="manager-leave-title-icon">
                <Users size={18} />
              </div>

              <h2>
                Employee Leave Requests
              </h2>

            </div>

            <p>
              Approve or reject pending employee
              leave requests.
            </p>

          </div>

          <div className="manager-leave-count">

            <strong>
              {filteredRequests.length}
            </strong>

            <span>
              Showing
            </span>

          </div>

        </div>


        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <div className="manager-leave-toolbar">

          <div className="manager-leave-search">

            <Users size={16} />

            <input
              type="text"
              placeholder="Search employee, team, department..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <div className="manager-leave-filters">

            {[
              "All",
              "Pending",
              "Approved",
              "Rejected",
            ].map((status) => (
              <button
                key={status}
                type="button"
                className={
                  filter === status
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(status)
                }
              >
                {status}
              </button>
            ))}

          </div>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="manager-leave-table-wrapper">

          <table className="manager-leave-table">

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Team
                </th>

                <th>
                  Leave
                </th>

                <th>
                  Dates
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

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredRequests.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="manager-leave-empty-cell"
                  >

                    <div className="manager-leave-empty">

                      <CalendarDays size={30} />

                      <strong>
                        No leave requests found
                      </strong>

                      <span>
                        There are no requests matching
                        the current filters.
                      </span>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredRequests.map(
                  (request) => {

                    const status =
                      request.status ||
                      "Pending";

                    const normalizedStatus =
                      status.toLowerCase();

                    const isPending =
                      normalizedStatus ===
                      "pending";

                    const approveLoading =
                      actionLoading ===
                      `approve-${request.leave_id}`;

                    const rejectLoading =
                      actionLoading ===
                      `reject-${request.leave_id}`;

                    return (
                      <tr
                        key={request.leave_id}
                      >

                        {/* EMPLOYEE */}

                        <td>

                          <div className="manager-leave-employee">

                            <div className="manager-leave-avatar">
                              {(
                                request.employee_name ||
                                "E"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {
                                  request.employee_name ||
                                  "Unknown Employee"
                                }
                              </strong>

                              <span>
                                {
                                  request.employee_email ||
                                  "—"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* TEAM */}

                        <td>

                          <div className="manager-leave-team">

                            <strong>
                              {
                                request.team_name ||
                                "Unassigned"
                              }
                            </strong>

                            <span>
                              {
                                request.department ||
                                "No department"
                              }
                            </span>

                          </div>

                        </td>


                        {/* LEAVE TYPE */}

                        <td>

                          <span className="manager-leave-type">
                            {
                              request.leave_type ||
                              "—"
                            }
                          </span>

                        </td>


                        {/* DATES */}

                        <td>

                          <div className="manager-leave-dates">

                            <span>
                              {formatDate(
                                request.start_date
                              )}
                            </span>

                            <small>
                              to
                            </small>

                            <span>
                              {formatDate(
                                request.end_date
                              )}
                            </span>

                          </div>

                        </td>


                        {/* DURATION */}

                        <td>

                          <span className="manager-leave-duration">

                            {request.total_days || 0}

                            <small>
                              {
                                request.total_days ===
                                1
                                  ? "day"
                                  : "days"
                              }
                            </small>

                          </span>

                        </td>


                        {/* REASON */}

                        <td>

                          <span className="manager-leave-reason">

                            {
                              request.reason ||
                              "No reason provided"
                            }

                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`manager-leave-status ${normalizedStatus}`}
                          >

                            <span className="manager-leave-status-dot" />

                            {status}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          {isPending ? (

                            <div className="manager-leave-actions">

                              <button
                                type="button"
                                className="manager-leave-approve"
                                title="Approve leave"
                                disabled={
                                  actionLoading !==
                                  null
                                }
                                onClick={() =>
                                  updateLeaveStatus(
                                    request.leave_id,
                                    "approve"
                                  )
                                }
                              >

                                {approveLoading ? (
                                  <RefreshCw
                                    size={14}
                                    className="manager-leave-spin"
                                  />
                                ) : (
                                  <Check
                                    size={14}
                                  />
                                )}

                                Approve

                              </button>


                              <button
                                type="button"
                                className="manager-leave-reject"
                                title="Reject leave"
                                disabled={
                                  actionLoading !==
                                  null
                                }
                                onClick={() =>
                                  updateLeaveStatus(
                                    request.leave_id,
                                    "reject"
                                  )
                                }
                              >

                                {rejectLoading ? (
                                  <RefreshCw
                                    size={14}
                                    className="manager-leave-spin"
                                  />
                                ) : (
                                  <X
                                    size={14}
                                  />
                                )}

                                Reject

                              </button>

                            </div>

                          ) : (

                            <span className="manager-leave-action-done">
                              {normalizedStatus ===
                              "approved"
                                ? "Completed"
                                : "Closed"}
                            </span>

                          )}

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


export default ManagerLeave;