import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employee/profile");

      const data = response.data || {};

      setProfile(data);

      setForm({
        name: data.name || user?.name || "",
        email: data.email || user?.email || "",
        department: data.department || "",
      });
    } catch (err) {
      console.error("Failed to load manager profile:", err);

      if (err.response?.status === 401) {
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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function startEditing() {
    setForm({
      name:
        profile?.name ||
        user?.name ||
        user?.full_name ||
        "",
      email:
        profile?.email ||
        user?.email ||
        "",
      department:
        profile?.department ||
        "",
    });

    setError("");
    setSuccess("");
    setEditing(true);
  }

  function cancelEditing() {
    setForm({
      name:
        profile?.name ||
        user?.name ||
        user?.full_name ||
        "",
      email:
        profile?.email ||
        user?.email ||
        "",
      department:
        profile?.department ||
        "",
    });

    setEditing(false);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

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
            form.department.trim() || null,
        }
      );

      const updated = response.data || {};

      setProfile(updated);

      setForm({
        name: updated.name || "",
        email: updated.email || "",
        department:
          updated.department || "",
      });

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update failed:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="manager-profile-page">
        <div className="manager-profile-loading">
          <div className="manager-profile-spinner" />

          <h2>Loading your profile</h2>

          <p>
            Fetching your manager information...
          </p>
        </div>
      </div>
    );
  }

  const managerName =
    profile?.name ||
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Manager";

  const managerEmail =
    profile?.email ||
    user?.email ||
    "—";

  const managerDepartment =
    profile?.department ||
    "Not assigned";

  const managerId =
    profile?.id ??
    profile?.employee_id ??
    "—";

  const managerRole =
    profile?.role ||
    user?.role ||
    "Manager";

  const managerStatus =
    profile?.status ||
    "Active";

  const initials =
    managerName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M";

  return (
    <div className="manager-profile-page">

      {/* HEADER */}

      <div className="manager-profile-header">

        <div>
          <span className="manager-profile-eyebrow">
            MY ACCOUNT
          </span>

          <h1>
            My Profile
          </h1>

          <p>
            View and manage your personal and
            employment information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className="manager-profile-primary-button"
            onClick={startEditing}
          >
            Edit Profile
          </button>
        )}

        {editing && (
          <button
            type="button"
            className="manager-profile-secondary-button"
            onClick={cancelEditing}
            disabled={saving}
          >
            Cancel
          </button>
        )}

      </div>

      {/* SUCCESS */}

      {success && (
        <div className="manager-profile-alert manager-profile-success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="manager-profile-alert manager-profile-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* PROFILE HERO */}

      <section className="manager-profile-card manager-profile-hero">

        <div className="manager-profile-avatar">
          {initials}
        </div>

        <div className="manager-profile-identity">

          <h2>
            {managerName}
          </h2>

          <p>
            {managerRole}
          </p>

          <span>
            Employee ID: {managerId}
          </span>

        </div>

        <div className="manager-profile-status">
          <span />
          {managerStatus}
        </div>

      </section>

      {/* EDIT */}

      {editing ? (
        <section className="manager-profile-card">

          <div className="manager-profile-section-header">

            <div>
              <h2>
                Edit Profile
              </h2>

              <p>
                Update the information associated
                with your Atlas account.
              </p>
            </div>

          </div>

          <form
            className="manager-profile-form"
            onSubmit={handleSubmit}
          >

            <div className="manager-profile-grid">

              <div className="manager-profile-field">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="manager-profile-field">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="manager-profile-field">
                <label>
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Department"
                />
              </div>

              <div className="manager-profile-field">
                <label>
                  Role
                </label>

                <input
                  type="text"
                  value={managerRole}
                  disabled
                />
              </div>

            </div>

            <div className="manager-profile-form-actions">

              <button
                type="button"
                className="manager-profile-secondary-button"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="manager-profile-primary-button"
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
          {/* PERSONAL INFORMATION */}

          <section className="manager-profile-card">

            <div className="manager-profile-section-header">

              <div>
                <h2>
                  Personal Information
                </h2>

                <p>
                  Your basic contact information.
                </p>
              </div>

            </div>

            <div className="manager-profile-grid">

              <ProfileField
                label="Full Name"
                value={managerName}
              />

              <ProfileField
                label="Email Address"
                value={managerEmail}
              />

              <ProfileField
                label="Department"
                value={managerDepartment}
              />

              <ProfileField
                label="Employee ID"
                value={managerId}
              />

            </div>

          </section>

          {/* EMPLOYMENT */}

          <section className="manager-profile-card">

            <div className="manager-profile-section-header">

              <div>
                <h2>
                  Employment Information
                </h2>

                <p>
                  Your role and employment details.
                </p>
              </div>

            </div>

            <div className="manager-profile-grid">

              <ProfileField
                label="Employee ID"
                value={managerId}
              />

              <ProfileField
                label="Department"
                value={managerDepartment}
              />

              <ProfileField
                label="Role"
                value={managerRole}
              />

              <ProfileField
                label="Employment Status"
                value={managerStatus}
              />

            </div>

          </section>

          {/* ACCOUNT */}

          <section className="manager-profile-card">

            <div className="manager-profile-section-header">

              <div>
                <h2>
                  Account Information
                </h2>

                <p>
                  Information associated with your
                  Project Atlas account.
                </p>
              </div>

            </div>

            <div className="manager-profile-account-grid">

              <div>
                <span>
                  Account Status
                </span>

                <strong className="manager-profile-active">
                  {managerStatus}
                </strong>
              </div>

              <div>
                <span>
                  Access Level
                </span>

                <strong>
                  {managerRole}
                </strong>
              </div>

              <div>
                <span>
                  Employee ID
                </span>

                <strong>
                  {managerId}
                </strong>
              </div>

            </div>

          </section>
        </>
      )}

    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="manager-profile-field manager-profile-readonly-field">

      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
}