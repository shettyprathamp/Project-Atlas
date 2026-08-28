import "./Recruitment.css";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const statuses = [
  "Applied",
  "Screening",
  "Interview",
  "Selected",
  "Rejected",
];

const initialForm = {
  candidate_name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  experience: "",
  resume: "",
  status: "Applied",
  notes: "",
};

export default function Recruitment() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(initialForm);

  async function loadCandidates() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruitment/");

      setCandidates(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load recruitment data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      const response = await api.post(
        "/recruitment/",
        form
      );

      setCandidates((previous) => [
        response.data,
        ...previous,
      ]);

      setForm({
        ...initialForm,
      });

      setShowForm(false);

      setSelectedCandidate(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to add candidate."
      );
    }
  }

  async function updateStatus(id, status) {
    try {
      setError("");

      const response = await api.put(
        `/recruitment/${id}`,
        {
          status,
        }
      );

      setCandidates((previous) =>
        previous.map((candidate) =>
          candidate.id === id
            ? response.data
            : candidate
        )
      );

      setSelectedCandidate(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to update candidate."
      );
    }
  }

  async function deleteCandidate(id) {
    const confirmed = window.confirm(
      "Delete this candidate?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/recruitment/${id}`
      );

      setCandidates((previous) =>
        previous.filter(
          (candidate) => candidate.id !== id
        )
      );

      setSelectedCandidate(null);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete candidate."
      );
    }
  }

  const counts = useMemo(() => {
    return {
      Applied: candidates.filter(
        (candidate) =>
          candidate.status === "Applied"
      ).length,

      Screening: candidates.filter(
        (candidate) =>
          candidate.status === "Screening"
      ).length,

      Interview: candidates.filter(
        (candidate) =>
          candidate.status === "Interview"
      ).length,

      Selected: candidates.filter(
        (candidate) =>
          candidate.status === "Selected"
      ).length,

      Rejected: candidates.filter(
        (candidate) =>
          candidate.status === "Rejected"
      ).length,
    };
  }, [candidates]);

  function getStatusClass(status) {
    return `candidate-status status-${String(
      status || "Applied"
    )
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  }

  return (
    <div className="recruitment-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="recruitment-header">

        <div className="recruitment-title-area">

          <span className="recruitment-eyebrow">
            TALENT & ACQUISITION
          </span>

          <h1>
            Recruitment
          </h1>

          <p>
            Manage candidates, track applications,
            and move the right people through your
            hiring pipeline.
          </p>

        </div>

        <button
          type="button"
          className="recruitment-add-button"
          onClick={() =>
            setShowForm((previous) => !previous)
          }
        >
          {showForm
            ? "Close Form"
            : "+ Add Candidate"}
        </button>

      </header>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="error-message">
          <strong>Something went wrong</strong>
          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          RECRUITMENT PIPELINE
      ===================================================== */}

      <section className="recruitment-pipeline">

        <div className="pipeline-intro">

          <span>
            HIRING PIPELINE
          </span>

          <h2>
            Candidate Flow
          </h2>

          <p>
            Track every applicant from application
            to final decision.
          </p>

        </div>

        <div className="pipeline-stages">

          {statuses.map((status, index) => (
            <div
              key={status}
              className={`pipeline-stage stage-${status.toLowerCase()}`}
            >

              <div className="pipeline-stage-top">

                <span className="pipeline-number">
                  0{index + 1}
                </span>

                <span className="pipeline-stage-name">
                  {status}
                </span>

              </div>

              <strong>
                {counts[status]}
              </strong>

              <div className="pipeline-line" />

            </div>
          ))}

        </div>

      </section>

      {/* =====================================================
          ADD CANDIDATE FORM
      ===================================================== */}

      {showForm && (
        <section className="recruitment-form">

          <div className="recruitment-form-header">

            <div>

              <span>
                NEW APPLICATION
              </span>

              <h2>
                Add Candidate
              </h2>

              <p>
                Enter the applicant's information
                to create a new recruitment record.
              </p>

            </div>

            <div className="form-step-indicator">
              <span>STEP</span>
              <strong>01</strong>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="recruitment-form-section">

              <div className="form-section-title">
                Candidate Information
              </div>

              <div className="recruitment-form-grid">

                <div className="form-group">

                  <label>
                    Candidate Name
                  </label>

                  <input
                    type="text"
                    name="candidate_name"
                    value={form.candidate_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="candidate@email.com"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Position
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    required
                    placeholder="Frontend Developer"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Technology"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Experience
                  </label>

                  <input
                    type="text"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="2 years"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Resume
                  </label>

                  <input
                    type="text"
                    name="resume"
                    value={form.resume}
                    onChange={handleChange}
                    placeholder="Resume URL"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Initial Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

            </div>

            <div className="recruitment-form-section">

              <div className="form-section-title">
                Internal Notes
              </div>

              <div className="form-group">

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Interview notes, skills, comments..."
                  rows="5"
                />

              </div>

            </div>

            <div className="recruitment-form-actions">

              <button
                type="button"
                className="recruitment-cancel-button"
                onClick={() => {
                  setShowForm(false);
                  setForm({
                    ...initialForm,
                  });
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="recruitment-save-button"
              >
                Add Candidate
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =====================================================
          MAIN WORKSPACE
      ===================================================== */}

      <div className="recruitment-workspace">

        {/* =================================================
            CANDIDATE LIST
        ================================================= */}

        <section className="candidate-board">

          <div className="candidate-board-header">

            <div>

              <span>
                CANDIDATE PIPELINE
              </span>

              <h2>
                Current Applicants
              </h2>

              <p>
                Select an applicant to inspect
                their profile and progress.
              </p>

            </div>

            <div className="candidate-total">

              <strong>
                {candidates.length}
              </strong>

              <span>
                candidates
              </span>

            </div>

          </div>

          {loading ? (
            <div className="recruitment-empty">

              <div className="loading-ring" />

              <h3>
                Loading candidates
              </h3>

              <p>
                Fetching the recruitment pipeline...
              </p>

            </div>
          ) : candidates.length === 0 ? (
            <div className="recruitment-empty">

              <div className="candidate-empty-icon">
                +
              </div>

              <h3>
                No candidates yet
              </h3>

              <p>
                Add your first candidate to
                start building the recruitment
                pipeline.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
              >
                Add First Candidate
              </button>

            </div>
          ) : (
            <div className="candidate-list">

              {candidates.map((candidate) => (

                <button
                  type="button"
                  key={candidate.id}
                  className={`candidate-card ${
                    selectedCandidate?.id ===
                    candidate.id
                      ? "candidate-selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedCandidate(
                      candidate
                    )
                  }
                >

                  <div className="candidate-avatar">

                    {candidate.candidate_name
                      ?.charAt(0)
                      .toUpperCase() || "?"}

                  </div>

                  <div className="candidate-main">

                    <strong>
                      {candidate.candidate_name ||
                        "Unnamed Candidate"}
                    </strong>

                    <span>
                      {candidate.position ||
                        "Position not specified"}
                    </span>

                    <small>
                      {candidate.department ||
                        "Department not specified"}
                    </small>

                  </div>

                  <div
                    className={getStatusClass(
                      candidate.status
                    )}
                  >
                    {candidate.status ||
                      "Applied"}
                  </div>

                  <span className="candidate-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>
          )}

        </section>

        {/* =================================================
            CANDIDATE DETAILS
        ================================================= */}

        <aside className="candidate-details">

          {!selectedCandidate ? (
            <div className="candidate-details-empty">

              <div className="candidate-details-symbol">
                <span>+</span>
              </div>

              <span className="details-eyebrow">
                CANDIDATE PROFILE
              </span>

              <h3>
                Select a candidate
              </h3>

              <p>
                Choose an applicant from the
                pipeline to view their complete
                recruitment profile.
              </p>

            </div>
          ) : (
            <>

              {/* PROFILE HEADER */}

              <div className="candidate-profile">

                <div className="candidate-large-avatar">

                  {selectedCandidate
                    .candidate_name
                    ?.charAt(0)
                    .toUpperCase() || "?"}

                </div>

                <div className="candidate-profile-info">

                  <span>
                    CANDIDATE
                  </span>

                  <h2>
                    {selectedCandidate.candidate_name}
                  </h2>

                  <p>
                    {selectedCandidate.position ||
                      "Position not specified"}
                  </p>

                </div>

              </div>

              {/* STATUS */}

              <div className="candidate-current-status">

                <span>
                  CURRENT STATUS
                </span>

                <strong
                  className={getStatusClass(
                    selectedCandidate.status
                  )}
                >
                  {selectedCandidate.status ||
                    "Applied"}
                </strong>

              </div>

              {/* INFORMATION */}

              <div className="candidate-info">

                <div className="candidate-info-item">

                  <span>
                    EMAIL
                  </span>

                  <strong>
                    {selectedCandidate.email ||
                      "—"}
                  </strong>

                </div>

                <div className="candidate-info-item">

                  <span>
                    PHONE
                  </span>

                  <strong>
                    {selectedCandidate.phone ||
                      "—"}
                  </strong>

                </div>

                <div className="candidate-info-item">

                  <span>
                    DEPARTMENT
                  </span>

                  <strong>
                    {selectedCandidate.department ||
                      "—"}
                  </strong>

                </div>

                <div className="candidate-info-item">

                  <span>
                    EXPERIENCE
                  </span>

                  <strong>
                    {selectedCandidate.experience ||
                      "—"}
                  </strong>

                </div>

              </div>

              {/* PROGRESS */}

              <div className="candidate-progress">

                <div className="candidate-progress-header">

                  <span>
                    APPLICATION STATUS
                  </span>

                  <small>
                    Update stage
                  </small>

                </div>

                <div className="candidate-status-select">

                  {statuses.map((status) => (

                    <button
                      type="button"
                      key={status}
                      className={
                        selectedCandidate.status ===
                        status
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        updateStatus(
                          selectedCandidate.id,
                          status
                        )
                      }
                    >
                      {status}
                    </button>

                  ))}

                </div>

              </div>

              {/* NOTES */}

              {selectedCandidate.notes && (
                <div className="candidate-notes">

                  <span>
                    NOTES
                  </span>

                  <p>
                    {selectedCandidate.notes}
                  </p>

                </div>
              )}

              {/* RESUME */}

              {selectedCandidate.resume && (
                <div className="candidate-resume">

                  <span>
                    RESUME
                  </span>

                  <p>
                    {selectedCandidate.resume}
                  </p>

                </div>
              )}

              {/* DELETE */}

              <button
                type="button"
                className="candidate-delete"
                onClick={() =>
                  deleteCandidate(
                    selectedCandidate.id
                  )
                }
              >
                Delete Candidate
              </button>

            </>
          )}

        </aside>

      </div>

    </div>
  );
}