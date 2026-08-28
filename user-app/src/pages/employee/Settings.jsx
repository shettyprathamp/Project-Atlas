import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "./Settings.css";

const DEFAULT_PREFERENCES = {
  compactMode: false,
  emailNotifications: true,
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [preferences, setPreferences] = useState(
    DEFAULT_PREFERENCES
  );

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPreferences();
    loadProfile();
  }, []);

  function loadPreferences() {
    try {
      const stored =
        localStorage.getItem(
          "atlas_preferences"
        );

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...parsed,
      });
    } catch (error) {
      console.error(
        "Unable to load preferences:",
        error
      );
    }
  }

  async function loadProfile() {
    try {
      setProfileLoading(true);

      const response = await api.get(
        "/employee/profile"
      );

      setProfile(
        response.data || null
      );
    } catch (error) {
      console.error(
        "Unable to load profile:",
        error
      );
    } finally {
      setProfileLoading(false);
    }
  }

  function updatePreference(
    key,
    value
  ) {
    const updated = {
      ...preferences,
      [key]: value,
    };

    setPreferences(updated);

    localStorage.setItem(
      "atlas_preferences",
      JSON.stringify(updated)
    );

    setMessage("Preferences saved.");

    window.setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  function handleLogout() {
    logout();
    navigate("/login", {
      replace: true,
    });
  }

  const employeeName =
    profile?.name ||
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Employee";

  const employeeEmail =
    profile?.email ||
    user?.email ||
    "—";

  const employeeId =
    profile?.id ??
    user?.employee_id ??
    "—";

  const department =
    profile?.department ||
    "Not assigned";

  const role =
    profile?.role ||
    user?.role ||
    "Employee";

  const companyId =
    profile?.company_id ??
    user?.company_id ??
    "—";

  const initials =
    employeeName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "E";

  return (
    <div className="employee-settings-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="employee-settings-header">

        <div>
          <span className="employee-settings-eyebrow">
            ACCOUNT
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your employee account,
            preferences and session settings.
          </p>
        </div>

      </header>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div className="employee-settings-message">
          <span>✓</span>
          {message}
        </div>
      )}

      {/* =====================================================
          ACCOUNT
      ===================================================== */}

      <section className="employee-settings-card">

        <div className="employee-settings-section-header">
          <div>
            <span>
              ACCOUNT
            </span>

            <h2>
              Account Information
            </h2>

            <p>
              Information associated with your
              Atlas employee account.
            </p>
          </div>
        </div>

        <div className="employee-settings-profile">

          <div className="employee-settings-avatar">
            {initials}
          </div>

          <div className="employee-settings-profile-main">

            <strong>
              {employeeName}
            </strong>

            <span>
              {employeeEmail}
            </span>

          </div>

          <span className="employee-settings-role">
            {role}
          </span>

        </div>

        <div className="employee-settings-grid">

          <div className="employee-settings-field">
            <span>
              FULL NAME
            </span>

            <strong>
              {profileLoading
                ? "Loading..."
                : employeeName}
            </strong>
          </div>

          <div className="employee-settings-field">
            <span>
              EMAIL
            </span>

            <strong>
              {profileLoading
                ? "Loading..."
                : employeeEmail}
            </strong>
          </div>

          <div className="employee-settings-field">
            <span>
              EMPLOYEE ID
            </span>

            <strong>
              {profileLoading
                ? "Loading..."
                : employeeId}
            </strong>
          </div>

          <div className="employee-settings-field">
            <span>
              DEPARTMENT
            </span>

            <strong>
              {profileLoading
                ? "Loading..."
                : department}
            </strong>
          </div>

          <div className="employee-settings-field">
            <span>
              ROLE
            </span>

            <strong>
              {profileLoading
                ? "Loading..."
                : role}
            </strong>
          </div>

          <div className="employee-settings-field">
            <span>
              COMPANY ID
            </span>

            <strong>
              {profileLoading
                ? "Loading..."
                : companyId}
            </strong>
          </div>

        </div>

      </section>

      {/* =====================================================
          PREFERENCES
      ===================================================== */}

      <section className="employee-settings-card">

        <div className="employee-settings-section-header">
          <div>
            <span>
              PREFERENCES
            </span>

            <h2>
              Workspace Preferences
            </h2>

            <p>
              Customize how your employee
              workspace behaves.
            </p>
          </div>
        </div>

        <div className="employee-settings-options">

          <div className="employee-settings-option">

            <div>
              <strong>
                Compact Mode
              </strong>

              <p>
                Reduce spacing inside dashboard
                cards and workspace sections.
              </p>
            </div>

            <button
              type="button"
              className={`employee-settings-toggle ${
                preferences.compactMode
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                updatePreference(
                  "compactMode",
                  !preferences.compactMode
                )
              }
              aria-label="Toggle compact mode"
            >
              <span />
            </button>

          </div>

          <div className="employee-settings-option">

            <div>
              <strong>
                Email Notifications
              </strong>

              <p>
                Enable notification preferences
                for your employee workspace.
              </p>
            </div>

            <button
              type="button"
              className={`employee-settings-toggle ${
                preferences.emailNotifications
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                updatePreference(
                  "emailNotifications",
                  !preferences.emailNotifications
                )
              }
              aria-label="Toggle email notifications"
            >
              <span />
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          SESSION
      ===================================================== */}

      <section className="employee-settings-card">

        <div className="employee-settings-section-header">
          <div>
            <span>
              SECURITY
            </span>

            <h2>
              Current Session
            </h2>

            <p>
              Manage the active Atlas session
              on this device.
            </p>
          </div>
        </div>

        <div className="employee-settings-session">

          <div className="employee-settings-session-status">
            <span className="employee-settings-session-dot" />

            <div>
              <strong>
                Active session
              </strong>

              <p>
                You are currently signed in
                to the Atlas employee portal.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="employee-settings-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </section>

      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        type="button"
        className="employee-settings-back"
        onClick={() =>
          navigate("/employee")
        }
      >
        ← Back to Dashboard
      </button>

    </div>
  );
}