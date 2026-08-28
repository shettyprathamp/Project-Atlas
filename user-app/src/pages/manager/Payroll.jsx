import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CircleCheck,
  CircleX,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import api from "../../services/api";

import "./Payroll.css";


// =========================================================
// HELPERS
// =========================================================

function formatMoney(value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}


function formatMonth(month, year) {
  if (!month || !year) {
    return "—";
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function getStatusClass(status) {
  const value = status?.toLowerCase();

  if (value === "approved") {
    return "manager-payroll-status-approved";
  }

  if (value === "rejected") {
    return "manager-payroll-status-rejected";
  }

  if (value === "pending") {
    return "manager-payroll-status-pending";
  }

  if (value === "paid") {
    return "manager-payroll-status-paid";
  }

  return "manager-payroll-status-default";
}


// =========================================================
// EDITABLE PAYROLL FIELDS
// =========================================================

const CHANGEABLE_FIELDS = [
  {
    value: "basic_salary",
    label: "Basic Salary",
  },
  {
    value: "allowances",
    label: "Allowances",
  },
  {
    value: "bonus",
    label: "Bonus",
  },
  {
    value: "overtime",
    label: "Overtime",
  },
  {
    value: "other_earnings",
    label: "Other Earnings",
  },
  {
    value: "tax_deduction",
    label: "Tax Deduction",
  },
  {
    value: "provident_fund",
    label: "Provident Fund",
  },
  {
    value: "other_deductions",
    label: "Other Deductions",
  },
];


// =========================================================
// PAGE
// =========================================================

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [requestError, setRequestError] =
    useState("");

  const [search, setSearch] = useState("");
  const [requestFilter, setRequestFilter] =
    useState("Pending");

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [selectedPayroll, setSelectedPayroll] =
    useState(null);

  const [fieldName, setFieldName] =
    useState("basic_salary");

  const [proposedValue, setProposedValue] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [creatingRequest, setCreatingRequest] =
    useState(false);


  // =======================================================
  // FETCH PAYROLL
  // =======================================================

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/payroll/"
      );

      setPayroll(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load payroll:",
        err
      );

      setPayroll([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load payroll records."
      );
    } finally {
      setLoading(false);
    }
  };


  // =======================================================
  // FETCH EMPLOYEES
  // =======================================================

  const fetchEmployees = async () => {
    try {
      const response = await api.get(
        "/employees/"
      );

      setEmployees(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load employees:",
        err
      );

      setEmployees([]);
    }
  };


  // =======================================================
  // FETCH REQUESTS
  // =======================================================

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestError("");

      const response = await api.get(
        "/manager/payroll-requests"
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load payroll requests:",
        err
      );

      setRequests([]);

      setRequestError(
        err.response?.data?.detail ||
          "Unable to load your payroll requests."
      );
    } finally {
      setRequestsLoading(false);
    }
  };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchPayroll();
    fetchEmployees();
    fetchRequests();
  }, []);


  // =======================================================
  // EMPLOYEE MAP
  // =======================================================

  const employeeMap = useMemo(() => {
    const map = {};

    employees.forEach((employee) => {
      map[employee.id] = employee;
    });

    return map;
  }, [employees]);


  // =======================================================
  // EMPLOYEE NAME
  // =======================================================

  const getEmployeeName = (employeeId) => {
    const employee =
      employeeMap[employeeId];

    return (
      employee?.name ||
      `Employee #${employeeId}`
    );
  };


  // =======================================================
  // FILTER PAYROLL
  // =======================================================

  const filteredPayroll = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return payroll;
    }

    return payroll.filter((record) => {
      const employee =
        employeeMap[record.employee_id];

      return (
        String(record.employee_id)
          .includes(value) ||
        employee?.name
          ?.toLowerCase()
          .includes(value) ||
        employee?.email
          ?.toLowerCase()
          .includes(value) ||
        formatMonth(
          record.month,
          record.year
        )
          .toLowerCase()
          .includes(value)
      );
    });
  }, [
    payroll,
    employeeMap,
    search,
  ]);


  // =======================================================
  // REQUEST FILTER
  // =======================================================

  const filteredRequests = useMemo(() => {
    if (requestFilter === "All") {
      return requests;
    }

    return requests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        requestFilter.toLowerCase()
    );
  }, [
    requests,
    requestFilter,
  ]);


  // =======================================================
  // REQUEST COUNTS
  // =======================================================

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "pending"
    ).length;

  const approvedRequests =
    requests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "approved"
    ).length;

  const rejectedRequests =
    requests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "rejected"
    ).length;


  // =======================================================
  // OPEN REQUEST MODAL
  // =======================================================

  const openRequestModal = (record) => {
    setSelectedPayroll(record);

    setFieldName("basic_salary");

    setProposedValue(
      String(
        Number(record.basic_salary || 0)
      )
    );

    setReason("");

    setRequestError("");

    setShowRequestModal(true);
  };


  // =======================================================
  // CLOSE REQUEST MODAL
  // =======================================================

  const closeRequestModal = () => {
    if (creatingRequest) {
      return;
    }

    setShowRequestModal(false);
    setSelectedPayroll(null);
    setFieldName("basic_salary");
    setProposedValue("");
    setReason("");
  };


  // =======================================================
  // CURRENT FIELD VALUE
  // =======================================================

  const currentFieldValue =
    selectedPayroll
      ? Number(
          selectedPayroll[fieldName] || 0
        )
      : 0;


  // =======================================================
  // CREATE REQUEST
  // =======================================================

  const createRequest = async () => {
    if (!selectedPayroll) {
      return;
    }

    const numericValue =
      Number(proposedValue);

    if (
      Number.isNaN(numericValue) ||
      numericValue < 0
    ) {
      setRequestError(
        "Please enter a valid proposed value."
      );

      return;
    }

    if (!reason.trim()) {
      setRequestError(
        "Please provide a reason for the change."
      );

      return;
    }

    try {
      setCreatingRequest(true);
      setRequestError("");

      const response = await api.post(
        "/manager/payroll-requests",
        {
          payroll_id:
            selectedPayroll.id,

          field_name:
            fieldName,

          proposed_value:
            numericValue,

          reason:
            reason.trim(),
        }
      );

      setRequests((current) => [
        response.data,
        ...current,
      ]);

      closeRequestModal();

    } catch (err) {
      console.error(
        "Failed to create payroll request:",
        err
      );

      setRequestError(
        err.response?.data?.detail ||
          "Unable to create the payroll change request."
      );
    } finally {
      setCreatingRequest(false);
    }
  };


  // =======================================================
  // REFRESH
  // =======================================================

  const refreshAll = async () => {
    await Promise.all([
      fetchPayroll(),
      fetchEmployees(),
      fetchRequests(),
    ]);
  };


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="manager-payroll-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="manager-payroll-header">

        <div>
          <span className="manager-payroll-eyebrow">
            MANAGEMENT · PAYROLL
          </span>

          <h1>
            Payroll Management
          </h1>

          <p>
            Review employee payroll and submit
            payroll change requests for HR approval.
          </p>
        </div>

        <button
          type="button"
          className="manager-payroll-refresh"
          onClick={refreshAll}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="manager-payroll-alert error">
          {error}
        </div>
      )}


      {/* =================================================
          REQUEST SUMMARY
      ================================================= */}

      <section className="manager-payroll-summary">

        <div className="manager-payroll-summary-card pending">

          <Clock3 size={18} />

          <div>
            <span>
              Pending Requests
            </span>

            <strong>
              {requestsLoading
                ? "—"
                : pendingRequests}
            </strong>

            <small>
              Awaiting HR review
            </small>
          </div>

        </div>


        <div className="manager-payroll-summary-card approved">

          <CircleCheck size={18} />

          <div>
            <span>
              Approved
            </span>

            <strong>
              {requestsLoading
                ? "—"
                : approvedRequests}
            </strong>

            <small>
              Approved by HR
            </small>
          </div>

        </div>


        <div className="manager-payroll-summary-card rejected">

          <CircleX size={18} />

          <div>
            <span>
              Rejected
            </span>

            <strong>
              {requestsLoading
                ? "—"
                : rejectedRequests}
            </strong>

            <small>
              Rejected by HR
            </small>
          </div>

        </div>

      </section>


      {/* =================================================
          EMPLOYEE PAYROLL
      ================================================= */}

      <section className="manager-payroll-section">

        <div className="manager-payroll-section-heading">

          <div>
            <span>
              PAYROLL MANAGEMENT
            </span>

            <h2>
              Employee Payroll
            </h2>

            <p>
              Select a payroll record to request
              a change through HR.
            </p>
          </div>

          <div className="manager-payroll-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search employee or payroll..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        <div className="manager-payroll-table-wrapper">

          {loading ? (
            <div className="manager-payroll-empty">
              Loading payroll records...
            </div>
          ) : filteredPayroll.length === 0 ? (
            <div className="manager-payroll-empty">

              <strong>
                No payroll records
              </strong>

              <span>
                No payroll records match your search.
              </span>

            </div>
          ) : (
            <table className="manager-payroll-table">

              <thead>
                <tr>
                  <th>
                    Employee
                  </th>

                  <th>
                    Period
                  </th>

                  <th>
                    Basic Salary
                  </th>

                  <th>
                    Earnings
                  </th>

                  <th>
                    Deductions
                  </th>

                  <th>
                    Net Salary
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

                {filteredPayroll.map(
                  (record) => (
                    <tr key={record.id}>

                      <td>
                        <div className="manager-payroll-employee">

                          <strong>
                            {getEmployeeName(
                              record.employee_id
                            )}
                          </strong>

                          <span>
                            Employee #
                            {record.employee_id}
                          </span>

                        </div>
                      </td>

                      <td>
                        {formatMonth(
                          record.month,
                          record.year
                        )}
                      </td>

                      <td>
                        {formatMoney(
                          record.basic_salary
                        )}
                      </td>

                      <td>
                        {formatMoney(
                          record.total_earnings
                        )}
                      </td>

                      <td>
                        {formatMoney(
                          record.total_deductions
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatMoney(
                            record.net_salary
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`manager-payroll-status ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status ||
                            "Pending"}
                        </span>
                      </td>

                      <td>

                        <button
                          type="button"
                          className="manager-payroll-request-button"
                          onClick={() =>
                            openRequestModal(
                              record
                            )
                          }
                        >
                          <Plus size={14} />

                          Request Change
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </section>


      {/* =================================================
          MY REQUESTS
      ================================================= */}

      <section className="manager-payroll-section">

        <div className="manager-payroll-section-heading">

          <div>
            <span>
              HR WORKFLOW
            </span>

            <h2>
              My Change Requests
            </h2>

            <p>
              Track payroll changes you have requested
              from HR.
            </p>
          </div>

          <div className="manager-payroll-request-filters">

            {[
              "Pending",
              "Approved",
              "Rejected",
              "All",
            ].map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  requestFilter === filter
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setRequestFilter(filter)
                }
              >
                {filter}
              </button>
            ))}

          </div>

        </div>


        {requestError && !showRequestModal && (
          <div className="manager-payroll-alert error">
            {requestError}
          </div>
        )}


        <div className="manager-payroll-request-list">

          {requestsLoading ? (
            <div className="manager-payroll-empty">
              Loading your requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="manager-payroll-empty">

              <strong>
                No {requestFilter.toLowerCase()}
                {" "}
                requests
              </strong>

              <span>
                You have no requests in this category.
              </span>

            </div>
          ) : (
            filteredRequests.map(
              (request) => (
                <article
                  className="manager-payroll-request-card"
                  key={request.id}
                >

                  <div className="manager-payroll-request-main">

                    <div className="manager-payroll-request-top">

                      <div>
                        <span>
                          REQUEST #{request.id}
                        </span>

                        <h3>
                          {request.field_name}
                        </h3>

                        <p>
                          Payroll #
                          {request.payroll_id}
                          {" · "}
                          {formatDate(
                            request.created_at
                          )}
                        </p>
                      </div>

                      <span
                        className={`manager-payroll-status ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>

                    </div>


                    <div className="manager-payroll-request-values">

                      <div>
                        <span>
                          Current
                        </span>

                        <strong>
                          {formatMoney(
                            request.current_value
                          )}
                        </strong>
                      </div>

                      <div className="request-arrow">
                        →
                      </div>

                      <div>
                        <span>
                          Proposed
                        </span>

                        <strong className="proposed">
                          {formatMoney(
                            request.proposed_value
                          )}
                        </strong>
                      </div>

                    </div>


                    <div className="manager-payroll-request-reason">

                      <span>
                        Reason
                      </span>

                      <p>
                        {request.reason ||
                          "No reason provided."}
                      </p>

                    </div>


                    {request.review_comment && (
                      <div className="manager-payroll-request-review">

                        <span>
                          HR Review
                        </span>

                        <p>
                          {request.review_comment}
                        </p>

                      </div>
                    )}

                  </div>

                </article>
              )
            )
          )}

        </div>

      </section>


      {/* =================================================
          REQUEST MODAL
      ================================================= */}

      {showRequestModal &&
        selectedPayroll && (
          <div className="manager-payroll-modal-overlay">

            <div className="manager-payroll-modal">

              <div className="manager-payroll-modal-header">

                <div>
                  <span>
                    HR WORKFLOW
                  </span>

                  <h2>
                    Request Payroll Change
                  </h2>
                </div>

                <button
                  type="button"
                  className="manager-payroll-modal-close"
                  onClick={closeRequestModal}
                  disabled={creatingRequest}
                >
                  <X size={19} />
                </button>

              </div>


              <div className="manager-payroll-modal-summary">

                <div>
                  <span>
                    Employee
                  </span>

                  <strong>
                    {getEmployeeName(
                      selectedPayroll.employee_id
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Payroll
                  </span>

                  <strong>
                    #{selectedPayroll.id}
                  </strong>
                </div>

                <div>
                  <span>
                    Period
                  </span>

                  <strong>
                    {formatMonth(
                      selectedPayroll.month,
                      selectedPayroll.year
                    )}
                  </strong>
                </div>

              </div>


              {requestError && (
                <div className="manager-payroll-modal-error">
                  {requestError}
                </div>
              )}


              <label className="manager-payroll-field">

                <span>
                  Payroll Field
                </span>

                <select
                  value={fieldName}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setFieldName(value);

                    setProposedValue(
                      String(
                        Number(
                          selectedPayroll[value] ||
                            0
                        )
                      )
                    );
                  }}
                  disabled={creatingRequest}
                >

                  {CHANGEABLE_FIELDS.map(
                    (field) => (
                      <option
                        key={field.value}
                        value={field.value}
                      >
                        {field.label}
                      </option>
                    )
                  )}

                </select>

              </label>


              <div className="manager-payroll-modal-values">

                <div>
                  <span>
                    Current Value
                  </span>

                  <strong>
                    {formatMoney(
                      currentFieldValue
                    )}
                  </strong>
                </div>

                <div className="request-arrow">
                  →
                </div>

                <label>
                  <span>
                    Proposed Value
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={proposedValue}
                    onChange={(event) =>
                      setProposedValue(
                        event.target.value
                      )
                    }
                    disabled={creatingRequest}
                  />
                </label>

              </div>


              <label className="manager-payroll-field">

                <span>
                  Reason
                </span>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder="Explain why this payroll change is required..."
                  maxLength={1000}
                  disabled={creatingRequest}
                />

              </label>


              <div className="manager-payroll-modal-actions">

                <button
                  type="button"
                  className="manager-payroll-cancel"
                  onClick={closeRequestModal}
                  disabled={creatingRequest}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="manager-payroll-submit"
                  onClick={createRequest}
                  disabled={creatingRequest}
                >
                  <Plus size={16} />

                  {creatingRequest
                    ? "Submitting..."
                    : "Submit Request"}
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}