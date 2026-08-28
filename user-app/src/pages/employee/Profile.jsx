import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
  });

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/employee/profile"
      );

      const data =
        response.data || null;

      setEmployee(data);

      setForm({
        name: data?.name || "",
        email: data?.email || "",
        department:
          data?.department || "",
      });
    } catch (err) {
      console.error(
        "Failed to load profile:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================================================
  // OPEN EDIT
  // =========================================================

  function handleEdit() {
    setForm({
      name: employee?.name || "",
      email: employee?.email || "",
      department:
        employee?.department || "",
    });

    setError("");
    setSuccess("");
    setEditing(true);
  }

  // =========================================================
  // CANCEL
  // =========================================================

  function handleCancel() {
    setForm({
      name: employee?.name || "",
      email: employee?.email || "",
      department:
        employee?.department || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  }

  // =========================================================
  // SAVE
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        "/employee/profile",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          department:
            form.department.trim() ||
            null,
        }
      );

      setEmployee(response.data);

      setForm({
        name:
          response.data?.name || "",
        email:
          response.data?.email || "",
        department:
          response.data?.department ||
          "",
      });

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="employee-profile-page">
        <div className="employee-profile-card">

          <div className="employee-profile-section-header">
            <div>
              <h2>
                Loading your profile...
              </h2>

              <p>
                Fetching your employee information.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // EMPLOYEE DATA
  // =========================================================

  const employeeName =
    employee?.name ||
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Employee";

  const employeeId =
    employee?.id ??
    employee?.employee_id ??
    "—";

  const email =
    employee?.email ||
    user?.email ||
    "—";

  const department =
    employee?.department ||
    "Not assigned";

  const role =
    employee?.role ||
    user?.role ||
    "Employee";

  const status =
    employee?.status ||
    "Active";

  const initials =
    employeeName
      .split(" ")
      .filter(Boolean)
      .map(
        (name) => name[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() || "E";

  return (
    <div className="employee-profile-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="employee-profile-header">

        <div>

          <span className="employee-profile-eyebrow">
            MY ACCOUNT
          </span>

          <h1>
            My Profile
          </h1>

          <p>
            View and manage your personal
            and employment information.
          </p>

        </div>

        {!editing ? (
          <button
            type="button"
            className="employee-profile-edit-button"
            onClick={handleEdit}
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            className="employee-profile-edit-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}

      </div>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div
          style={{
            marginBottom: "20px",
            padding: "13px 16px",
            borderRadius: "10px",
            border:
              "1px solid rgba(34,197,94,0.2)",
            background:
              "rgba(34,197,94,0.07)",
            color: "#86efac",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          ✓ {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "13px 16px",
            borderRadius: "10px",
            border:
              "1px solid rgba(239,68,68,0.2)",
            background:
              "rgba(239,68,68,0.07)",
            color: "#fca5a5",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="employee-profile-card employee-profile-hero">

        <div className="employee-profile-avatar">
          {initials}
        </div>

        <div className="employee-profile-identity">

          <h2>
            {employeeName}
          </h2>

          <p>
            {role}
          </p>

          <span>
            {employeeId} · {department}
          </span>

        </div>

        <div className="employee-profile-status">

          <span className="employee-profile-status-dot" />

          {status}

        </div>

      </section>

      {/* =====================================================
          EDIT FORM
      ===================================================== */}

      {editing ? (
        <section className="employee-profile-card">

          <div className="employee-profile-section-header">

            <div>

              <h2>
                Edit Profile
              </h2>

              <p>
                Update your account information.
              </p>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
          >

            <div className="employee-profile-grid">

              <div className="employee-profile-field">

                <label className="profile-edit-label">
                  Full Name
                </label>

                <input
                  className="profile-edit-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="employee-profile-field">

                <label className="profile-edit-label">
                  Email Address
                </label>

                <input
                  className="profile-edit-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="employee-profile-field">

                <label className="profile-edit-label">
                  Department
                </label>

                <input
                  className="profile-edit-input"
                  type="text"
                  name="department"
                  value={
                    form.department
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Department"
                />

              </div>

            </div>

            <div className="profile-edit-actions">

              <button
                type="button"
                className="employee-profile-cancel-button"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="employee-profile-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </section>
      ) : (
        <>
          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="employee-profile-card">

            <div className="employee-profile-section-header">

              <div>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Your basic contact information.
                </p>

              </div>

            </div>

            <div className="employee-profile-grid">

              <ProfileField
                label="Full Name"
                value={employeeName}
              />

              <ProfileField
                label="Email Address"
                value={email}
              />

              <ProfileField
                label="Department"
                value={department}
              />

              <ProfileField
                label="Employee ID"
                value={employeeId}
              />

            </div>

          </section>

          {/* =================================================
              EMPLOYMENT INFORMATION
          ================================================= */}

          <section className="employee-profile-card">

            <div className="employee-profile-section-header">

              <div>

                <h2>
                  Employment Information
                </h2>

                <p>
                  Your role and company information.
                </p>

              </div>

            </div>

            <div className="employee-profile-grid">

              <ProfileField
                label="Employee ID"
                value={employeeId}
              />

              <ProfileField
                label="Department"
                value={department}
              />

              <ProfileField
                label="Role"
                value={role}
              />

              <ProfileField
                label="Employment Status"
                value={status}
              />

            </div>

          </section>

          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <section className="employee-profile-card">

            <div className="employee-profile-section-header">

              <div>

                <h2>
                  Account Information
                </h2>

                <p>
                  Information related to your Atlas account.
                </p>

              </div>

            </div>

            <div className="employee-profile-account-row">

              <div>

                <span>
                  Account Status
                </span>

                <strong className="employee-profile-account-active">
                  {status}
                </strong>

              </div>

              <div>

                <span>
                  Employee ID
                </span>

                <strong>
                  {employeeId}
                </strong>

              </div>

              <div>

                <span>
                  Access Level
                </span>

                <strong>
                  {role}
                </strong>

              </div>

            </div>

          </section>
        </>
      )}

    </div>
  );
}


// =========================================================
// PROFILE FIELD
// =========================================================

function ProfileField({
  label,
  value,
}) {
  return (
    <div className="employee-profile-field">

      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
}