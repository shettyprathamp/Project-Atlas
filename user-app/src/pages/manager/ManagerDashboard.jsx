import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Users,
  Building2,
  Clock3,
  FileText,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

import "./ManagerDashboard.css";


function ManagerDashboard() {

  const navigate = useNavigate();

  const { user } = useAuth();


  const [dashboardData, setDashboardData] = useState({
    employees: 0,
    teams: 0,
    attendance: 0,
    pendingLeave: 0,
  });


  const [teams, setTeams] = useState([]);

  const [teamEmployeeCounts, setTeamEmployeeCounts] = useState({});

  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);

  const [todayAttendance, setTodayAttendance] = useState([]);


  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    let mounted = true;


    async function loadDashboard() {

      try {

        setLoading(true);

        setError("");


        /*
         * =====================================================
         * LOAD MAIN DASHBOARD DATA
         * =====================================================
         */

        const [
          employeesResponse,
          teamsResponse,
          attendanceResponse,
          leaveResponse,
        ] = await Promise.all([
          api.get("/employees/"),
          api.get("/manager/teams/"),
          api.get("/manager/attendance/"),
          api.get("/manager/leave/"),
        ]);


        if (!mounted) {
          return;
        }


        const employees =
          Array.isArray(employeesResponse.data)
            ? employeesResponse.data
            : [];


        const teamsData =
          Array.isArray(teamsResponse.data)
            ? teamsResponse.data
            : [];


        const attendance =
          Array.isArray(attendanceResponse.data)
            ? attendanceResponse.data
            : [];


        const leaveRequests =
          Array.isArray(leaveResponse.data)
            ? leaveResponse.data
            : [];


        /*
         * =====================================================
         * TODAY'S DATE
         * =====================================================
         */

        const today = new Date();

        const todayYear =
          today.getFullYear();

        const todayMonth =
          String(today.getMonth() + 1)
            .padStart(2, "0");

        const todayDay =
          String(today.getDate())
            .padStart(2, "0");

        const todayString =
          `${todayYear}-${todayMonth}-${todayDay}`;


        /*
         * =====================================================
         * TODAY'S ATTENDANCE
         * =====================================================
         */

        const todaysAttendance =
          attendance.filter((record) => {

            if (!record?.date) {
              return false;
            }


            const recordDate =
              String(record.date).slice(0, 10);


            return recordDate === todayString;

          });


        /*
         * =====================================================
         * PENDING LEAVE
         * =====================================================
         */

        const pendingLeave =
          leaveRequests.filter((request) => {

            return (
              String(request?.status || "")
                .toLowerCase() === "pending"
            );

          });


        /*
         * =====================================================
         * LOAD EMPLOYEE COUNTS FOR EACH TEAM
         *
         * Uses the existing backend endpoint:
         *
         * GET /manager/teams/{team_id}/employees
         * =====================================================
         */

        const teamCountEntries =
          await Promise.all(
            teamsData.map(async (team) => {

              try {

                const response =
                  await api.get(
                    `/manager/teams/${team.id}/employees`
                  );


                const teamEmployees =
                  Array.isArray(response.data)
                    ? response.data
                    : [];


                return [
                  team.id,
                  teamEmployees.length,
                ];

              } catch (teamError) {

                console.error(
                  `Unable to load employees for team ${team.id}:`,
                  teamError
                );


                return [
                  team.id,
                  0,
                ];

              }

            })
          );


        if (!mounted) {
          return;
        }


        const counts =
          Object.fromEntries(teamCountEntries);


        /*
         * =====================================================
         * SAVE DATA
         * =====================================================
         */

        setDashboardData({
          employees: employees.length,
          teams: teamsData.length,
          attendance: todaysAttendance.length,
          pendingLeave: pendingLeave.length,
        });


        setTeams(teamsData);

        setTeamEmployeeCounts(counts);

        setPendingLeaveRequests(
          pendingLeave.slice(0, 5)
        );

        setTodayAttendance(
          todaysAttendance.slice(0, 8)
        );

      } catch (requestError) {

        console.error(
          "Manager dashboard loading failed:",
          requestError
        );


        if (!mounted) {
          return;
        }


        setError(
          requestError?.response?.data?.detail ||
          "Unable to load dashboard data."
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    loadDashboard();


    return () => {
      mounted = false;
    };

  }, []);


  return (
    <>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="manager-header">

        <div className="manager-header-content">

          <div className="manager-header-label">
            MANAGER WORKSPACE
          </div>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back. Here's an overview of your organization.
          </p>

        </div>


        <div className="manager-header-user">

          <div className="manager-header-avatar">
            <UserCircle size={22} />
          </div>

          <div>

            <strong>
              {user?.name || "Manager"}
            </strong>

            <span>
              Manager
            </span>

          </div>

        </div>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="manager-dashboard-error">
          {error}
        </div>

      )}


      {/* ===================================================
          KPI GRID
      =================================================== */}

      <section className="manager-kpi-grid">

        <div className="manager-kpi-card">

          <div className="manager-kpi-icon">
            <Users size={21} />
          </div>

          <div className="manager-kpi-content">

            <span>
              Total Employees
            </span>

            <strong>
              {loading
                ? "..."
                : dashboardData.employees}
            </strong>

          </div>

        </div>


        <div className="manager-kpi-card">

          <div className="manager-kpi-icon">
            <Building2 size={21} />
          </div>

          <div className="manager-kpi-content">

            <span>
              Teams
            </span>

            <strong>
              {loading
                ? "..."
                : dashboardData.teams}
            </strong>

          </div>

        </div>


        <div className="manager-kpi-card">

          <div className="manager-kpi-icon">
            <Clock3 size={21} />
          </div>

          <div className="manager-kpi-content">

            <span>
              Today's Attendance
            </span>

            <strong>
              {loading
                ? "..."
                : dashboardData.attendance}
            </strong>

          </div>

        </div>


        <div className="manager-kpi-card">

          <div className="manager-kpi-icon">
            <FileText size={21} />
          </div>

          <div className="manager-kpi-content">

            <span>
              Pending Leave
            </span>

            <strong>
              {loading
                ? "..."
                : dashboardData.pendingLeave}
            </strong>

          </div>

        </div>

      </section>


      {/* ===================================================
          DASHBOARD GRID
      =================================================== */}

      <section className="manager-dashboard-grid">


        {/* =================================================
            TEAM OVERVIEW
        ================================================= */}

        <div className="manager-panel manager-panel-large">

          <div className="manager-panel-header">

            <div>

              <h2>
                Team Overview
              </h2>

              <p>
                Organization-wide team information
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/manager/teams")
              }
            >
              View Teams
            </button>

          </div>


          <div className="manager-dashboard-list">

            {loading && (

              <div className="manager-dashboard-loading">
                Loading teams...
              </div>

            )}


            {!loading && teams.length === 0 && (

              <div className="manager-empty-state">

                <Building2 size={34} />

                <h3>
                  No teams found
                </h3>

                <p>
                  Create a team from the Teams section.
                </p>

              </div>

            )}


            {!loading && teams.length > 0 && (

              <div className="manager-team-list">

                {teams.map((team) => (

                  <div
                    className="manager-team-row"
                    key={team.id}
                  >

                    <div className="manager-team-icon">
                      <Building2 size={18} />
                    </div>


                    <div className="manager-team-info">

                      <strong>
                        {team.name}
                      </strong>

                      <span>
                        {team.description ||
                          "No description provided."}
                      </span>

                    </div>


                    <div className="manager-team-count">

                      <Users size={14} />

                      <span>
                        {teamEmployeeCounts[team.id] ?? 0}
                      </span>

                      <small>
                        {teamEmployeeCounts[team.id] === 1
                          ? "employee"
                          : "employees"}
                      </small>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            LEAVE REQUESTS
        ================================================= */}

        <div className="manager-panel">

          <div className="manager-panel-header">

            <div>

              <h2>
                Leave Requests
              </h2>

              <p>
                Pending requests
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/manager/leave")
              }
            >
              View
            </button>

          </div>


          <div className="manager-dashboard-list">

            {loading && (

              <div className="manager-dashboard-loading">
                Loading leave requests...
              </div>

            )}


            {!loading &&
              pendingLeaveRequests.length === 0 && (

                <div className="manager-empty-state small">

                  <FileText size={30} />

                  <p>
                    No pending leave requests.
                  </p>

                </div>

              )}


            {!loading &&
              pendingLeaveRequests.length > 0 && (

                <div className="manager-leave-list">

                  {pendingLeaveRequests.map((request) => (

                    <div
                      className="manager-leave-row"
                      key={request.leave_id}
                    >

                      <div className="manager-leave-info">

                        <strong>
                          {request.employee_name}
                        </strong>

                        <span>
                          {request.leave_type}
                          {" • "}
                          {request.total_days}
                          {" "}
                          {request.total_days === 1
                            ? "day"
                            : "days"}
                        </span>

                        <small>
                          {request.start_date}
                          {" → "}
                          {request.end_date}
                        </small>

                      </div>


                      <span className="manager-status-pending">
                        {request.status}
                      </span>

                    </div>

                  ))}

                </div>

              )}

          </div>

        </div>


        {/* =================================================
            ATTENDANCE
        ================================================= */}

        <div className="manager-panel">

          <div className="manager-panel-header">

            <div>

              <h2>
                Attendance
              </h2>

              <p>
                Today's organization status
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/manager/attendance")
              }
            >
              View
            </button>

          </div>


          <div className="manager-dashboard-list">

            {loading && (

              <div className="manager-dashboard-loading">
                Loading attendance...
              </div>

            )}


            {!loading &&
              todayAttendance.length === 0 && (

                <div className="manager-empty-state small">

                  <Clock3 size={30} />

                  <p>
                    No attendance records for today.
                  </p>

                </div>

              )}


            {!loading &&
              todayAttendance.length > 0 && (

                <div className="manager-attendance-list">

                  {todayAttendance.map((record) => (

                    <div
                      className="manager-attendance-row"
                      key={record.attendance_id}
                    >

                      <div className="manager-attendance-info">

                        <strong>
                          {record.employee_name}
                        </strong>

                        <span>
                          {record.team_name ||
                            "No team assigned"}
                        </span>

                      </div>


                      <div className="manager-attendance-time">

                        <span>
                          {record.check_in ||
                            "--:--"}
                        </span>

                        <small>
                          {record.check_out ||
                            "Not checked out"}
                        </small>

                      </div>


                      <span className="manager-attendance-status">
                        {record.status || "Unknown"}
                      </span>

                    </div>

                  ))}

                </div>

              )}

          </div>

        </div>

      </section>

    </>
  );
}


export default ManagerDashboard;