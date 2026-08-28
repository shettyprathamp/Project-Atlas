import { useMemo, useState } from "react";
import "./Requests.css";

const requestsData = [
  {
    id: 1,
    type: "Leave Request",
    title: "Casual Leave",
    description: "Requesting casual leave for a personal appointment.",
    submitted: "Aug 12, 2026",
    status: "Pending",
    category: "Leave",
  },
  {
    id: 2,
    type: "Document Request",
    title: "Salary Certificate",
    description: "Request for the latest salary certificate.",
    submitted: "Aug 8, 2026",
    status: "Approved",
    category: "Document",
  },
  {
    id: 3,
    type: "Attendance Correction",
    title: "Attendance Correction",
    description: "Request to correct missing check-out time.",
    submitted: "Aug 5, 2026",
    status: "Pending",
    category: "Attendance",
  },
  {
    id: 4,
    type: "General Request",
    title: "Employment Letter",
    description: "Request for an employment verification letter.",
    submitted: "Jul 28, 2026",
    status: "Approved",
    category: "General",
  },
  {
    id: 5,
    type: "Leave Request",
    title: "Sick Leave",
    description: "Requesting sick leave for one working day.",
    submitted: "Jul 21, 2026",
    status: "Rejected",
    category: "Leave",
  },
];

export default function Requests() {
  const [requests, setRequests] = useState(requestsData);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newRequest, setNewRequest] = useState({
    category: "General",
    title: "",
    description: "",
  });

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesFilter =
        filter === "All" || request.status === filter;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        request.title.toLowerCase().includes(searchValue) ||
        request.type.toLowerCase().includes(searchValue) ||
        request.description.toLowerCase().includes(searchValue);

      return matchesFilter && matchesSearch;
    });
  }, [requests, filter, search]);

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewRequest((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      return;
    }

    const request = {
      id: Date.now(),
      type: `${newRequest.category} Request`,
      title: newRequest.title,
      description: newRequest.description,
      submitted: "Today",
      status: "Pending",
      category: newRequest.category,
    };

    setRequests((current) => [request, ...current]);

    setNewRequest({
      category: "General",
      title: "",
      description: "",
    });

    setShowForm(false);
  };

  return (
    <div className="employee-requests-page">
      {/* HEADER */}
      <div className="employee-requests-header">
        <div>
          <span className="employee-requests-eyebrow">
            Employee Portal
          </span>

          <h1>Requests</h1>

          <p>
            Submit and keep track of your requests to the relevant
            departments.
          </p>
        </div>

        <button
          className="employee-request-primary-button"
          onClick={() => setShowForm(true)}
        >
          <span>+</span>
          New Request
        </button>
      </div>

      {/* SUMMARY */}
      <div className="employee-request-summary">
        <div className="employee-request-summary-card">
          <div className="employee-request-summary-icon">◉</div>

          <div>
            <span>Total Requests</span>
            <strong>{requests.length}</strong>
          </div>
        </div>

        <div className="employee-request-summary-card pending">
          <div className="employee-request-summary-icon">◷</div>

          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="employee-request-summary-card approved">
          <div className="employee-request-summary-icon">✓</div>

          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>

        <div className="employee-request-summary-card rejected">
          <div className="employee-request-summary-icon">×</div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      </div>

      {/* REQUEST CARD */}
      <div className="employee-requests-card">
        <div className="employee-requests-card-header">
          <div>
            <h2>My Requests</h2>
            <p>View the status of requests submitted by you.</p>
          </div>

          <span>
            {filteredRequests.length}{" "}
            {filteredRequests.length === 1
              ? "request"
              : "requests"}
          </span>
        </div>

        {/* CONTROLS */}
        <div className="employee-requests-controls">
          <div className="employee-requests-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* LIST */}
        {filteredRequests.length > 0 ? (
          <div className="employee-request-list">
            {filteredRequests.map((request) => (
              <div
                className="employee-request-item"
                key={request.id}
              >
                <div className="employee-request-icon">
                  {request.category === "Leave"
                    ? "◷"
                    : request.category === "Document"
                    ? "▤"
                    : request.category === "Attendance"
                    ? "◉"
                    : "□"}
                </div>

                <div className="employee-request-content">
                  <div className="employee-request-top">
                    <div>
                      <h3>{request.title}</h3>

                      <div className="employee-request-meta">
                        <span>{request.type}</span>
                        <span>•</span>
                        <span>{request.submitted}</span>
                      </div>
                    </div>

                    <span
                      className={`employee-request-status ${request.status.toLowerCase()}`}
                    >
                      <i></i>
                      {request.status}
                    </span>
                  </div>

                  <p>{request.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="employee-requests-empty">
            <div>⌕</div>
            <strong>No requests found</strong>
            <span>
              Try changing your search or status filter.
            </span>
          </div>
        )}
      </div>

      {/* NEW REQUEST MODAL */}
      {showForm && (
        <div
          className="employee-request-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="employee-request-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="employee-request-modal-header">
              <div>
                <span>Employee Portal</span>
                <h2>New Request</h2>
                <p>Submit a new request to the appropriate department.</p>
              </div>

              <button
                className="employee-request-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="employee-request-form">
                <div className="employee-request-field">
                  <label>Request Type</label>

                  <select
                    name="category"
                    value={newRequest.category}
                    onChange={handleInputChange}
                  >
                    <option value="General">General</option>
                    <option value="Leave">Leave</option>
                    <option value="Document">Document</option>
                    <option value="Attendance">
                      Attendance
                    </option>
                  </select>
                </div>

                <div className="employee-request-field">
                  <label>Title</label>

                  <input
                    type="text"
                    name="title"
                    placeholder="Enter request title"
                    value={newRequest.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="employee-request-field full">
                  <label>Description</label>

                  <textarea
                    name="description"
                    placeholder="Describe your request..."
                    value={newRequest.description}
                    onChange={handleInputChange}
                    rows="5"
                    required
                  />
                </div>
              </div>

              <div className="employee-request-modal-actions">
                <button
                  type="button"
                  className="employee-request-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-request-primary-button"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}