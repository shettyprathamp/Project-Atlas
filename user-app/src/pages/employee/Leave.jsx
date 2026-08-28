import { useEffect, useState } from "react";
import "./Leave.css";

import api from "../../services/api";

export default function Leave() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // =========================================================
  // FETCH LEAVE
  // =========================================================

  const fetchLeave = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employee/leave");

      setLeaveRequests(response.data || []);
    } catch (err) {
      console.error("Failed to load leave:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load leave information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchLeave();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // APPLY LEAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.leave_type) {
      setError("Please select a leave type.");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError("Please select the start and end date.");
      return;
    }

    if (formData.start_date > formData.end_date) {
      setError("Start date cannot be after end date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/employee/leave", {
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason.trim() || null,
      });

      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setShowForm(false);

      await fetchLeave();
    } catch (err) {
      console.error("Leave application failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // DURATION
  // =========================================================

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "—";
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "—";
    }

    const difference =
      Math.round(
        (end - start) / (1000 * 60 * 60 * 24)
      ) + 1;

    return `${difference} ${
      difference === 1 ? "Day" : "Days"
    }`;
  };

  // =========================================================
  // LEAVE SUMMARY
  // =========================================================

  const totalRequests = leaveRequests.length;

  const approvedRequests = leaveRequests.filter(
    (request) =>
      request.status?.toLowerCase() === "approved"
  ).length;

  const pendingRequests = leaveRequests.filter(
    (request) =>
      request.status?.toLowerCase() === "pending"
  ).length;

  const rejectedRequests = leaveRequests.filter(
    (request) =>
      request.status?.toLowerCase() === "rejected"
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="employee-leave-page">
        <div className="employee-leave-header">
          <div>
            <span className="employee-leave-eyebrow">
              EMPLOYEE
            </span>

            <h1>Leave</h1>

            <p>
              Loading your leave information...
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
    <div className="employee-leave-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="employee-leave-header">

        <div>
          <span className="employee-leave-eyebrow">
            EMPLOYEE
          </span>

          <h1>Leave</h1>

          <p>
            Manage your leave requests and apply for
            time off.
          </p>
        </div>

        <button
          className="employee-leave-primary-btn"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <span>+</span>
          Apply for Leave
        </button>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

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
          REAL SUMMARY
      ====================================================== */}

      <section className="employee-leave-section">

        <div className="employee-leave-section-header">
          <div>
            <h2>Leave Overview</h2>

            <p>
              Based on your actual leave requests.
            </p>
          </div>
        </div>

        <div className="employee-leave-balance-grid">

          <div className="employee-leave-balance-card annual">

            <div className="employee-leave-balance-top">
              <div className="employee-leave-balance-icon">
                T
              </div>

              <span>Total Requests</span>
            </div>

            <div className="employee-leave-balance-number">
              <strong>{totalRequests}</strong>

              <small>
                submitted requests
              </small>
            </div>

          </div>

          <div className="employee-leave-balance-card sick">

            <div className="employee-leave-balance-top">
              <div className="employee-leave-balance-icon">
                A
              </div>

              <span>Approved</span>
            </div>

            <div className="employee-leave-balance-number">
              <strong>{approvedRequests}</strong>

              <small>
                approved requests
              </small>
            </div>

          </div>

          <div className="employee-leave-balance-card casual">

            <div className="employee-leave-balance-top">
              <div className="employee-leave-balance-icon">
                P
              </div>

              <span>Pending</span>
            </div>

            <div className="employee-leave-balance-number">
              <strong>{pendingRequests}</strong>

              <small>
                awaiting approval
              </small>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          APPLY FORM
      ====================================================== */}

      {showForm && (
        <section className="employee-leave-apply-card">

          <div className="employee-leave-apply-content">

            <div className="employee-leave-apply-icon">
              +
            </div>

            <div>
              <h2>Apply for Leave</h2>

              <p>
                Submit your leave request to your manager.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: "20px",
              display: "grid",
              gap: "14px",
            }}
          >

            <div>
              <label>
                Leave Type
              </label>

              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select leave type
                </option>

                <option value="Annual Leave">
                  Annual Leave
                </option>

                <option value="Sick Leave">
                  Sick Leave
                </option>

                <option value="Casual Leave">
                  Casual Leave
                </option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "14px",
              }}
            >

              <div>
                <label>
                  Start Date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>
                  End Date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div>
              <label>
                Reason
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for leave"
                rows="4"
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >

              <button
                type="submit"
                className="employee-leave-primary-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Leave"}
              </button>

              <button
                type="button"
                className="employee-leave-secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                disabled={submitting}
              >
                Cancel
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =====================================================
          LEAVE REQUESTS
      ====================================================== */}

      <section className="employee-leave-requests-card">

        <div className="employee-leave-requests-header">

          <div>
            <h2>Leave Requests</h2>

            <p>
              Your actual submitted leave requests.
            </p>
          </div>

          <div className="employee-leave-request-count">

            <strong>
              {totalRequests}
            </strong>

            <span>
              Requests
            </span>

          </div>

        </div>

        <div className="employee-leave-table-wrapper">

          <table className="employee-leave-table">

            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {leaveRequests.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No leave requests found.
                  </td>
                </tr>

              ) : (

                leaveRequests.map((request) => {

                  const status =
                    request.status || "Pending";

                  return (
                    <tr key={request.id}>

                      <td>
                        <strong className="employee-leave-type">
                          {request.leave_type || "—"}
                        </strong>
                      </td>

                      <td>
                        {formatDate(
                          request.start_date
                        )}
                      </td>

                      <td>
                        {formatDate(
                          request.end_date
                        )}
                      </td>

                      <td>
                        {calculateDays(
                          request.start_date,
                          request.end_date
                        )}
                      </td>

                      <td className="employee-leave-reason">
                        {request.reason || "—"}
                      </td>

                      <td>

                        <span
                          className={`employee-leave-status ${status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <span className="employee-leave-status-dot" />

                          {status}
                        </span>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}