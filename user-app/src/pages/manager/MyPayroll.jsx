import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Clock3,
  RefreshCw,
  WalletCards,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./MyPayroll.css";


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

  if (value === "paid") {
    return "my-payroll-status-paid";
  }

  if (value === "approved") {
    return "my-payroll-status-approved";
  }

  if (value === "pending") {
    return "my-payroll-status-pending";
  }

  if (value === "rejected") {
    return "my-payroll-status-rejected";
  }

  return "my-payroll-status-default";
}


// =========================================================
// PAGE
// =========================================================

export default function MyPayroll() {
  const { user } = useAuth();

  const [payroll, setPayroll] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =======================================================
  // FETCH MY PAYROLL
  // =======================================================

  const fetchMyPayroll = async () => {
    if (!user?.employee_id) {
      setPayroll([]);
      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/payroll/employee/${user.employee_id}`
      );

      setPayroll(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load manager payroll:",
        err
      );

      setPayroll([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load your payroll records."
      );
    } finally {
      setLoading(false);
    }
  };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchMyPayroll();
  }, [user?.employee_id]);


  // =======================================================
  // SORT PAYROLL
  // =======================================================

  const sortedPayroll = useMemo(() => {
    return [...payroll].sort((a, b) => {
      const first =
        Number(a.year || 0) * 100 +
        Number(a.month || 0);

      const second =
        Number(b.year || 0) * 100 +
        Number(b.month || 0);

      return second - first;
    });
  }, [payroll]);


  // =======================================================
  // LATEST PAYROLL
  // =======================================================

  const latestPayroll =
    sortedPayroll.length > 0
      ? sortedPayroll[0]
      : null;


  // =======================================================
  // TOTALS
  // =======================================================

  const totalPayrollRecords =
    sortedPayroll.length;

  const paidRecords =
    sortedPayroll.filter(
      (record) =>
        record.status?.toLowerCase() ===
        "paid"
    ).length;

  const pendingRecords =
    sortedPayroll.filter(
      (record) =>
        record.status?.toLowerCase() ===
        "pending"
    ).length;


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="manager-my-payroll-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="manager-my-payroll-header">

        <div>
          <span className="manager-my-payroll-eyebrow">
            WORKSPACE · MY PAYROLL
          </span>

          <h1>
            My Payroll
          </h1>

          <p>
            View your salary, payroll history,
            earnings, deductions, and payment
            information.
          </p>
        </div>

        <button
          type="button"
          className="manager-my-payroll-refresh"
          onClick={fetchMyPayroll}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "manager-my-payroll-spin"
                : ""
            }
          />

          Refresh
        </button>

      </section>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="manager-my-payroll-alert error">

          <CircleAlert size={17} />

          <span>
            {error}
          </span>

        </div>
      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="manager-my-payroll-summary">

        <div className="manager-my-payroll-summary-card">

          <div className="summary-icon">
            <WalletCards size={18} />
          </div>

          <div>
            <span>
              Latest Net Salary
            </span>

            <strong>
              {loading
                ? "—"
                : latestPayroll
                  ? formatMoney(
                      latestPayroll.net_salary
                    )
                  : "₹0"}
            </strong>

            <small>
              {latestPayroll
                ? formatMonth(
                    latestPayroll.month,
                    latestPayroll.year
                  )
                : "No payroll available"}
            </small>
          </div>

        </div>


        <div className="manager-my-payroll-summary-card">

          <div className="summary-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>
              Payroll Records
            </span>

            <strong>
              {loading
                ? "—"
                : totalPayrollRecords}
            </strong>

            <small>
              Records associated with your account
            </small>
          </div>

        </div>


        <div className="manager-my-payroll-summary-card">

          <div className="summary-icon">
            <CircleCheck size={18} />
          </div>

          <div>
            <span>
              Paid Records
            </span>

            <strong>
              {loading
                ? "—"
                : paidRecords}
            </strong>

            <small>
              Successfully paid payrolls
            </small>
          </div>

        </div>


        <div className="manager-my-payroll-summary-card">

          <div className="summary-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {loading
                ? "—"
                : pendingRecords}
            </strong>

            <small>
              Awaiting payment
            </small>
          </div>

        </div>

      </section>


      {/* ===================================================
          LATEST PAYROLL
      =================================================== */}

      {latestPayroll && (
        <section className="manager-my-payroll-section">

          <div className="manager-my-payroll-section-heading">

            <div>
              <span>
                CURRENT PAYROLL
              </span>

              <h2>
                Latest Payroll
              </h2>

              <p>
                Your most recent payroll record.
              </p>
            </div>

            <span
              className={`manager-my-payroll-status ${getStatusClass(
                latestPayroll.status
              )}`}
            >
              {latestPayroll.status || "Pending"}
            </span>

          </div>


          <div className="manager-my-payroll-latest">

            <div className="salary-main">

              <span>
                NET SALARY
              </span>

              <strong>
                {formatMoney(
                  latestPayroll.net_salary
                )}
              </strong>

              <small>
                {formatMonth(
                  latestPayroll.month,
                  latestPayroll.year
                )}
              </small>

            </div>


            <div className="salary-breakdown">

              <div>
                <span>
                  Basic Salary
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.basic_salary
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Allowances
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.allowances
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Bonus
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.bonus
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Overtime
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.overtime
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Other Earnings
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.other_earnings
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Total Earnings
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.total_earnings
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Tax Deduction
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.tax_deduction
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Provident Fund
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.provident_fund
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Other Deductions
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.other_deductions
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Total Deductions
                </span>

                <strong>
                  {formatMoney(
                    latestPayroll.total_deductions
                  )}
                </strong>
              </div>

            </div>

          </div>


          <div className="manager-my-payroll-payment">

            <div>
              <span>
                Payment Date
              </span>

              <strong>
                {formatDate(
                  latestPayroll.payment_date
                )}
              </strong>
            </div>

            <div>
              <span>
                Payment Method
              </span>

              <strong>
                {latestPayroll.payment_method ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>
                Payroll Status
              </span>

              <strong>
                {latestPayroll.status ||
                  "Pending"}
              </strong>
            </div>

          </div>

        </section>
      )}


      {/* ===================================================
          PAYROLL HISTORY
      =================================================== */}

      <section className="manager-my-payroll-section">

        <div className="manager-my-payroll-section-heading">

          <div>
            <span>
              PAYROLL HISTORY
            </span>

            <h2>
              Previous Payroll
            </h2>

            <p>
              Review all payroll records associated
              with your account.
            </p>
          </div>

        </div>


        <div className="manager-my-payroll-table-wrapper">

          {loading ? (
            <div className="manager-my-payroll-empty">
              <span>
                Loading your payroll...
              </span>
            </div>
          ) : sortedPayroll.length === 0 ? (
            <div className="manager-my-payroll-empty">

              <strong>
                No payroll history
              </strong>

              <span>
                There are no payroll records available
                for your account.
              </span>

            </div>
          ) : (
            <table className="manager-my-payroll-table">

              <thead>
                <tr>
                  <th>
                    Period
                  </th>

                  <th>
                    Basic
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
                </tr>
              </thead>

              <tbody>

                {sortedPayroll.map(
                  (record) => (
                    <tr key={record.id}>

                      <td>
                        <strong>
                          {formatMonth(
                            record.month,
                            record.year
                          )}
                        </strong>

                        <span>
                          Payroll #{record.id}
                        </span>
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
                          className={`manager-my-payroll-status ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status ||
                            "Pending"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          record.payment_date
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </section>

    </div>
  );
}