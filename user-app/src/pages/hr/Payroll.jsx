import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CircleCheck,
  CircleX,
  Edit3,
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


function getInputDate(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}


function getStatusClass(status) {
  const value = status?.toLowerCase();

  if (value === "approved") {
    return "status-approved";
  }

  if (value === "rejected") {
    return "status-rejected";
  }

  if (value === "pending") {
    return "status-pending";
  }

  if (value === "paid") {
    return "status-paid";
  }

  return "status-default";
}


// =========================================================
// EMPTY CREATE FORM
// =========================================================

const emptyCreateForm = {
  employee_id: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  basic_salary: "",
  allowances: "",
  bonus: "",
  overtime: "",
  other_earnings: "",
  tax_deduction: "",
  provident_fund: "",
  other_deductions: "",
  status: "Pending",
  payment_date: "",
  payment_method: "",
  notes: "",
};


// =========================================================
// EMPTY EDIT FORM
// =========================================================

const emptyEditForm = {
  month: "",
  year: "",
  basic_salary: "",
  allowances: "",
  bonus: "",
  overtime: "",
  other_earnings: "",
  tax_deduction: "",
  provident_fund: "",
  other_deductions: "",
  status: "Pending",
  payment_date: "",
  payment_method: "",
  notes: "",
};


// =========================================================
// PAGE
// =========================================================

