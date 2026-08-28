import { useAuth } from "../../context/AuthContext";
import "./Header.css";

export default function Header({ onMenuClick }) {
  const { user } = useAuth();

  const role = user?.role
    ? user.role.charAt(0).toUpperCase() +
      user.role.slice(1).toLowerCase()
    : "Employee";

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
    <header className="atlas-header">
      {/* LEFT */}

      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="header-heading">
          <span className="header-eyebrow">
            ATLAS WORKSPACE
          </span>

          <h1>
            Welcome back
            {displayName !== "User"
              ? `, ${displayName}`
              : ""}
          </h1>

          <p>
            Your business management workspace
          </p>
        </div>
      </div>

      {/* RIGHT */}

      <div className="header-right">
        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <span className="notification-icon">
            ♢
          </span>

          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <div className="header-user">
          <div className="header-avatar">
            {initials || "U"}
          </div>

          <div className="header-user-info">
            <strong title={displayName}>
              {displayName}
            </strong>

            <span>
              {role}
            </span>
          </div>

          <span className="header-user-arrow">
            ▾
          </span>
        </div>
      </div>
    </header>
  );
}