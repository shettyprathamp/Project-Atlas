
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Leave.css";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        leaveResponse,
        employeeResponse,
      ] = await Promise.all([
        api.get("/leave/"),
        api.get("/employees/"),
      ]);

      setLeaves(leaveResponse.data);
      setEmployees(employeeResponse.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load leave data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getEmployee(employeeId) {
    return employees.find(
      (employee) =>
        employee.id === employeeId
    );
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClass(status) {
    const value =
      status?.toLowerCase();

    if (value === "approved") {
      return "leave-badge leave-approved";
    }

    if (value === "rejected") {
      return "leave-badge leave-rejected";
    }

    return "leave-badge leave-pending";
  }

  async function updateStatus(id, status) {
    try {
      setError("");

      await api.put(`/leave/${id}`, {
        status,
      });

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to update leave request."
      );
    }
  }

  async function deleteLeave(id) {
    const confirmed = window.confirm(
      "Delete this leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/leave/${id}`);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete leave request."
      );
    }
  }

  const pendingCount = leaves.filter(
    (leave) =>
      leave.status?.toLowerCase() ===
      "pending"
  ).length;

  const approvedCount = leaves.filter(
    (leave) =>
      leave.status?.toLowerCase() ===
      "approved"
  ).length;

  const rejectedCount = leaves.filter(
    (leave) =>
      leave.status?.toLowerCase() ===
      "rejected"
  ).length;

  const filteredLeaves = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return leaves.filter((leave) => {
      const employee = getEmployee(
        leave.employee_id
      );

      const matchesFilter =
        filter === "All" ||
        leave.status === filter;

      const matchesSearch =
        !query ||
        employee?.name
          ?.toLowerCase()
          .includes(query) ||
        employee?.email
          ?.toLowerCase()
          .includes(query) ||
        leave.leave_type
          ?.toLowerCase()
          .includes(query);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [
    leaves,
    employees,
    filter,
    search,
  ]);

  const selectedEmployeeData =
    selectedEmployee
      ? getEmployee(selectedEmployee)
      : null;

  const selectedHistory = selectedEmployee
    ? leaves
        .filter(
          (leave) =>
            leave.employee_id ===
            selectedEmployee
        )
        .sort((a, b) =>
          String(
            b.start_date
          ).localeCompare(
            String(a.start_date)
          )
        )
    : [];

  return (
    <div className="leave-command-page">

      {/* =====================================
          TOP HEADER
      ===================================== */}

      <header className="leave-command-header">

        <div>

          <div className="leave-command-kicker">
            PEOPLE OPERATIONS
          </div>

          <h1>
            Leave Management
          </h1>

          <p>
            Review time-off requests, approve
            absences and monitor employee leave
            history.
          </p>

        </div>

        <div className="leave-header-date">

          <span>
            Today
          </span>

          <strong>
            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}
          </strong>

        </div>

      </header>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="leave-command-error">

          <span>!</span>

          {error}

        </div>
      )}

      {/* =====================================
          METRICS
      ===================================== */}

      <section className="leave-metrics">

        <div className="leave-metric-card">

          <div className="leave-metric-icon pending-icon">
            ⏳
          </div>

          <div>

            <span>
              Awaiting Review
            </span>

            <strong>
              {pendingCount}
            </strong>

            <small>
              Pending requests
            </small>

          </div>

        </div>

        <div className="leave-metric-card">

          <div className="leave-metric-icon approved-icon">
            ✓
          </div>

          <div>

            <span>
              Approved
            </span>

            <strong>
              {approvedCount}
            </strong>

            <small>
              Accepted requests
            </small>

          </div>

        </div>

        <div className="leave-metric-card">

          <div className="leave-metric-icon rejected-icon">
            ×
          </div>

          <div>

            <span>
              Rejected
            </span>

            <strong>
              {rejectedCount}
            </strong>

            <small>
              Declined requests
            </small>

          </div>

        </div>

        <div className="leave-metric-card">

          <div className="leave-metric-icon total-icon">
            #
          </div>

          <div>

            <span>
              Total Requests
            </span>

            <strong>
              {leaves.length}
            </strong>

            <small>
              All leave requests
            </small>

          </div>

        </div>

      </section>

      {/* =====================================
          MAIN WORKSPACE
      ===================================== */}

      <section className="leave-command-workspace">

        {/* ===================================
            REQUESTS PANEL
        =================================== */}

        <div className="leave-request-panel">

          <div className="leave-panel-heading">

            <div>

              <span>
                REQUEST QUEUE
              </span>

              <h2>
                Leave Requests
              </h2>

            </div>

            <div className="leave-request-count">
              {filteredLeaves.length}
            </div>

          </div>

          {/* SEARCH */}

          <div className="leave-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search employee or leave type..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          {/* FILTER */}

          <div className="leave-filters">

            {[
              "All",
              "Pending",
              "Approved",
              "Rejected",
            ].map((status) => (
              <button
                key={status}
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

          {/* REQUEST LIST */}

          <div className="leave-request-feed">

            {loading ? (
              <div className="leave-loading">

                <div className="leave-loading-circle" />

                <strong>
                  Loading requests
                </strong>

                <span>
                  Fetching leave information...
                </span>

              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="leave-no-results">

                <div>
                  ✓
                </div>

                <h3>
                  No requests found
                </h3>

                <p>
                  There are no leave requests
                  matching your current filters.
                </p>

              </div>
            ) : (
              filteredLeaves.map(
                (leave) => {

                  const employee =
                    getEmployee(
                      leave.employee_id
                    );

                  const isSelected =
                    selectedEmployee ===
                    leave.employee_id;

                  return (
                    <button
                      key={leave.id}
                      className={`leave-feed-item ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedEmployee(
                          leave.employee_id
                        )
                      }
                    >

                      <div className="leave-feed-avatar">

                        {employee?.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "E"}

                      </div>

                      <div className="leave-feed-content">

                        <div className="leave-feed-top">

                          <strong>
                            {employee?.name ||
                              `Employee #${leave.employee_id}`}
                          </strong>

                          <span
                            className={getStatusClass(
                              leave.status
                            )}
                          >
                            {leave.status}
                          </span>

                        </div>

                        <span className="leave-feed-type">
                          {leave.leave_type}
                        </span>

                        <div className="leave-feed-date">

                          <span>
                            {formatDate(
                              leave.start_date
                            )}
                          </span>

                          <span>
                            →
                          </span>

                          <span>
                            {formatDate(
                              leave.end_date
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="leave-feed-arrow">
                        →
                      </div>

                    </button>
                  );
                }
              )
            )}

          </div>

        </div>

        {/* ===================================
            DETAILS PANEL
        =================================== */}

        <aside className="leave-profile-panel">

          {!selectedEmployee ? (
            <div className="leave-profile-empty">

              <div className="leave-empty-symbol">
                L
              </div>

              <h3>
                Employee details
              </h3>

              <p>
                Select a request from the queue
                to view the employee's complete
                leave history.
              </p>

            </div>
          ) : (
            <>

              {/* PROFILE */}

              <div className="leave-profile">

                <div className="leave-profile-avatar">

                  {selectedEmployeeData?.name
                    ?.charAt(0)
                    .toUpperCase() ||
                    "E"}

                </div>

                <div>

                  <span>
                    EMPLOYEE
                  </span>

                  <h2>
                    {selectedEmployeeData?.name ||
                      `Employee #${selectedEmployee}`}
                  </h2>

                  <p>
                    {selectedEmployeeData?.department ||
                      "No department"}
                  </p>

                </div>

              </div>

              {/* EMPLOYEE INFO */}

              <div className="leave-profile-info">

                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedEmployeeData?.email ||
                      "Not available"}
                  </strong>

                </div>

                <div>

                  <span>
                    Role
                  </span>

                  <strong>
                    {selectedEmployeeData?.role ||
                      "Not available"}
                  </strong>

                </div>

              </div>

              {/* HISTORY HEADER */}

              <div className="leave-history-heading">

                <div>

                  <span>
                    HISTORY
                  </span>

                  <h3>
                    Leave Activity
                  </h3>

                </div>

                <strong>
                  {selectedHistory.length}
                </strong>

              </div>

              {/* HISTORY */}

              <div className="leave-history-feed">

                {selectedHistory.map(
                  (leave) => (
                    <article
                      key={leave.id}
                      className="leave-history-item"
                    >

                      <div className="leave-history-marker">
                        <span />
                      </div>

                      <div className="leave-history-body">

                        <div className="leave-history-top">

                          <div>

                            <strong>
                              {leave.leave_type}
                            </strong>

                            <span>
                              {formatDate(
                                leave.start_date
                              )}{" "}
                              →{" "}
                              {formatDate(
                                leave.end_date
                              )}
                            </span>

                          </div>

                          <span
                            className={getStatusClass(
                              leave.status
                            )}
                          >
                            {leave.status}
                          </span>

                        </div>

                        {leave.reason && (
                          <p>
                            {leave.reason}
                          </p>
                        )}

                        <div className="leave-history-actions">

                          {leave.status ===
                            "Pending" && (
                            <>

                              <button
                                className="leave-approve"
                                onClick={() =>
                                  updateStatus(
                                    leave.id,
                                    "Approved"
                                  )
                                }
                              >
                                ✓ Approve
                              </button>

                              <button
                                className="leave-reject"
                                onClick={() =>
                                  updateStatus(
                                    leave.id,
                                    "Rejected"
                                  )
                                }
                              >
                                × Reject
                              </button>

                            </>
                          )}

                          <button
                            className="leave-remove"
                            onClick={() =>
                              deleteLeave(
                                leave.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </article>
                  )
                )}

              </div>

            </>
          )}

        </aside>

      </section>

    </div>
  );
}