export default function Payroll() {

  // =======================================================
  // DATA
  // =======================================================

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


  // =======================================================
  // CREATE PAYROLL
  // =======================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [createForm, setCreateForm] =
    useState(emptyCreateForm);

  const [creatingPayroll, setCreatingPayroll] =
    useState(false);

  const [createError, setCreateError] =
    useState("");

  const [createSuccess, setCreateSuccess] =
    useState("");


  // =======================================================
  // REQUEST REVIEW
  // =======================================================

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewingId, setReviewingId] =
    useState(null);


  // =======================================================
  // DIRECT HR EDIT
  // =======================================================

  const [selectedPayroll, setSelectedPayroll] =
    useState(null);

  const [editForm, setEditForm] =
    useState(emptyEditForm);

  const [editingPayrollId, setEditingPayrollId] =
    useState(null);

  const [editError, setEditError] =
    useState("");


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
  // FETCH PAYROLL CHANGE REQUESTS
  // =======================================================

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestError("");

      const response = await api.get(
        "/hr/payroll-requests"
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error(
        "Failed to load payroll change requests:",
        err
      );

      setRequests([]);

      setRequestError(
        err.response?.data?.detail ||
          "Unable to load payroll change requests."
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
  // EMPLOYEES WITHOUT PAYROLL
  // =======================================================

  const employeesWithoutPayroll = useMemo(() => {
    const payrollEmployeeIds = new Set(
      payroll.map(
        (record) => Number(record.employee_id)
      )
    );

    return employees.filter(
      (employee) =>
        !payrollEmployeeIds.has(
          Number(employee.id)
        )
    );
  }, [employees, payroll]);


  // =======================================================
  // PAYROLL FILTER
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
          .toLowerCase()
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

  const pendingRequests = requests.filter(
    (request) =>
      request.status?.toLowerCase() ===
      "pending"
  ).length;

  const approvedRequests = requests.filter(
    (request) =>
      request.status?.toLowerCase() ===
      "approved"
  ).length;

  const rejectedRequests = requests.filter(
    (request) =>
      request.status?.toLowerCase() ===
      "rejected"
  ).length;


  // =======================================================
  // CREATE FORM TOTALS
  // =======================================================

  const createTotals = useMemo(() => {
    const earnings =
      Number(createForm.basic_salary || 0) +
      Number(createForm.allowances || 0) +
      Number(createForm.bonus || 0) +
      Number(createForm.overtime || 0) +
      Number(createForm.other_earnings || 0);

    const deductions =
      Number(createForm.tax_deduction || 0) +
      Number(createForm.provident_fund || 0) +
      Number(createForm.other_deductions || 0);

    return {
      earnings,
      deductions,
      net: earnings - deductions,
    };
  }, [createForm]);


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
  // OPEN CREATE MODAL
  // =======================================================

  const openCreatePayroll = () => {
    setCreateForm({
      ...emptyCreateForm,
      month: String(
        new Date().getMonth() + 1
      ),
      year: String(
        new Date().getFullYear()
      ),
    });

    setCreateError("");
    setCreateSuccess("");
    setShowCreateModal(true);
  };


  // =======================================================
  // CLOSE CREATE MODAL
  // =======================================================

  const closeCreatePayroll = () => {
    if (creatingPayroll) {
      return;
    }

    setShowCreateModal(false);
    setCreateForm(emptyCreateForm);
    setCreateError("");
    setCreateSuccess("");
  };


  // =======================================================
  // UPDATE CREATE FIELD
  // =======================================================

  const updateCreateField = (
    field,
    value
  ) => {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));

    setCreateError("");
  };


  // =======================================================
  // CREATE PAYROLL
  // =======================================================

  const createPayroll = async () => {
    setCreateError("");

    if (!createForm.employee_id) {
      setCreateError(
        "Please select an employee."
      );
      return;
    }

    if (
      !createForm.month ||
      Number(createForm.month) < 1 ||
      Number(createForm.month) > 12
    ) {
      setCreateError(
        "Please enter a valid payroll month."
      );
      return;
    }

    if (
      !createForm.year ||
      Number(createForm.year) < 2000
    ) {
      setCreateError(
        "Please enter a valid payroll year."
      );
      return;
    }

    if (
      createForm.basic_salary === "" ||
      Number(createForm.basic_salary) < 0
    ) {
      setCreateError(
        "Basic salary is required."
      );
      return;
    }

    const duplicate = payroll.find(
      (record) =>
        Number(record.employee_id) ===
          Number(createForm.employee_id) &&
        Number(record.month) ===
          Number(createForm.month) &&
        Number(record.year) ===
          Number(createForm.year)
    );

    if (duplicate) {
      setCreateError(
        "Payroll already exists for this employee and payroll period."
      );
      return;
    }

    if (createTotals.net < 0) {
      setCreateError(
        "Total deductions cannot be greater than total earnings."
      );
      return;
    }

    try {
      setCreatingPayroll(true);

      const payload = {
        employee_id: Number(
          createForm.employee_id
        ),

        month: Number(
          createForm.month
        ),

        year: Number(
          createForm.year
        ),

        basic_salary: Number(
          createForm.basic_salary || 0
        ),

        allowances: Number(
          createForm.allowances || 0
        ),

        bonus: Number(
          createForm.bonus || 0
        ),

        overtime: Number(
          createForm.overtime || 0
        ),

        other_earnings: Number(
          createForm.other_earnings || 0
        ),

        tax_deduction: Number(
          createForm.tax_deduction || 0
        ),

        provident_fund: Number(
          createForm.provident_fund || 0
        ),

        other_deductions: Number(
          createForm.other_deductions || 0
        ),

        status:
          createForm.status ||
          "Pending",

        payment_date:
          createForm.payment_date ||
          null,

        payment_method:
          createForm.payment_method.trim() ||
          null,

        notes:
          createForm.notes.trim() ||
          null,
      };

      const response = await api.post(
        "/payroll/",
        payload
      );

      const createdPayroll =
        response.data;

      setPayroll((current) => [
        createdPayroll,
        ...current,
      ]);

      setCreateSuccess(
        "Payroll created successfully."
      );

      setTimeout(() => {
        setShowCreateModal(false);
        setCreateForm(emptyCreateForm);
        setCreateSuccess("");
      }, 900);

    } catch (err) {
      console.error(
        "Failed to create payroll:",
        err
      );

      setCreateError(
        err.response?.data?.detail ||
          "Unable to create payroll."
      );

    } finally {
      setCreatingPayroll(false);
    }
  };


  // =======================================================
  // OPEN EDIT MODAL
  // =======================================================

  const openEditPayroll = (record) => {
    setSelectedPayroll(record);

    setEditError("");

    setEditForm({
      month: String(record.month ?? ""),
      year: String(record.year ?? ""),

      basic_salary: String(
        record.basic_salary ?? 0
      ),

      allowances: String(
        record.allowances ?? 0
      ),

      bonus: String(
        record.bonus ?? 0
      ),

      overtime: String(
        record.overtime ?? 0
      ),

      other_earnings: String(
        record.other_earnings ?? 0
      ),

      tax_deduction: String(
        record.tax_deduction ?? 0
      ),

      provident_fund: String(
        record.provident_fund ?? 0
      ),

      other_deductions: String(
        record.other_deductions ?? 0
      ),

      status:
        record.status ||
        "Pending",

      payment_date:
        getInputDate(
          record.payment_date
        ),

      payment_method:
        record.payment_method ||
        "",

      notes:
        record.notes ||
        "",
    });
  };


  // =======================================================
  // CLOSE EDIT MODAL
  // =======================================================

  const closeEditPayroll = () => {
    if (editingPayrollId) {
      return;
    }

    setSelectedPayroll(null);
    setEditForm(emptyEditForm);
    setEditError("");
  };


  // =======================================================
  // EDIT FIELD
  // =======================================================

  const updateEditField = (
    field,
    value
  ) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };


  // =======================================================
  // SAVE DIRECT HR EDIT
  // =======================================================

  const savePayrollEdit = async () => {
    if (!selectedPayroll) {
      return;
    }

    try {
      setEditingPayrollId(
        selectedPayroll.id
      );

      setEditError("");

      const payload = {
        month: Number(
          editForm.month
        ),

        year: Number(
          editForm.year
        ),

        basic_salary: Number(
          editForm.basic_salary
        ),

        allowances: Number(
          editForm.allowances
        ),

        bonus: Number(
          editForm.bonus
        ),

        overtime: Number(
          editForm.overtime
        ),

        other_earnings: Number(
          editForm.other_earnings
        ),

        tax_deduction: Number(
          editForm.tax_deduction
        ),

        provident_fund: Number(
          editForm.provident_fund
        ),

        other_deductions: Number(
          editForm.other_deductions
        ),

        status:
          editForm.status ||
          "Pending",

        payment_date:
          editForm.payment_date ||
          null,

        payment_method:
          editForm.payment_method.trim() ||
          null,

        notes:
          editForm.notes.trim() ||
          null,
      };

      const response = await api.put(
        `/payroll/${selectedPayroll.id}`,
        payload
      );

      const updatedPayroll =
        response.data;

      setPayroll((current) =>
        current.map((item) =>
          item.id === updatedPayroll.id
            ? updatedPayroll
            : item
        )
      );

      setSelectedPayroll(null);
      setEditForm(emptyEditForm);

    } catch (err) {
      console.error(
        "Failed to update payroll:",
        err
      );

      setEditError(
        err.response?.data?.detail ||
          "Unable to update payroll."
      );

    } finally {
      setEditingPayrollId(null);
    }
  };


  // =======================================================
  // REVIEW REQUEST
  // =======================================================

  const reviewRequest = async (
    request,
    action
  ) => {
    try {
      setReviewingId(request.id);
      setRequestError("");

      const endpoint =
        action === "approve"
          ? `/hr/payroll-requests/${request.id}/approve`
          : `/hr/payroll-requests/${request.id}/reject`;

      const response = await api.patch(
        endpoint,
        {
          review_comment:
            reviewComment.trim() ||
            null,
        }
      );

      const updatedRequest =
        response.data;

      setRequests((current) =>
        current.map((item) =>
          item.id === updatedRequest.id
            ? updatedRequest
            : item
        )
      );

      setSelectedRequest(null);
      setReviewComment("");

      if (action === "approve") {
        await fetchPayroll();
      }

    } catch (err) {
      console.error(
        `Failed to ${action} payroll request:`,
        err
      );

      setRequestError(
        err.response?.data?.detail ||
          `Unable to ${action} the payroll change request.`
      );

    } finally {
      setReviewingId(null);
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
    <div className="hr-payroll-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="hr-payroll-header">

        <div>
          <span className="hr-payroll-eyebrow">
            HR · PAYROLL
          </span>

          <h1>
            Payroll Management
          </h1>

          <p>
            Manage employee payroll, salary,
            earnings, deductions and approval
            workflows from one place.
          </p>
        </div>

        <div className="hr-payroll-header-actions">

          <button
            className="hr-payroll-refresh"
            onClick={refreshAll}
            type="button"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="hr-payroll-create"
            onClick={openCreatePayroll}
            type="button"
          >
            <Plus size={18} />
            Create Payroll
          </button>

        </div>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="hr-payroll-alert error">
          {error}
        </div>
      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="hr-payroll-summary">

        <div className="payroll-summary-card">
          <span>
            Payroll Records
          </span>

          <strong>
            {loading
              ? "—"
              : payroll.length}
          </strong>

          <small>
            Current backend records
          </small>
        </div>


        <div className="payroll-summary-card pending">
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


        <div className="payroll-summary-card approved">
          <span>
            Approved
          </span>

          <strong>
            {requestsLoading
              ? "—"
              : approvedRequests}
          </strong>

          <small>
            Successfully approved
          </small>
        </div>


        <div className="payroll-summary-card rejected">
          <span>
            Rejected
          </span>

          <strong>
            {requestsLoading
              ? "—"
              : rejectedRequests}
          </strong>

          <small>
            Declined requests
          </small>
        </div>

      </section>


      {/* =================================================
          EMPLOYEES WITHOUT PAYROLL NOTICE
      ================================================= */}

      {!loading &&
        employeesWithoutPayroll.length > 0 && (
          <section className="payroll-setup-banner">

            <div className="payroll-setup-banner-icon">
              <Plus size={20} />
            </div>

            <div className="payroll-setup-banner-content">

              <strong>
                Payroll setup required
              </strong>

              <span>
                {employeesWithoutPayroll.length}{" "}
                employee
                {employeesWithoutPayroll.length !== 1
                  ? "s"
                  : ""}{" "}
                {employeesWithoutPayroll.length !== 1
                  ? "do"
                  : "does"}{" "}
                not have a payroll record yet.
              </span>

            </div>

            <button
              type="button"
              onClick={openCreatePayroll}
            >
              Set up payroll
            </button>

          </section>
        )}


      {/* =================================================
          PAYROLL RECORDS
      ================================================= */}

      <section className="hr-payroll-section">

        <div className="section-heading">

          <div>
            <span>
              PAYROLL RECORDS
            </span>

            <h2>
              Employee Payroll
            </h2>
          </div>

          <div className="payroll-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search employee or payroll..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        <div className="payroll-table-wrapper">

          {loading ? (

            <div className="payroll-empty">
              Loading payroll records...
            </div>

          ) : filteredPayroll.length === 0 ? (

            <div className="payroll-empty">

              <div className="payroll-empty-icon">
                ₹
              </div>

              <strong>
                No payroll records found
              </strong>

              <span>
                Create payroll for an employee
                to begin managing salary records.
              </span>

              {employees.length > 0 && (
                <button
                  type="button"
                  className="payroll-empty-create"
                  onClick={openCreatePayroll}
                >
                  <Plus size={16} />
                  Create Payroll
                </button>
              )}

            </div>

          ) : (

            <table className="payroll-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Period
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
                    Payment Date
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

                        <div className="employee-cell">

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
                          className={`payroll-status ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status || "—"}
                        </span>

                      </td>


                      <td>
                        {formatDate(
                          record.payment_date
                        )}
                      </td>


                      <td>

                        <button
                          type="button"
                          className="payroll-edit-button"
                          onClick={() =>
                            openEditPayroll(
                              record
                            )
                          }
                        >
                          <Edit3 size={14} />
                          Edit
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
          CHANGE REQUESTS
      ================================================= */}

      <section className="hr-payroll-section requests-section">

        <div className="section-heading">

          <div>

            <span>
              APPROVAL WORKFLOW
            </span>

            <h2>
              Payroll Change Requests
            </h2>

            <p>
              Managers can request changes.
              HR has final approval.
            </p>

          </div>


          <div className="request-filters">

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
                  setRequestFilter(
                    filter
                  )
                }
              >
                {filter}
              </button>

            ))}

          </div>

        </div>


        {requestError && (
          <div className="hr-payroll-alert error">
            {requestError}
          </div>
        )}


        <div className="request-list">

          {requestsLoading ? (

            <div className="payroll-empty">
              Loading payroll change requests...
            </div>

          ) : filteredRequests.length === 0 ? (

            <div className="payroll-empty">

              <strong>
                No{" "}
                {requestFilter.toLowerCase()}
                {" "}
                payroll requests
              </strong>

              <span>
                There are no requests in this
                category.
              </span>

            </div>

          ) : (

            filteredRequests.map(
              (request) => (

                <article
                  className="request-card"
                  key={request.id}
                >

                  <div className="request-card-main">

                    <div className="request-top">

                      <div>

                        <span className="request-label">
                          REQUEST #{request.id}
                        </span>

                        <h3>
                          {getEmployeeName(
                            request.employee_id
                          )}
                        </h3>

                        <p>
                          Employee #
                          {request.employee_id}
                          {" · "}
                          Payroll #
                          {request.payroll_id}
                        </p>

                      </div>


                      <span
                        className={`request-status ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>

                    </div>


                    <div className="request-change">

                      <div>
                        <span>
                          Field
                        </span>

                        <strong>
                          {request.field_name}
                        </strong>
                      </div>


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


                      <div>
                        <span>
                          Proposed
                        </span>

                        <strong className="proposed-value">
                          {formatMoney(
                            request.proposed_value
                          )}
                        </strong>
                      </div>


                      <div>
                        <span>
                          Requested
                        </span>

                        <strong>
                          {formatDate(
                            request.created_at
                          )}
                        </strong>
                      </div>

                    </div>


                    <div className="request-reason">

                      <span>
                        Reason
                      </span>

                      <p>
                        {request.reason ||
                          "No reason provided."}
                      </p>

                    </div>


                    {request.review_comment && (
                      <div className="request-review">

                        <span>
                          HR Review
                        </span>

                        <p>
                          {request.review_comment}
                        </p>

                      </div>
                    )}

                  </div>


                  {request.status?.toLowerCase() ===
                    "pending" && (

                    <div className="request-actions">

                      <button
                        type="button"
                        className="request-review-button"
                        onClick={() => {
                          setSelectedRequest(
                            request
                          );

                          setReviewComment("");
                        }}
                      >
                        Review Request
                      </button>

                    </div>

                  )}

                </article>

              )
            )

          )}

        </div>

      </section>


      {/* =================================================
          CREATE PAYROLL MODAL
      ================================================= */}

      {showCreateModal && (

        <div
          className="payroll-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreatePayroll();
            }
          }}
        >

          <div className="payroll-modal payroll-create-modal">

            <div className="payroll-modal-header">

              <div>

                <span>
                  NEW PAYROLL
                </span>

                <h2>
                  Create Employee Payroll
                </h2>

                <p className="payroll-modal-subtitle">
                  Set up a complete payroll
                  record for an employee.
                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={closeCreatePayroll}
                disabled={creatingPayroll}
              >
                <X size={20} />
              </button>

            </div>


            {createError && (
              <div className="hr-payroll-alert error edit-error">
                {createError}
              </div>
            )}


            {createSuccess && (
              <div className="hr-payroll-alert success edit-error">
                {createSuccess}
              </div>
            )}


            <div className="payroll-create-body">

              {/* EMPLOYEE */}

              <div className="payroll-form-section payroll-employee-section">

                <span className="payroll-form-section-title">
                  EMPLOYEE
                </span>

                <label>

                  <span>
                    Select Employee
                  </span>

                  <select
                    value={
                      createForm.employee_id
                    }
                    onChange={(event) =>
                      updateCreateField(
                        "employee_id",
                        event.target.value
                      )
                    }
                    disabled={
                      creatingPayroll
                    }
                  >

                    <option value="">
                      Select an employee...
                    </option>

                    {employees.map(
                      (employee) => {

                        const alreadyHasPayroll =
                          payroll.some(
                            (record) =>
                              Number(
                                record.employee_id
                              ) ===
                              Number(
                                employee.id
                              )
                          );

                        return (
                          <option
                            key={employee.id}
                            value={employee.id}
                          >
                            {employee.name ||
                              `Employee #${employee.id}`}
                            {" — "}
                            {employee.email ||
                              "No email"}
                            {alreadyHasPayroll
                              ? " · Existing payroll"
                              : ""}
                          </option>
                        );
                      }
                    )}

                  </select>

                </label>


                {createForm.employee_id && (
                  <div className="selected-employee-preview">

                    <div className="selected-employee-avatar">
                      {employeeMap[
                        createForm.employee_id
                      ]?.name
                        ?.charAt(0)
                        .toUpperCase() || "E"}
                    </div>

                    <div>

                      <strong>
                        {employeeMap[
                          createForm.employee_id
                        ]?.name ||
                          "Selected employee"}
                      </strong>

                      <span>
                        {employeeMap[
                          createForm.employee_id
                        ]?.department ||
                          "No department"}
                        {" · "}
                        {employeeMap[
                          createForm.employee_id
                        ]?.role ||
                          "Employee"}
                      </span>

                    </div>

                  </div>
                )}

              </div>


              {/* PERIOD */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  PAYROLL PERIOD
                </span>

                <div className="payroll-form-grid two">

                  <label>

                    <span>
                      Month
                    </span>

                    <select
                      value={
                        createForm.month
                      }
                      onChange={(event) =>
                        updateCreateField(
                          "month",
                          event.target.value
                        )
                      }
                      disabled={
                        creatingPayroll
                      }
                    >

                      {[
                        ["1", "January"],
                        ["2", "February"],
                        ["3", "March"],
                        ["4", "April"],
                        ["5", "May"],
                        ["6", "June"],
                        ["7", "July"],
                        ["8", "August"],
                        ["9", "September"],
                        ["10", "October"],
                        ["11", "November"],
                        ["12", "December"],
                      ].map(
                        ([value, label]) => (
                          <option
                            key={value}
                            value={value}
                          >
                            {label}
                          </option>
                        )
                      )}

                    </select>

                  </label>


                  <label>

                    <span>
                      Year
                    </span>

                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={
                        createForm.year
                      }
                      onChange={(event) =>
                        updateCreateField(
                          "year",
                          event.target.value
                        )
                      }
                      disabled={
                        creatingPayroll
                      }
                    />

                  </label>

                </div>

              </div>


              {/* EARNINGS */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  EARNINGS
                </span>

                <div className="payroll-form-grid">

                  {[
                    ["basic_salary", "Basic Salary", true],
                    ["allowances", "Allowances"],
                    ["bonus", "Bonus"],
                    ["overtime", "Overtime"],
                    ["other_earnings", "Other Earnings"],
                  ].map(
                    ([field, label, required]) => (

                      <label key={field}>

                        <span>
                          {label}
                          {required && (
                            <em>Required</em>
                          )}
                        </span>

                        <div className="currency-input">

                          <span>
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={
                              createForm[field]
                            }
                            onChange={(event) =>
                              updateCreateField(
                                field,
                                event.target.value
                              )
                            }
                            disabled={
                              creatingPayroll
                            }
                          />

                        </div>

                      </label>

                    )
                  )}

                </div>

              </div>


              {/* DEDUCTIONS */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  DEDUCTIONS
                </span>

                <div className="payroll-form-grid">

                  {[
                    ["tax_deduction", "Tax Deduction"],
                    ["provident_fund", "Provident Fund"],
                    ["other_deductions", "Other Deductions"],
                  ].map(
                    ([field, label]) => (

                      <label key={field}>

                        <span>
                          {label}
                        </span>

                        <div className="currency-input">

                          <span>
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={
                              createForm[field]
                            }
                            onChange={(event) =>
                              updateCreateField(
                                field,
                                event.target.value
                              )
                            }
                            disabled={
                              creatingPayroll
                            }
                          />

                        </div>

                      </label>

                    )
                  )}

                </div>

              </div>


              {/* PAYROLL PREVIEW */}

              <div className="payroll-calculation-card">

                <div>

                  <span>
                    TOTAL EARNINGS
                  </span>

                  <strong>
                    {formatMoney(
                      createTotals.earnings
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    TOTAL DEDUCTIONS
                  </span>

                  <strong>
                    {formatMoney(
                      createTotals.deductions
                    )}
                  </strong>

                </div>

                <div className="net">

                  <span>
                    NET SALARY
                  </span>

                  <strong>
                    {formatMoney(
                      createTotals.net
                    )}
                  </strong>

                </div>

              </div>


              {/* PAYMENT */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  PAYMENT
                </span>

                <div className="payroll-form-grid">

                  <label>

                    <span>
                      Status
                    </span>

                    <select
                      value={
                        createForm.status
                      }
                      onChange={(event) =>
                        updateCreateField(
                          "status",
                          event.target.value
                        )
                      }
                      disabled={
                        creatingPayroll
                      }
                    >

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Paid">
                        Paid
                      </option>

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                    </select>

                  </label>


                  <label>

                    <span>
                      Payment Date
                    </span>

                    <input
                      type="date"
                      value={
                        createForm.payment_date
                      }
                      onChange={(event) =>
                        updateCreateField(
                          "payment_date",
                          event.target.value
                        )
                      }
                      disabled={
                        creatingPayroll
                      }
                    />

                  </label>


                  <label>

                    <span>
                      Payment Method
                    </span>

                    <input
                      type="text"
                      placeholder="Bank Transfer"
                      value={
                        createForm.payment_method
                      }
                      onChange={(event) =>
                        updateCreateField(
                          "payment_method",
                          event.target.value
                        )
                      }
                      disabled={
                        creatingPayroll
                      }
                    />

                  </label>

                </div>

              </div>


              {/* NOTES */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  NOTES
                </span>

                <label>

                  <span>
                    Additional Notes
                  </span>

                  <textarea
                    value={
                      createForm.notes
                    }
                    onChange={(event) =>
                      updateCreateField(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Add payroll notes..."
                    disabled={
                      creatingPayroll
                    }
                  />

                </label>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="modal-actions">

              <button
                type="button"
                className="modal-reject"
                disabled={creatingPayroll}
                onClick={closeCreatePayroll}
              >
                Cancel
              </button>


              <button
                type="button"
                className="modal-approve"
                disabled={creatingPayroll}
                onClick={createPayroll}
              >

                <CircleCheck size={18} />

                {creatingPayroll
                  ? "Creating..."
                  : "Create Payroll"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          DIRECT PAYROLL EDIT MODAL
      ================================================= */}

      {selectedPayroll && (

        <div className="payroll-modal-overlay">

          <div className="payroll-modal payroll-edit-modal">

            <div className="payroll-modal-header">

              <div>

                <span>
                  HR DIRECT EDIT
                </span>

                <h2>
                  Edit Payroll
                </h2>

                <p className="payroll-modal-subtitle">
                  {getEmployeeName(
                    selectedPayroll.employee_id
                  )}
                  {" · "}
                  Payroll #
                  {selectedPayroll.id}
                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={closeEditPayroll}
              >
                <X size={20} />
              </button>

            </div>


            {editError && (
              <div className="hr-payroll-alert error edit-error">
                {editError}
              </div>
            )}


            <div className="payroll-edit-form">

              {/* PERIOD */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  PAYROLL PERIOD
                </span>

                <div className="payroll-form-grid two">

                  <label>

                    <span>
                      Month
                    </span>

                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={editForm.month}
                      onChange={(event) =>
                        updateEditField(
                          "month",
                          event.target.value
                        )
                      }
                      disabled={
                        Boolean(
                          editingPayrollId
                        )
                      }
                    />

                  </label>


                  <label>

                    <span>
                      Year
                    </span>

                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={editForm.year}
                      onChange={(event) =>
                        updateEditField(
                          "year",
                          event.target.value
                        )
                      }
                      disabled={
                        Boolean(
                          editingPayrollId
                        )
                      }
                    />

                  </label>

                </div>

              </div>


              {/* EARNINGS */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  EARNINGS
                </span>

                <div className="payroll-form-grid">

                  {[
                    ["basic_salary", "Basic Salary"],
                    ["allowances", "Allowances"],
                    ["bonus", "Bonus"],
                    ["overtime", "Overtime"],
                    ["other_earnings", "Other Earnings"],
                  ].map(
                    ([field, label]) => (

                      <label key={field}>

                        <span>
                          {label}
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            editForm[field]
                          }
                          onChange={(event) =>
                            updateEditField(
                              field,
                              event.target.value
                            )
                          }
                          disabled={
                            Boolean(
                              editingPayrollId
                            )
                          }
                        />

                      </label>

                    )
                  )}

                </div>

              </div>


              {/* DEDUCTIONS */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  DEDUCTIONS
                </span>

                <div className="payroll-form-grid">

                  {[
                    ["tax_deduction", "Tax Deduction"],
                    ["provident_fund", "Provident Fund"],
                    ["other_deductions", "Other Deductions"],
                  ].map(
                    ([field, label]) => (

                      <label key={field}>

                        <span>
                          {label}
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            editForm[field]
                          }
                          onChange={(event) =>
                            updateEditField(
                              field,
                              event.target.value
                            )
                          }
                          disabled={
                            Boolean(
                              editingPayrollId
                            )
                          }
                        />

                      </label>

                    )
                  )}

                </div>

              </div>


              {/* PAYMENT */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  PAYMENT
                </span>

                <div className="payroll-form-grid">

                  <label>

                    <span>
                      Status
                    </span>

                    <select
                      value={
                        editForm.status
                      }
                      onChange={(event) =>
                        updateEditField(
                          "status",
                          event.target.value
                        )
                      }
                      disabled={
                        Boolean(
                          editingPayrollId
                        )
                      }
                    >

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Paid">
                        Paid
                      </option>

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                    </select>

                  </label>


                  <label>

                    <span>
                      Payment Date
                    </span>

                    <input
                      type="date"
                      value={
                        editForm.payment_date
                      }
                      onChange={(event) =>
                        updateEditField(
                          "payment_date",
                          event.target.value
                        )
                      }
                      disabled={
                        Boolean(
                          editingPayrollId
                        )
                      }
                    />

                  </label>


                  <label>

                    <span>
                      Payment Method
                    </span>

                    <input
                      type="text"
                      placeholder="Bank Transfer"
                      value={
                        editForm.payment_method
                      }
                      onChange={(event) =>
                        updateEditField(
                          "payment_method",
                          event.target.value
                        )
                      }
                      disabled={
                        Boolean(
                          editingPayrollId
                        )
                      }
                    />

                  </label>

                </div>

              </div>


              {/* NOTES */}

              <div className="payroll-form-section">

                <span className="payroll-form-section-title">
                  NOTES
                </span>

                <label>

                  <textarea
                    value={
                      editForm.notes
                    }
                    onChange={(event) =>
                      updateEditField(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Add payroll notes..."
                    disabled={
                      Boolean(
                        editingPayrollId
                      )
                    }
                  />

                </label>

              </div>

            </div>


            <div className="modal-actions">

              <button
                type="button"
                className="modal-reject"
                disabled={
                  Boolean(
                    editingPayrollId
                  )
                }
                onClick={closeEditPayroll}
              >
                Cancel
              </button>


              <button
                type="button"
                className="modal-approve"
                disabled={
                  Boolean(
                    editingPayrollId
                  )
                }
                onClick={savePayrollEdit}
              >

                <CircleCheck size={18} />

                {editingPayrollId
                  ? "Saving..."
                  : "Save Payroll"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          REQUEST REVIEW MODAL
      ================================================= */}

      {selectedRequest && (

        <div className="payroll-modal-overlay">

          <div className="payroll-modal">

            <div className="payroll-modal-header">

              <div>

                <span>
                  HR APPROVAL
                </span>

                <h2>
                  Review Payroll Change
                </h2>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() => {

                  if (!reviewingId) {

                    setSelectedRequest(
                      null
                    );

                    setReviewComment("");

                  }

                }}
              >
                <X size={20} />
              </button>

            </div>


            <div className="modal-request-summary">

              <div>

                <span>
                  Employee
                </span>

                <strong>
                  {getEmployeeName(
                    selectedRequest.employee_id
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Payroll
                </span>

                <strong>
                  #{selectedRequest.payroll_id}
                </strong>

              </div>


              <div>

                <span>
                  Field
                </span>

                <strong>
                  {selectedRequest.field_name}
                </strong>

              </div>

            </div>


            <div className="modal-values">

              <div>

                <span>
                  Current Value
                </span>

                <strong>
                  {formatMoney(
                    selectedRequest.current_value
                  )}
                </strong>

              </div>


              <div className="modal-arrow">
                →
              </div>


              <div className="proposed">

                <span>
                  Proposed Value
                </span>

                <strong>
                  {formatMoney(
                    selectedRequest.proposed_value
                  )}
                </strong>

              </div>

            </div>


            <div className="modal-reason">

              <span>
                Manager's Reason
              </span>

              <p>
                {selectedRequest.reason ||
                  "No reason provided."}
              </p>

            </div>


            <label className="review-comment-label">

              <span>
                HR Review Comment
              </span>

              <textarea
                value={reviewComment}
                onChange={(event) =>
                  setReviewComment(
                    event.target.value
                  )
                }
                placeholder="Add an optional review comment..."
                maxLength={1000}
                disabled={
                  Boolean(
                    reviewingId
                  )
                }
              />

            </label>


            <div className="modal-actions">

              <button
                type="button"
                className="modal-reject"
                disabled={
                  Boolean(
                    reviewingId
                  )
                }
                onClick={() =>
                  reviewRequest(
                    selectedRequest,
                    "reject"
                  )
                }
              >

                <CircleX size={18} />

                {reviewingId ===
                selectedRequest.id
                  ? "Processing..."
                  : "Reject"}

              </button>


              <button
                type="button"
                className="modal-approve"
                disabled={
                  Boolean(
                    reviewingId
                  )
                }
                onClick={() =>
                  reviewRequest(
                    selectedRequest,
                    "approve"
                  )
                }
              >

                <CircleCheck size={18} />

                {reviewingId ===
                selectedRequest.id
                  ? "Processing..."
                  : "Approve Change"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}