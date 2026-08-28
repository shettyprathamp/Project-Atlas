import { useEffect, useMemo, useState } from "react";
import "./Payroll.css";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Payroll() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH PAYROLL
  // =========================================================

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.employee_id) {
        setPayrollHistory([]);
        setError(
          "Unable to identify the logged-in employee."
        );
        return;
      }

      console.log(
        "ATLAS PAYROLL EMPLOYEE ID:",
        user.employee_id
      );

      const response = await api.get(
        `/payroll/employee/${user.employee_id}`
      );

      console.log(
        "ATLAS PAYROLL RESPONSE:",
        response.data
      );

      setPayrollHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load payroll:",
        err
      );

      console.error(
        "ATLAS PAYROLL STATUS:",
        err.response?.status
      );

      console.error(
        "ATLAS PAYROLL ERROR:",
        err.response?.data
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load payroll information."
        );
      }

      setPayrollHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    // Wait until AuthContext finishes restoring
    // the logged-in user.
    if (authLoading) {
      return;
    }

    if (!user?.employee_id) {
      setLoading(false);
      setPayrollHistory([]);
      setError(
        "Unable to identify the logged-in employee."
      );
      return;
    }

    fetchPayroll();
  }, [authLoading, user]);

  // =========================================================
  // SORT PAYROLL
  // =========================================================

  const sortedPayroll = useMemo(() => {
    return [...payrollHistory].sort(
      (a, b) => {
        const dateA = new Date(
          Number(a.year),
          Number(a.month) - 1,
          1
        );

        const dateB = new Date(
          Number(b.year),
          Number(b.month) - 1,
          1
        );

        return dateB - dateA;
      }
    );
  }, [payrollHistory]);

  // =========================================================
  // LATEST PAYROLL
  // =========================================================

  const currentPayroll =
    sortedPayroll.length > 0
      ? sortedPayroll[0]
      : null;

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (amount) => {
    if (
      amount === null ||
      amount === undefined
    ) {
      return "₹0";
    }

    const numericAmount =
      Number(amount);

    if (Number.isNaN(numericAmount)) {
      return "₹0";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(numericAmount);
  };

  // =========================================================
  // FORMAT MONTH
  // =========================================================

  const formatMonth = (
    month,
    year
  ) => {
    if (!month || !year) {
      return "—";
    }

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
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
  // LOADING
  // =========================================================

  if (authLoading || loading) {
    return (
      <div className="employee-payroll-page">
        <div className="employee-payroll-header">
          <div>
            <span className="employee-payroll-eyebrow">
              FINANCE
            </span>

            <h1>Payroll</h1>

            <p>
              Loading your payroll information...
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
    <div className="employee-payroll-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="employee-payroll-header">
        <div>
          <span className="employee-payroll-eyebrow">
            FINANCE
          </span>

          <h1>Payroll</h1>

          <p>
            View your salary details, deductions,
            and payroll history.
          </p>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border:
              "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          NO PAYROLL DATA
      ====================================================== */}

      {!currentPayroll && !error && (
        <section
          className="employee-payroll-current"
          style={{
            marginBottom: "24px",
          }}
        >
          <div className="employee-payroll-section-header">
            <div>
              <h2>
                No Payroll Records
              </h2>

              <p>
                There are currently no payroll
                records available for your account.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          CURRENT SALARY OVERVIEW
      ====================================================== */}

      {currentPayroll && (
        <>
          <section className="employee-payroll-overview">

            {/* NET SALARY */}

            <div className="employee-payroll-card primary">

              <div className="employee-payroll-card-top">
                <span>
                  Net Salary
                </span>

                <div className="employee-payroll-icon">
                  ₹
                </div>
              </div>

              <strong>
                {formatMoney(
                  currentPayroll.net_salary
                )}
              </strong>

              <small>
                Current monthly take-home
              </small>

            </div>

            {/* BASIC SALARY */}

            <div className="employee-payroll-card">

              <div className="employee-payroll-card-top">
                <span>
                  Basic Salary
                </span>

                <div className="employee-payroll-icon">
                  B
                </div>
              </div>

              <strong>
                {formatMoney(
                  currentPayroll.basic_salary
                )}
              </strong>

              <small>
                Monthly basic pay
              </small>

            </div>

            {/* ALLOWANCES */}

            <div className="employee-payroll-card">

              <div className="employee-payroll-card-top">
                <span>
                  Allowances
                </span>

                <div className="employee-payroll-icon">
                  +
                </div>
              </div>

              <strong>
                {formatMoney(
                  currentPayroll.allowances
                )}
              </strong>

              <small>
                Total allowances
              </small>

            </div>

            {/* DEDUCTIONS */}

            <div className="employee-payroll-card">

              <div className="employee-payroll-card-top">
                <span>
                  Deductions
                </span>

                <div className="employee-payroll-icon">
                  −
                </div>
              </div>

              <strong>
                {formatMoney(
                  currentPayroll.total_deductions
                )}
              </strong>

              <small>
                Total deductions
              </small>

            </div>

          </section>

          {/* =================================================
              CURRENT PAYROLL
          ================================================== */}

          <section className="employee-payroll-current">

            <div className="employee-payroll-section-header">

              <div>
                <h2>
                  Current Payroll
                </h2>

                <p>
                  Salary breakdown for{" "}
                  {formatMonth(
                    currentPayroll.month,
                    currentPayroll.year
                  )}
                </p>
              </div>

              <span
                className={`employee-payroll-status ${String(
                  currentPayroll.status || "Pending"
                ).toLowerCase()}`}
              >
                <span className="status-dot" />

                {currentPayroll.status ||
                  "Pending"}
              </span>

            </div>

            {/* PAYROLL BREAKDOWN */}

            <div className="employee-payroll-breakdown">

              {/* BASIC */}

              <div className="payroll-row">
                <span>
                  Basic Salary
                </span>

                <strong>
                  {formatMoney(
                    currentPayroll.basic_salary
                  )}
                </strong>
              </div>

              {/* ALLOWANCES */}

              <div className="payroll-row">
                <span>
                  Allowances
                </span>

                <strong>
                  {formatMoney(
                    currentPayroll.allowances
                  )}
                </strong>
              </div>

              {/* BONUS */}

              <div className="payroll-row">
                <span>
                  Bonus
                </span>

                <strong>
                  {formatMoney(
                    currentPayroll.bonus
                  )}
                </strong>
              </div>

              {/* OVERTIME */}

              <div className="payroll-row">
                <span>
                  Overtime
                </span>

                <strong>
                  {formatMoney(
                    currentPayroll.overtime
                  )}
                </strong>
              </div>

              {/* OTHER EARNINGS */}

              <div className="payroll-row">
                <span>
                  Other Earnings
                </span>

                <strong>
                  {formatMoney(
                    currentPayroll.other_earnings
                  )}
                </strong>
              </div>

              <div className="payroll-divider" />

              {/* TOTAL EARNINGS */}

              <div className="payroll-row total">
                <span>
                  Total Earnings
                </span>

                <strong>
                  {formatMoney(
                    currentPayroll.total_earnings
                  )}
                </strong>
              </div>

              {/* TAX */}

              <div className="payroll-row deduction">
                <span>
                  Tax Deduction
                </span>

                <strong>
                  -{" "}
                  {formatMoney(
                    currentPayroll.tax_deduction
                  )}
                </strong>
              </div>

              {/* PF */}

              <div className="payroll-row deduction">
                <span>
                  Provident Fund
                </span>

                <strong>
                  -{" "}
                  {formatMoney(
                    currentPayroll.provident_fund
                  )}
                </strong>
              </div>

              {/* OTHER DEDUCTIONS */}

              <div className="payroll-row deduction">
                <span>
                  Other Deductions
                </span>

                <strong>
                  -{" "}
                  {formatMoney(
                    currentPayroll.other_deductions
                  )}
                </strong>
              </div>

              <div className="payroll-divider" />

              {/* TOTAL DEDUCTIONS */}

              <div className="payroll-row total">
                <span>
                  Total Deductions
                </span>

                <strong>
                  -{" "}
                  {formatMoney(
                    currentPayroll.total_deductions
                  )}
                </strong>
              </div>

              <div className="payroll-divider" />

              {/* NET */}

              <div className="payroll-row net">
                <span>
                  Net Salary
                </span>

                <strong>
                  {formatMoney(
                    currentPayroll.net_salary
                  )}
                </strong>
              </div>

            </div>

            {/* PAYROLL FOOTER */}

            <div className="employee-payroll-footer">

              <div>
                <span>
                  Pay Date
                </span>

                <strong>
                  {formatDate(
                    currentPayroll.payment_date
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Payment Method
                </span>

                <strong>
                  {currentPayroll.payment_method ||
                    "—"}
                </strong>
              </div>

            </div>

          </section>
        </>
      )}

      {/* =====================================================
          PAYROLL HISTORY
      ====================================================== */}

      <section className="employee-payroll-history">

        <div className="employee-payroll-section-header">

          <div>
            <h2>
              Payroll History
            </h2>

            <p>
              Your previous salary payments
            </p>
          </div>

        </div>

        <div className="employee-payroll-table-wrapper">

          <table className="employee-payroll-table">

            <thead>
              <tr>
                <th>
                  Month
                </th>

                <th>
                  Pay Date
                </th>

                <th>
                  Basic
                </th>

                <th>
                  Allowances
                </th>

                <th>
                  Deductions
                </th>

                <th>
                  Net Pay
                </th>

                <th>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>

              {sortedPayroll.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No payroll records found.
                  </td>
                </tr>

              ) : (

                sortedPayroll.map(
                  (payroll) => (

                    <tr
                      key={payroll.id}
                    >

                      {/* MONTH */}

                      <td>
                        <strong>
                          {formatMonth(
                            payroll.month,
                            payroll.year
                          )}
                        </strong>
                      </td>

                      {/* PAY DATE */}

                      <td>
                        {formatDate(
                          payroll.payment_date
                        )}
                      </td>

                      {/* BASIC */}

                      <td>
                        {formatMoney(
                          payroll.basic_salary
                        )}
                      </td>

                      {/* ALLOWANCES */}

                      <td>
                        {formatMoney(
                          payroll.allowances
                        )}
                      </td>

                      {/* DEDUCTIONS */}

                      <td className="deduction-text">
                        {formatMoney(
                          payroll.total_deductions
                        )}
                      </td>

                      {/* NET */}

                      <td className="net-pay">
                        {formatMoney(
                          payroll.net_salary
                        )}
                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`employee-payroll-status ${String(
                            payroll.status ||
                              "Pending"
                          ).toLowerCase()}`}
                        >

                          <span className="status-dot" />

                          {payroll.status ||
                            "Pending"}

                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}