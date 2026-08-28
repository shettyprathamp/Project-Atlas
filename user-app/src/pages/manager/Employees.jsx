import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Users,
  UserCircle,
  Building2,
  CircleCheck,
  CircleX,
  MoreHorizontal,
  Eye,
  UserRoundCog,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

import "./Employees.css";


function Employees() {

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [teamFilter, setTeamFilter] = useState("All Teams");

  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [statusFilter, setStatusFilter] = useState("All Status");


  /* =========================================================
     FETCH EMPLOYEES FROM BACKEND
  ========================================================= */

  const fetchEmployees = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await api.get("/employees/");

      const data = response.data;

      setEmployees(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to fetch employees:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load employees from the server."
      );

      setEmployees([]);

    } finally {

      setLoading(false);

    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    fetchEmployees();

  }, []);


  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const teams = useMemo(() => {

    const values = employees
      .map(
        (employee) =>
          employee.department
      )
      .filter(Boolean);

    return [
      ...new Set(values),
    ];

  }, [employees]);


  const roles = useMemo(() => {

    const values = employees
      .map(
        (employee) =>
          employee.role
      )
      .filter(Boolean);

    return [
      ...new Set(values),
    ];

  }, [employees]);


  /* =========================================================
     FILTER EMPLOYEES
  ========================================================= */

  const filteredEmployees = useMemo(() => {

    const searchValue =
      search
        .trim()
        .toLowerCase();

    return employees.filter(
      (employee) => {

        const matchesSearch =
          !searchValue ||
          employee.name
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.email
            ?.toLowerCase()
            .includes(searchValue) ||
          String(employee.id)
            .toLowerCase()
            .includes(searchValue) ||
          employee.role
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.department
            ?.toLowerCase()
            .includes(searchValue);


        const matchesTeam =
          teamFilter === "All Teams" ||
          employee.department === teamFilter;


        const matchesRole =
          roleFilter === "All Roles" ||
          employee.role === roleFilter;


        const matchesStatus =
          statusFilter === "All Status" ||
          employee.status === statusFilter;


        return (
          matchesSearch &&
          matchesTeam &&
          matchesRole &&
          matchesStatus
        );

      }
    );

  }, [
    employees,
    search,
    teamFilter,
    roleFilter,
    statusFilter,
  ]);


  /* =========================================================
     REAL BACKEND SUMMARY DATA
  ========================================================= */

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "Active"
    ).length;


  const inactiveEmployees =
    employees.filter(
      (employee) =>
        employee.status !== "Active"
    ).length;


  const teamCount =
    new Set(
      employees
        .map(
          (employee) =>
            employee.department
        )
        .filter(Boolean)
    ).size;


  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {

    return (
      <div className="manager-employees-page">

        <header className="employees-header">

          <div>

            <div className="employees-header-label">
              MANAGEMENT
            </div>

            <h1>
              Employees
            </h1>

            <p>
              View and manage employees across your organization.
            </p>

          </div>

        </header>


        <section className="employees-panel">

          <div
            style={{
              minHeight: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777e88",
              fontSize: "12px",
            }}
          >
            Loading employees...
          </div>

        </section>

      </div>
    );

  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="manager-employees-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="employees-header">

        <div>

          <div className="employees-header-label">
            MANAGEMENT
          </div>

          <h1>
            Employees
          </h1>

          <p>
            View and manage employees across your organization.
          </p>

        </div>


        <div className="employees-header-count">

          <Users size={18} />

          <div>

            <span>
              Total Employees
            </span>

            <strong>
              {employees.length}
            </strong>

          </div>

        </div>

      </header>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            border: "1px solid #3a2424",
            borderRadius: "8px",
            background: "#171010",
            color: "#c58d8d",
            fontSize: "11px",
          }}
        >
          {error}
        </div>

      )}


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="employees-summary-grid">

        <div className="employees-summary-card">

          <div className="employees-summary-icon">
            <Users size={20} />
          </div>

          <div>

            <span>
              Total Employees
            </span>

            <strong>
              {employees.length}
            </strong>

          </div>

        </div>


        <div className="employees-summary-card">

          <div className="employees-summary-icon">
            <CircleCheck size={20} />
          </div>

          <div>

            <span>
              Active
            </span>

            <strong>
              {activeEmployees}
            </strong>

          </div>

        </div>


        <div className="employees-summary-card">

          <div className="employees-summary-icon">
            <Building2 size={20} />
          </div>

          <div>

            <span>
              Teams
            </span>

            <strong>
              {teamCount}
            </strong>

          </div>

        </div>


        <div className="employees-summary-card">

          <div className="employees-summary-icon">
            <CircleX size={20} />
          </div>

          <div>

            <span>
              Inactive
            </span>

            <strong>
              {inactiveEmployees}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN EMPLOYEE PANEL
      ===================================================== */}

      <section className="employees-panel">

        {/* ===================================================
            PANEL HEADER
        =================================================== */}

        <div className="employees-panel-header">

          <div>

            <h2>
              All Employees
            </h2>

            <p>
              Manage employees and their team assignments.
            </p>

          </div>


          <button
            type="button"
            onClick={fetchEmployees}
            title="Refresh employees"
            className="employees-refresh-button"
          >

            <RefreshCw size={15} />

            <span>
              Refresh
            </span>

          </button>

        </div>


        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <div className="employees-filter-bar">

          {/* SEARCH */}

          <div className="employees-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search employees..."
            />

          </div>


          {/* TEAM */}

          <select
            className="employees-filter-select"
            value={teamFilter}
            onChange={(event) =>
              setTeamFilter(event.target.value)
            }
          >

            <option value="All Teams">
              All Teams
            </option>

            {teams.map(
              (team) => (

                <option
                  key={team}
                  value={team}
                >
                  {team}
                </option>

              )
            )}

          </select>


          {/* ROLE */}

          <select
            className="employees-filter-select"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
          >

            <option value="All Roles">
              All Roles
            </option>

            {roles.map(
              (role) => (

                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>

              )
            )}

          </select>


          {/* STATUS */}

          <select
            className="employees-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >

            <option value="All Status">
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


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="employees-table-wrapper">

          <table className="employees-table">

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Employee ID
                </th>

                <th>
                  Role
                </th>

                <th>
                  Team
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

              {filteredEmployees.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      height: "180px",
                      textAlign: "center",
                      color: "#666d77",
                    }}
                  >

                    {employees.length === 0
                      ? "No employees found."
                      : "No employees match your filters."
                    }

                  </td>

                </tr>

              ) : (

                filteredEmployees.map(
                  (employee) => (

                    <tr
                      key={employee.id}
                    >

                      {/* EMPLOYEE */}

                      <td>

                        <div className="employee-person">

                          <div className="employee-avatar">
                            <UserCircle size={21} />
                          </div>

                          <div className="employee-person-info">

                            <strong>
                              {employee.name}
                            </strong>

                            <span>
                              {employee.email}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* ID */}

                      <td>

                        <span className="employee-id">
                          {employee.id}
                        </span>

                      </td>


                      {/* ROLE */}

                      <td>

                        <span className="employee-role">
                          {employee.role || "—"}
                        </span>

                      </td>


                      {/* TEAM */}

                      <td>

                        <div className="employee-team">

                          <Building2 size={15} />

                          <span>
                            {employee.department || "—"}
                          </span>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            employee.status === "Active"
                              ? "employee-status active"
                              : "employee-status inactive"
                          }
                        >

                          <span className="employee-status-dot" />

                          {employee.status || "Unknown"}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="employee-actions">

                          <button
                            type="button"
                            title="View employee"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Manage employee"
                          >
                            <UserRoundCog size={16} />
                          </button>

                          <button
                            type="button"
                            title="More options"
                          >
                            <MoreHorizontal size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="employees-table-footer">

          <span>
            Showing {filteredEmployees.length} of{" "}
            {employees.length} employees
          </span>

          <div className="employees-pagination">

            <button
              type="button"
              disabled
            >
              Previous
            </button>

            <button
              type="button"
              className="active"
            >
              1
            </button>

            <button
              type="button"
              disabled
            >
              Next
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}


export default Employees;