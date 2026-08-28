import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const menuItems = {
  manager: [
    { label: "Dashboard", path: "/manager" },
    { label: "Employees", path: "/manager/employees" },
    { label: "Projects", path: "/manager/projects" },
    { label: "Attendance", path: "/manager/attendance" },
    { label: "Leave", path: "/manager/leave" },
    { label: "Billing", path: "/manager/billing" },
    { label: "Reports", path: "/manager/reports" },
  ],

  hr: [
    { label: "Dashboard", path: "/hr" },
    { label: "Employees", path: "/hr/employees" },
    { label: "Attendance", path: "/hr/attendance" },
    { label: "Leave", path: "/hr/leave" },
    { label: "Recruitment", path: "/hr/recruitment" },
    { label: "Payroll", path: "/hr/payroll" },
    { label: "Reports", path: "/hr/reports" },
  ],

  billing: [
    { label: "Dashboard", path: "/billing" },
    { label: "Invoices", path: "/billing/invoices" },
    { label: "Customers", path: "/billing/customers" },
    { label: "Payments", path: "/billing/payments" },
    { label: "Expenses", path: "/billing/expenses" },
    { label: "Reports", path: "/billing/reports" },
  ],

  employee: [
    { label: "Dashboard", path: "/employee" },
    { label: "Attendance", path: "/employee/attendance" },
    { label: "Leave", path: "/employee/leave" },
    { label: "Tasks", path: "/employee/tasks" },
    { label: "Payslips", path: "/employee/payslips" },
    { label: "Profile", path: "/employee/profile" },
  ],
};

const icons = {
  Dashboard: "⌂",
  Employees: "♙",
  Projects: "◫",
  Attendance: "◷",
  Leave: "◌",
  Billing: "₹",
  Reports: "▥",
  Recruitment: "♧",
  Payroll: "▣",
  Invoices: "▤",
  Customers: "♙",
  Payments: "↗",
  Expenses: "◈",
  Tasks: "✓",
  Payslips: "▤",
  Profile: "●",
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();

  const role = user?.role?.toLowerCase();

  const items = menuItems[role] || [];

  const displayRole =
    user?.role?.charAt(0).toUpperCase() +
      user?.role?.slice(1).toLowerCase() || "Employee";

  const displayName =
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`atlas-sidebar ${
          mobileOpen ? "sidebar-open" : ""
        }`}
      >
        {/* BRAND */}

        <div className="sidebar-brand">
          <div className="atlas-logo">
            A
          </div>

          <div className="sidebar-brand-text">
            <h2>ATLAS</h2>

            <span>
              Business Management
            </span>
          </div>
        </div>

        {/* WORKSPACE */}

        <div className="sidebar-workspace">
          <span className="workspace-label">
            WORKSPACE
          </span>

          <div className="workspace-role">
            <span className="workspace-role-dot" />

            <span>
              {displayRole}
            </span>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
        >
          <div className="sidebar-nav-label">
            MENU
          </div>

          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}`}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "sidebar-link-active"
                    : ""
                }`
              }
            >
              <span className="sidebar-link-icon">
                {icons[item.label] || "•"}
              </span>

              <span className="sidebar-link-label">
                {item.label}
              </span>

              <span className="sidebar-link-arrow">
                ›
              </span>
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM */}

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {initials || "U"}
            </div>

            <div className="user-info">
              <strong title={displayName}>
                {displayName}
              </strong>

              <span title={user?.email}>
                {user?.email || "User"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            <span className="logout-icon">
              ↪
            </span>

            <span>
              Sign out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}