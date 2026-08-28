import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

import "./MyLeave.css";


function MyLeave() {
  const [leaves, setLeaves] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    leave_type: "Casual Leave",
    start_date: "",
    end_date: "",
    reason: "",
  });


  // =========================================================
  // LOAD MY LEAVE
  // =========================================================

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leave/me");

      setLeaves(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "MY LEAVE LOAD ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load your leave requests."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadLeaves();
  }, []);


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
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      leave_type: "Casual Leave",
      start_date: "",
      end_date: "",
      reason: "",
    });
  };


  // =========================================================
  // SUBMIT LEAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.start_date) {
      setError("Please select a start date.");
      return;
    }

    if (!form.end_date) {
      setError("Please select an end date.");
      return;
    }

    if (
      new Date(form.end_date) <
      new Date(form.start_date)
    ) {
      setError(
        "End date cannot be before the start date."
      );
      return;
    }

    try {
      setSaving(true);

      await api.post("/leave/me", {
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason || null,
      });

      setSuccess(
        "Leave request submitted successfully."
      );

      setShowModal(false);

      resetForm();

      await loadLeaves();
    } catch (err) {
      console.error(
        "SUBMIT LEAVE ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to submit leave request."
      );
    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const pending = leaves.filter(
      (leave) =>
        leave.status?.toLowerCase() === "pending"
    ).length;

    const approved = leaves.filter(
      (leave) =>
        leave.status?.toLowerCase() === "approved"
    ).length;

    const rejected = leaves.filter(
      (leave) =>
        leave.status?.toLowerCase() === "rejected"
    ).length;

    return {
      total: leaves.length,
      pending,
      approved,
      rejected,
    };
  }, [leaves]);


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(
      `${value}T00:00:00`
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
  // STATUS
  // =========================================================

  const getStatusClass = (status) => {
    switch (
      status?.toLowerCase()
    ) {
      case "approved":
        return "my-leave-status-approved";

      case "rejected":
        return "my-leave-status-rejected";

      case "pending":
        return "my-leave-status-pending";

      default:
        return "my-leave-status-other";
    }
  };


  const getStatusIcon = (status) => {
    switch (
      status?.toLowerCase()
    ) {
      case "approved":
        return <CheckCircle2 size={15} />;

      case "rejected":
        return <XCircle size={15} />;

      case "pending":
        return <Clock3 size={15} />;

      default:
        return <FileText size={15} />;
    }
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="my-leave-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="my-leave-header">

        <div>
          <span className="my-leave-eyebrow">
            MY WORKSPACE
          </span>

          <h1>
            My Leave
          </h1>

          <p>
            Submit and track your personal leave
            requests.
          </p>
        </div>


        <div className="my-leave-header-actions">

          <button
            type="button"
            className="my-leave-refresh-button"
            onClick={loadLeaves}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "my-leave-refresh-spin"
                  : ""
              }
            />

            Refresh
          </button>


          <button
            type="button"
            className="my-leave-add-button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowModal(true);
            }}
          >
            <Plus size={18} />

            Apply Leave
          </button>

        </div>

      </div>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (
        <div className="my-leave-message my-leave-error">
          {error}
        </div>
      )}

      {success && (
        <div className="my-leave-message my-leave-success">
          {success}
        </div>
      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="my-leave-summary-grid">

        <div className="my-leave-summary-card">

          <div className="my-leave-summary-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>
              Total Requests
            </span>

            <strong>
              {summary.total}
            </strong>
          </div>

        </div>


        <div className="my-leave-summary-card">

          <div className="my-leave-summary-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {summary.pending}
            </strong>
          </div>

        </div>


        <div className="my-leave-summary-card">

          <div className="my-leave-summary-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>
              Approved
            </span>

            <strong>
              {summary.approved}
            </strong>
          </div>

        </div>


        <div className="my-leave-summary-card">

          <div className="my-leave-summary-icon">
            <XCircle size={19} />
          </div>

          <div>
            <span>
              Rejected
            </span>

            <strong>
              {summary.rejected}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="my-leave-table-card">

        <div className="my-leave-table-header">

          <div>
            <span className="my-leave-section-label">
              LEAVE HISTORY
            </span>

            <h2>
              My Leave Requests
            </h2>
          </div>

          <span className="my-leave-record-count">
            {leaves.length} request
            {leaves.length === 1
              ? ""
              : "s"}
          </span>

        </div>


        {loading ? (
          <div className="my-leave-state">

            <div className="my-leave-spinner" />

            <p>
              Loading your leave requests...
            </p>

          </div>
        ) : leaves.length === 0 ? (
          <div className="my-leave-state">

            <div className="my-leave-empty-icon">
              <CalendarDays size={28} />
            </div>

            <h3>
              No leave requests
            </h3>

            <p>
              You have not submitted any leave
              requests yet.
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowModal(true);
              }}
            >
              Apply for Leave
            </button>

          </div>
        ) : (
          <div className="my-leave-table-wrapper">

            <table className="my-leave-table">

              <thead>
                <tr>
                  <th>
                    Leave Type
                  </th>

                  <th>
                    Start Date
                  </th>

                  <th>
                    End Date
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>


              <tbody>

                {leaves.map((leave) => (
                  <tr key={leave.id}>

                    <td>
                      <div className="my-leave-type-cell">

                        <div className="my-leave-type-icon">
                          <CalendarDays size={17} />
                        </div>

                        <strong>
                          {leave.leave_type}
                        </strong>

                      </div>
                    </td>


                    <td>
                      {formatDate(
                        leave.start_date
                      )}
                    </td>


                    <td>
                      {formatDate(
                        leave.end_date
                      )}
                    </td>


                    <td>
                      <span className="my-leave-reason">
                        {leave.reason || "—"}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`my-leave-status ${getStatusClass(
                          leave.status
                        )}`}
                      >

                        {getStatusIcon(
                          leave.status
                        )}

                        {leave.status || "Unknown"}

                      </span>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* =====================================================
          APPLY LEAVE MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="my-leave-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowModal(false);
            }
          }}
        >

          <div className="my-leave-modal">

            <div className="my-leave-modal-header">

              <div>
                <span>
                  MY WORKSPACE
                </span>

                <h2>
                  Apply for Leave
                </h2>
              </div>


              <button
                type="button"
                className="my-leave-modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
            >

              <div className="my-leave-form-group">

                <label>
                  Leave Type
                </label>

                <select
                  value={form.leave_type}
                  onChange={(event) =>
                    updateForm(
                      "leave_type",
                      event.target.value
                    )
                  }
                >
                  <option value="Casual Leave">
                    Casual Leave
                  </option>

                  <option value="Sick Leave">
                    Sick Leave
                  </option>

                  <option value="Earned Leave">
                    Earned Leave
                  </option>

                  <option value="Emergency Leave">
                    Emergency Leave
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>


              <div className="my-leave-form-row">

                <div className="my-leave-form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(event) =>
                      updateForm(
                        "start_date",
                        event.target.value
                      )
                    }
                    required
                  />

                </div>


                <div className="my-leave-form-group">

                  <label>
                    End Date
                  </label>

                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(event) =>
                      updateForm(
                        "end_date",
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              <div className="my-leave-form-group">

                <label>
                  Reason
                </label>

                <textarea
                  rows="4"
                  placeholder="Enter the reason for your leave..."
                  value={form.reason}
                  onChange={(event) =>
                    updateForm(
                      "reason",
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="my-leave-modal-actions">

                <button
                  type="button"
                  className="my-leave-cancel-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="my-leave-submit-button"
                  disabled={saving}
                >
                  {saving
                    ? "Submitting..."
                    : "Submit Leave"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


export default MyLeave;