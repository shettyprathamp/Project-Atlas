
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Clock3,
  FileText,
  CalendarCheck,
  ClipboardList,
  Wallet,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

import "./ManagerShell.css";

function ManagerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="manager-sidebar">

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="manager-brand">

        <div className="manager-brand-title">
          PROJECT ATLAS
        </div>

        <div className="manager-brand-role">
          MANAGER
        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="manager-navigation">

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager")
          }
        >
          <LayoutDashboard size={19} />

          <span>
            Dashboard
          </span>
        </button>


        {/* ===================================================
            MANAGEMENT
        =================================================== */}

        <div className="manager-section-title">
          MANAGEMENT
        </div>


        {/* EMPLOYEES */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/employees")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/employees")
          }
        >
          <Users size={19} />

          <span>
            Employees
          </span>
        </button>


        {/* TEAMS */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/teams")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/teams")
          }
        >
          <Building2 size={19} />

          <span>
            Teams
          </span>
        </button>


        {/* PERFORMANCE */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/performance")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/performance")
          }
        >
          <BarChart3 size={19} />

          <span>
            Performance
          </span>
        </button>


        {/* ATTENDANCE */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/attendance")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/attendance")
          }
        >
          <Clock3 size={19} />

          <span>
            Attendance
          </span>
        </button>


        {/* LEAVE MANAGEMENT */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/leave")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/leave")
          }
        >
          <FileText size={19} />

          <span>
            Leave Management
          </span>
        </button>


        {/* ===================================================
            PAYROLL MANAGEMENT
        =================================================== */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/payroll")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/payroll")
          }
        >
          <Wallet size={19} />

          <span>
            Payroll
          </span>
        </button>


        {/* ===================================================
            MY WORKSPACE
        =================================================== */}

        <div className="manager-section-title">
          MY WORKSPACE
        </div>


        {/* MY ATTENDANCE */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/my-attendance")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/my-attendance")
          }
        >
          <CalendarCheck size={19} />

          <span>
            My Attendance
          </span>
        </button>


        {/* MY LEAVE */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/my-leave")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/my-leave")
          }
        >
          <ClipboardList size={19} />

          <span>
            My Leave
          </span>
        </button>


        {/* MY PAYROLL */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/my-payroll")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/my-payroll")
          }
        >
          <Wallet size={19} />

          <span>
            My Payroll
          </span>
        </button>


        {/* MY PROFILE */}

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/profile")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/profile")
          }
        >
          <UserCircle size={19} />

          <span>
            My Profile
          </span>
        </button>


        {/* ===================================================
            SETTINGS
        =================================================== */}

        <div className="manager-settings-space" />

        <button
          type="button"
          className={`manager-nav-item ${
            isActive("/manager/settings")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/manager/settings")
          }
        >
          <Settings size={19} />

          <span>
            Settings
          </span>
        </button>

      </nav>


      {/* =====================================================
          SIDEBAR FOOTER
      ===================================================== */}

      <div className="manager-sidebar-footer">

        <div className="manager-user">

          <div className="manager-user-avatar">
            <UserCircle size={21} />
          </div>

          <div className="manager-user-info">

            <div className="manager-user-name">
              {user?.name || "Manager"}
            </div>

            <div className="manager-user-role">
              Manager
            </div>

          </div>

        </div>


        <button
          type="button"
          className="manager-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default ManagerSidebar;