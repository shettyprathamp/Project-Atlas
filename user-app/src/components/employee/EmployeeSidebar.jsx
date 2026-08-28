import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./EmployeeSidebar.css";

export default function EmployeeSidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("atlas_token");
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      label: "Dashboard",
      path: "/employee",
      icon: "▦",
    },
    {
      label: "Attendance",
      path: "/employee/attendance",
      icon: "◷",
    },
    {
      label: "Leave",
      path: "/employee/leave",
      icon: "▣",
    },
    {
      label: "Payslips",
      path: "/employee/payslips",
      icon: "₹",
    },
    {
      label: "My Profile",
      path: "/employee/profile",
      icon: "●",
    },
  ];

  // =========================================================
  // USER
  // =========================================================

  const employeeName =
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Employee";

  const initials =
    employeeName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "E";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <aside className="employee-sidebar">

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="employee-sidebar-brand">

        <div className="employee-brand-mark">
          A
        </div>

        <div className="employee-brand-text">
          <strong>
            ATLAS
          </strong>

          <span>
            Employee Portal
          </span>
        </div>

      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="employee-sidebar-nav">

        <div className="employee-sidebar-section-title">
          WORKSPACE
        </div>

        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/employee"}
            className={({ isActive }) =>
              `employee-sidebar-link ${
                isActive
                  ? "employee-sidebar-link-active"
                  : ""
              }`
            }
          >

            <span className="employee-sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

            <span className="employee-sidebar-chevron">
              ›
            </span>

          </NavLink>
        ))}

      </nav>

      {/* =====================================================
          BOTTOM
      ===================================================== */}

      <div className="employee-sidebar-bottom">

        <div className="employee-sidebar-section-title">
          ACCOUNT
        </div>

        {/* ===================================================
            SETTINGS
        =================================================== */}

        <button
          type="button"
          className="employee-sidebar-link employee-sidebar-button"
          onClick={() =>
            navigate("/employee/settings")
          }
        >

          <span className="employee-sidebar-icon">
            ⚙
          </span>

          <span>
            Settings
          </span>

          <span className="employee-sidebar-chevron">
            ›
          </span>

        </button>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <button
          type="button"
          className="employee-sidebar-link employee-sidebar-button employee-sidebar-logout"
          onClick={handleLogout}
        >

          <span className="employee-sidebar-icon">
            ↪
          </span>

          <span>
            Logout
          </span>

        </button>

        {/* ===================================================
            USER CARD
        =================================================== */}

        <div className="employee-sidebar-user">

          <div className="employee-sidebar-avatar">
            {initials}
          </div>

          <div className="employee-sidebar-user-info">

            <strong title={employeeName}>
              {employeeName}
            </strong>

            <span>
              Employee
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}