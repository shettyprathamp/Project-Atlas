import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./Employees.css";

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

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "Employee",
  department: "",

  // Payroll setup
  enablePayroll: false,
  payrollMonth: new Date().getMonth() + 1,
  payrollYear: new Date().getFullYear(),

  basicSalary: "",
  allowances: "",
  bonus: "",
  overtime: "",
  otherEarnings: "",

  taxDeduction: "",
  providentFund: "",
  otherDeductions: "",

  payrollStatus: "Pending",
  paymentDate: "",
  paymentMethod: "",
  payrollNotes: "",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/employees/"
      );

      setEmployees(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {
    setEditingEmployee(null);

    setForm({
      ...emptyForm,
      payrollMonth:
        new Date().getMonth() + 1,
      payrollYear:
        new Date().getFullYear(),
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (employee) => {
    setEditingEmployee(employee);

    setForm({
      name: employee.name || "",
      email: employee.email || "",
      password: "",
      role: employee.role || "Employee",
      department: employee.department || "",

      // Payroll is only created during NEW EMPLOYEE flow.
      enablePayroll: false,

      payrollMonth:
        new Date().getMonth() + 1,

      payrollYear:
        new Date().getFullYear(),

      basicSalary: "",
      allowances: "",
      bonus: "",
      overtime: "",
      otherEarnings: "",

      taxDeduction: "",
      providentFund: "",
      otherDeductions: "",

      payrollStatus: "Pending",
      paymentDate: "",
      paymentMethod: "",
      payrollNotes: "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    setShowForm(false);
    setEditingEmployee(null);

    setForm({
      ...emptyForm,
      payrollMonth:
        new Date().getMonth() + 1,
      payrollYear:
        new Date().getFullYear(),
    });

    setError("");
    setSuccess("");
  };

  // =========================================================
  // NUMBER HELPER
  // =========================================================

  const getNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  // =========================================================
  // PAYROLL CALCULATION
  // =========================================================

  const payrollTotals = useMemo(() => {
    const earnings =
      getNumber(form.basicSalary) +
      getNumber(form.allowances) +
      getNumber(form.bonus) +
      getNumber(form.overtime) +
      getNumber(form.otherEarnings);

    const deductions =
      getNumber(form.taxDeduction) +
      getNumber(form.providentFund) +
      getNumber(form.otherDeductions);

    return {
      earnings,
      deductions,
      net: earnings - deductions,
    };
  }, [
    form.basicSalary,
    form.allowances,
    form.bonus,
    form.overtime,
    form.otherEarnings,
    form.taxDeduction,
    form.providentFund,
    form.otherDeductions,
  ]);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    );
  };

  // =========================================================
  // CREATE / UPDATE EMPLOYEE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // =====================================================
      // CREATE NEW EMPLOYEE
      // =====================================================

      if (!editingEmployee) {
        const employeeResponse =
          await api.post("/employees/", {
            company_id: 1,
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            department:
              form.department || null,
          });

        const createdEmployee =
          employeeResponse.data;

        let createdEmployeeId =
          createdEmployee?.id;

        /*
         * The normal EmployeeResponse contains the ID.
         * This fallback protects the workflow if the
         * backend response does not expose it directly.
         */
        if (!createdEmployeeId) {
          const refreshed =
            await api.get("/employees/");

          const matchedEmployee =
            refreshed.data.find(
              (employee) =>
                employee.email?.toLowerCase() ===
                form.email.trim().toLowerCase()
            );

          createdEmployeeId =
            matchedEmployee?.id;
        }

        // ===================================================
        // CREATE INITIAL PAYROLL IF ENABLED
        // ===================================================

        if (form.enablePayroll) {
          if (!createdEmployeeId) {
            throw new Error(
              "Employee was created, but the employee ID could not be determined. Payroll was not created."
            );
          }

          await api.post("/payroll/", {
            employee_id:
              Number(createdEmployeeId),

            month:
              Number(form.payrollMonth),

            year:
              Number(form.payrollYear),

            basic_salary:
              getNumber(form.basicSalary),

            allowances:
              getNumber(form.allowances),

            bonus:
              getNumber(form.bonus),

            overtime:
              getNumber(form.overtime),

            other_earnings:
              getNumber(form.otherEarnings),

            tax_deduction:
              getNumber(form.taxDeduction),

            provident_fund:
              getNumber(form.providentFund),

            other_deductions:
              getNumber(form.otherDeductions),

            status:
              form.payrollStatus,

            payment_date:
              form.paymentDate || null,

            payment_method:
              form.paymentMethod || null,

            notes:
              form.payrollNotes || null,
          });

          setSuccess(
            "Employee and initial payroll record created successfully."
          );
        } else {
          setSuccess(
            "Employee created successfully."
          );
        }
      }

      // =====================================================
      // UPDATE EXISTING EMPLOYEE
      // =====================================================

      else {
        await api.put(
          `/employees/${editingEmployee.id}`,
          {
            name: form.name,
            email: form.email,
            role: form.role,
            department:
              form.department || null,
            status:
              editingEmployee.status ||
              "Active",
          }
        );

        setSuccess(
          "Employee information updated successfully."
        );
      }

      await fetchEmployees();

      // Give the user a short confirmation before
      // closing the form.
      setTimeout(() => {
        closeForm();
      }, 400);
    } catch (err) {
      console.error(err);

      /*
       * Important:
       *
       * If employee creation succeeded but payroll
       * creation failed, the employee still exists.
       * We do not silently delete the employee.
       */
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to save employee."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE EMPLOYEE
  // =========================================================

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/employees/${employee.id}`
      );

      await fetchEmployees();

      setSuccess(
        `${employee.name} was deleted successfully.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete employee."
      );
    }
  };

  // =========================================================
  // FILTER EMPLOYEES
  // =========================================================

  const filteredEmployees = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return employees.filter((employee) => {
      const matchesSearch =
        !searchValue ||
        employee.name
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.email
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.department
          ?.toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "All" ||
        employee.role?.toLowerCase() ===
          roleFilter.toLowerCase();

      const employeeStatus =
        employee.status || "Active";

      const matchesStatus =
        statusFilter === "All" ||
        employeeStatus.toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    employees,
    search,
    roleFilter,
    statusFilter,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const activeCount = employees.filter(
    (employee) =>
      (employee.status || "Active")
        .toLowerCase() === "active"
  ).length;

  const inactiveCount = employees.filter(
    (employee) =>
      employee.status?.toLowerCase() ===
      "inactive"
  ).length;

  const departmentCount = new Set(
    employees
      .map(
        (employee) => employee.department
      )
      .filter(Boolean)
  ).size;

  // =========================================================
  // HELPERS
  // =========================================================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0)
      )
      .join("")
      .toUpperCase();
  };

  const getStatusClass = (status) => {
    const normalized = (
      status || "Active"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");

    return normalized;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <DashboardLayout>
      <div className="employees-page">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="employees-hero">

          <div className="employees-hero-content">

            <div className="employees-eyebrow">
              PEOPLE OPERATIONS
            </div>

            <h1>
              Employee Management
            </h1>

            <p>
              Manage your workforce, employee
              information, roles and departments
              from one place.
            </p>

          </div>

          <div className="employees-hero-actions">

            {!showForm && (
              <button
                className="employees-primary-button"
                onClick={openAddForm}
              >
                <span>+</span>
                Add Employee
              </button>
            )}

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="employees-error">

            <span>!</span>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>{error}</p>
            </div>

          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div
            className="employees-success"
            role="status"
          >
            <span>✓</span>

            <div>
              <strong>
                Operation completed
              </strong>

              <p>{success}</p>
            </div>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="employees-stats">

          <div className="employees-stat-card">

            <div className="employees-stat-icon">
              👥
            </div>

            <div>
              <span>
                Total Employees
              </span>

              <strong>
                {loading
                  ? "—"
                  : employees.length}
              </strong>

              <small>
                Company workforce
              </small>
            </div>

          </div>

          <div className="employees-stat-card">

            <div className="employees-stat-icon success">
              ✓
            </div>

            <div>
              <span>
                Active
              </span>

              <strong>
                {loading
                  ? "—"
                  : activeCount}
              </strong>

              <small>
                Currently active
              </small>
            </div>

          </div>

          <div className="employees-stat-card">

            <div className="employees-stat-icon warning">
              ◐
            </div>

            <div>
              <span>
                Inactive
              </span>

              <strong>
                {loading
                  ? "—"
                  : inactiveCount}
              </strong>

              <small>
                Not currently active
              </small>
            </div>

          </div>

          <div className="employees-stat-card">

            <div className="employees-stat-icon purple">
              #
            </div>

            <div>
              <span>
                Departments
              </span>

              <strong>
                {loading
                  ? "—"
                  : departmentCount}
              </strong>

              <small>
                Across the workforce
              </small>
            </div>

          </div>

        </section>

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        {showForm && (
          <section className="employee-form-panel">

            <div className="employee-form-header">

              <div>

                <span className="employees-section-label">
                  {editingEmployee
                    ? "EMPLOYEE PROFILE"
                    : "NEW EMPLOYEE"}
                </span>

                <h2>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p>
                  {editingEmployee
                    ? `Update information for ${editingEmployee.name}.`
                    : "Create a new employee account and optionally configure their first payroll record."}
                </p>

              </div>

              <button
                type="button"
                className="employees-close-button"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="employee-form"
              onSubmit={handleSubmit}
            >

              {/* =================================================
                  EMPLOYEE INFORMATION
              ================================================= */}

              <div className="employee-form-grid">

                <div className="employee-field">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />

                </div>

                <div className="employee-field">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@atlastech.com"
                    required
                  />

                </div>

                {!editingEmployee && (
                  <div className="employee-field">

                    <label>
                      Initial Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      required
                    />

                  </div>
                )}

                <div className="employee-field">

                  <label>
                    Role
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="Employee">
                      Employee
                    </option>

                    <option value="HR">
                      HR
                    </option>

                    <option value="Manager">
                      Manager
                    </option>

                    <option value="Billing">
                      Billing
                    </option>
                  </select>

                </div>

                <div className="employee-field">

                  <label>
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering"
                  />

                </div>

              </div>

              {/* =================================================
                  PAYROLL SETUP
                  ONLY AVAILABLE FOR NEW EMPLOYEES
              ================================================= */}

              {!editingEmployee && (
                <div
                  className="employee-payroll-setup"
                  style={{
                    marginTop: "28px",
                    paddingTop: "26px",
                    borderTop:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent:
                        "space-between",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >

                    <div>

                      <span className="employees-section-label">
                        PAYROLL SETUP
                      </span>

                      <h3
                        style={{
                          margin:
                            "6px 0 5px",
                          fontSize: "18px",
                        }}
                      >
                        Initial Payroll
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "rgba(255,255,255,0.52)",
                          fontSize: "12px",
                          lineHeight: 1.6,
                        }}
                      >
                        Configure the employee's
                        first payroll record now,
                        or leave it for later.
                      </p>

                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                        cursor: "pointer",
                        padding:
                          "10px 14px",
                        border:
                          "1px solid rgba(129,140,248,0.22)",
                        borderRadius: "9px",
                        background:
                          form.enablePayroll
                            ? "rgba(99,102,241,0.10)"
                            : "rgba(255,255,255,0.025)",
                        whiteSpace:
                          "nowrap",
                      }}
                    >

                      <input
                        type="checkbox"
                        name="enablePayroll"
                        checked={
                          form.enablePayroll
                        }
                        onChange={handleChange}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor:
                            "#6366f1",
                          cursor: "pointer",
                        }}
                      />

                      <span
                        style={{
                          color:
                            form.enablePayroll
                              ? "#ffffff"
                              : "#a0a8b8",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Set up payroll
                      </span>

                    </label>

                  </div>

                  {form.enablePayroll && (
                    <>

                      {/* =========================================
                          PAYROLL PERIOD
                      ========================================= */}

                      <div
                        style={{
                          marginBottom: "20px",
                        }}
                      >

                        <div
                          style={{
                            marginBottom:
                              "12px",
                            color:
                              "#8d96a9",
                            fontSize:
                              "10px",
                            fontWeight:
                              700,
                            letterSpacing:
                              "1.3px",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          PAYROLL PERIOD
                        </div>

                        <div className="employee-form-grid">

                          <div className="employee-field">

                            <label>
                              Month
                            </label>

                            <select
                              name="payrollMonth"
                              value={
                                form.payrollMonth
                              }
                              onChange={
                                handleChange
                              }
                              required
                            >
                              {MONTHS.map(
                                (
                                  month,
                                  index
                                ) => (
                                  <option
                                    key={
                                      month
                                    }
                                    value={
                                      index +
                                      1
                                    }
                                  >
                                    {month}
                                  </option>
                                )
                              )}
                            </select>

                          </div>

                          <div className="employee-field">

                            <label>
                              Year
                            </label>

                            <input
                              type="number"
                              name="payrollYear"
                              value={
                                form.payrollYear
                              }
                              onChange={
                                handleChange
                              }
                              min="2020"
                              max="2100"
                              required
                            />

                          </div>

                        </div>

                      </div>

                      {/* =========================================
                          EARNINGS
                      ========================================= */}

                      <div
                        style={{
                          marginBottom:
                            "20px",
                        }}
                      >

                        <div
                          style={{
                            marginBottom:
                              "12px",
                            color:
                              "#8d96a9",
                            fontSize:
                              "10px",
                            fontWeight:
                              700,
                            letterSpacing:
                              "1.3px",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          EARNINGS
                        </div>

                        <div className="employee-form-grid">

                          <div className="employee-field">

                            <label>
                              Basic Salary
                            </label>

                            <input
                              type="number"
                              name="basicSalary"
                              value={
                                form.basicSalary
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                              required={
                                form.enablePayroll
                              }
                            />

                          </div>

                          <div className="employee-field">

                            <label>
                              Allowances
                            </label>

                            <input
                              type="number"
                              name="allowances"
                              value={
                                form.allowances
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />

                          </div>

                          <div className="employee-field">

                            <label>
                              Bonus
                            </label>

                            <input
                              type="number"
                              name="bonus"
                              value={
                                form.bonus
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />

                          </div>

                          <div className="employee-field">

                            <label>
                              Overtime
                            </label>

                            <input
                              type="number"
                              name="overtime"
                              value={
                                form.overtime
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />

                          </div>

                          <div className="employee-field">

                            <label>
                              Other Earnings
                            </label>

                            <input
                              type="number"
                              name="otherEarnings"
                              value={
                                form.otherEarnings
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />

                          </div>

                        </div>

                      </div>

                      {/* =========================================
                          DEDUCTIONS
                      ========================================= */}

                      <div
                        style={{
                          marginBottom:
                            "20px",
                        }}
                      >

                        <div
                          style={{
                            marginBottom:
                              "12px",
                            color:
                              "#8d96a9",
                            fontSize:
                              "10px",
                            fontWeight:
                              700,
                            letterSpacing:
                              "1.3px",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          DEDUCTIONS
                        </div>

                        <div className="employee-form-grid">

                          <div className="employee-field">

                            <label>
                              Tax Deduction
                            </label>

                            <input
                              type="number"
                              name="taxDeduction"
                              value={
                                form.taxDeduction
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />

                          </div>

                          <div className="employee-field">

                            <label>
                              Provident Fund
                            </label>

                            <input
                              type="number"
                              name="providentFund"
                              value={
                                form.providentFund
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />

                          </div>

                          <div className="employee-field">

                            <label>
                              Other Deductions
                            </label>

                            <input
                              type="number"
                              name="otherDeductions"
                              value={
                                form.otherDeductions
                              }
                              onChange={
                                handleChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />

                          </div>

                        </div>

                      </div>

                      {/* =========================================
                          PAYROLL SUMMARY
                      ========================================= */}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(3, minmax(0, 1fr))",
                          gap: "10px",
                          marginBottom:
                            "20px",
                        }}
                      >

                        <div
                          style={{
                            padding:
                              "14px 16px",
                            border:
                              "1px solid rgba(255,255,255,0.07)",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(255,255,255,0.025)",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "block",
                              color:
                                "#69738a",
                              fontSize:
                                "10px",
                              marginBottom:
                                "6px",
                            }}
                          >
                            TOTAL EARNINGS
                          </span>

                          <strong
                            style={{
                              color:
                                "#ffffff",
                              fontSize:
                                "16px",
                            }}
                          >
                            {formatCurrency(
                              payrollTotals.earnings
                            )}
                          </strong>

                        </div>

                        <div
                          style={{
                            padding:
                              "14px 16px",
                            border:
                              "1px solid rgba(255,255,255,0.07)",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(255,255,255,0.025)",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "block",
                              color:
                                "#69738a",
                              fontSize:
                                "10px",
                              marginBottom:
                                "6px",
                            }}
                          >
                            TOTAL DEDUCTIONS
                          </span>

                          <strong
                            style={{
                              color:
                                "#fca5a5",
                              fontSize:
                                "16px",
                            }}
                          >
                            {formatCurrency(
                              payrollTotals.deductions
                            )}
                          </strong>

                        </div>

                        <div
                          style={{
                            padding:
                              "14px 16px",
                            border:
                              "1px solid rgba(99,102,241,0.22)",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(99,102,241,0.08)",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "block",
                              color:
                                "#818cf8",
                              fontSize:
                                "10px",
                              marginBottom:
                                "6px",
                            }}
                          >
                            NET SALARY
                          </span>

                          <strong
                            style={{
                              color:
                                "#ffffff",
                              fontSize:
                                "18px",
                            }}
                          >
                            {formatCurrency(
                              payrollTotals.net
                            )}
                          </strong>

                        </div>

                      </div>

                      {/* =========================================
                          PAYMENT
                      ========================================= */}

                      <div>

                        <div
                          style={{
                            marginBottom:
                              "12px",
                            color:
                              "#8d96a9",
                            fontSize:
                              "10px",
                            fontWeight:
                              700,
                            letterSpacing:
                              "1.3px",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          PAYMENT
                        </div>

                        <div className="employee-form-grid">

                          <div className="employee-field">

                            <label>
                              Status
                            </label>

                            <select
                              name="payrollStatus"
                              value={
                                form.payrollStatus
                              }
                              onChange={
                                handleChange
                              }
                            >
                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Paid">
                                Paid
                              </option>
                            </select>

                          </div>

                          <div className="employee-field">

                            <label>
                              Payment Date
                            </label>

                            <input
                              type="date"
                              name="paymentDate"
                              value={
                                form.paymentDate
                              }
                              onChange={
                                handleChange
                              }
                            />

                          </div>

                          <div className="employee-field">

                            <label>
                              Payment Method
                            </label>

                            <select
                              name="paymentMethod"
                              value={
                                form.paymentMethod
                              }
                              onChange={
                                handleChange
                              }
                            >
                              <option value="">
                                Select method
                              </option>

                              <option value="Bank Transfer">
                                Bank Transfer
                              </option>

                              <option value="UPI">
                                UPI
                              </option>

                              <option value="Cash">
                                Cash
                              </option>

                              <option value="Cheque">
                                Cheque
                              </option>
                            </select>

                          </div>

                          <div
                            className="employee-field"
                            style={{
                              gridColumn:
                                "1 / -1",
                            }}
                          >

                            <label>
                              Payroll Notes
                            </label>

                            <textarea
                              name="payrollNotes"
                              value={
                                form.payrollNotes
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Optional payroll notes..."
                              rows={3}
                              style={{
                                width:
                                  "100%",
                                resize:
                                  "vertical",
                                fontFamily:
                                  "inherit",
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </>
                  )}

                </div>
              )}

              {/* =================================================
                  FORM FOOTER
              ================================================= */}

              <div className="employee-form-footer">

                <button
                  type="button"
                  className="employees-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employees-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : editingEmployee
                    ? "Save Changes"
                    : form.enablePayroll
                    ? "Create Employee & Payroll"
                    : "Create Employee"}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* =================================================
            EMPLOYEE DIRECTORY
        ================================================= */}

        <section className="employee-directory">

          <div className="employee-directory-header">

            <div>

              <span className="employees-section-label">
                WORKFORCE
              </span>

              <h2>
                Employee Directory
              </h2>

              <p>
                View and manage everyone in your
                organization.
              </p>

            </div>

            <div className="employee-directory-count">
              {filteredEmployees.length}{" "}
              {filteredEmployees.length === 1
                ? "employee"
                : "employees"}
            </div>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="employee-filters">

            <div className="employee-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search name, email or department..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Roles
              </option>

              <option value="Employee">
                Employee
              </option>

              <option value="HR">
                HR
              </option>

              <option value="Manager">
                Manager
              </option>

              <option value="Billing">
                Billing
              </option>
            </select>

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

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          {loading ? (
            <div className="employees-empty-state">

              <div className="employees-loading-spinner" />

              <h3>
                Loading employees
              </h3>

              <p>
                Fetching your workforce data...
              </p>

            </div>
          ) : filteredEmployees.length ===
            0 ? (
            <div className="employees-empty-state">

              <div className="employees-empty-icon">
                👥
              </div>

              <h3>
                {employees.length === 0
                  ? "No employees yet"
                  : "No employees found"}
              </h3>

              <p>
                {employees.length === 0
                  ? "Add your first employee to start building your workforce."
                  : "Try adjusting your search or filters."}
              </p>

              {employees.length === 0 && (
                <button
                  className="employees-primary-button"
                  onClick={openAddForm}
                >
                  <span>+</span>
                  Add First Employee
                </button>
              )}

            </div>
          ) : (
            <div className="employee-table-wrapper">

              <table className="employee-table">

                <thead>

                  <tr>

                    <th>
                      Employee
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredEmployees.map(
                    (employee) => {

                      const status =
                        employee.status ||
                        "Active";

                      return (
                        <tr
                          key={
                            employee.id
                          }
                        >

                          <td>

                            <div className="employee-identity">

                              <div className="employee-avatar">
                                {getInitials(
                                  employee.name
                                )}
                              </div>

                              <div className="employee-identity-text">

                                <strong>
                                  {employee.name ||
                                    "Unnamed Employee"}
                                </strong>

                                <span>
                                  {employee.email}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <span className="role-badge">
                              {employee.role ||
                                "Employee"}
                            </span>

                          </td>

                          <td>

                            <span className="department-text">
                              {employee.department ||
                                "No department"}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`employee-status ${getStatusClass(
                                status
                              )}`}
                            >
                              <span className="employee-status-dot" />

                              {status}
                            </span>

                          </td>

                          <td>

                            <div className="employee-actions">

                              <button
                                className="employee-edit-button"
                                onClick={() =>
                                  openEditForm(
                                    employee
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="employee-delete-button"
                                onClick={() =>
                                  handleDelete(
                                    employee
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

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

      </div>
    </DashboardLayout>
  );
}