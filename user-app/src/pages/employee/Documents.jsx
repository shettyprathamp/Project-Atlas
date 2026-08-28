import "./Documents.css";

export default function Documents() {
  const documents = [
    {
      id: 1,
      name: "Employment Agreement",
      type: "PDF",
      category: "Employment",
      date: "12 January 2026",
      size: "1.2 MB",
    },
    {
      id: 2,
      name: "Salary Structure",
      type: "PDF",
      category: "Payroll",
      date: "15 January 2026",
      size: "845 KB",
    },
    {
      id: 3,
      name: "Company Policies",
      type: "PDF",
      category: "Policies",
      date: "20 January 2026",
      size: "2.4 MB",
    },
    {
      id: 4,
      name: "Employee Handbook",
      type: "PDF",
      category: "Policies",
      date: "22 January 2026",
      size: "3.1 MB",
    },
    {
      id: 5,
      name: "Offer Letter",
      type: "PDF",
      category: "Employment",
      date: "10 January 2026",
      size: "612 KB",
    },
  ];

  return (
    <div className="employee-documents-page">
      {/* Header */}
      <div className="documents-header">
        <div>
          <span className="documents-eyebrow">EMPLOYEE</span>
          <h1>Documents</h1>
          <p>
            Access your employment and company documents.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="documents-summary">
        <div className="document-summary-card">
          <div className="document-summary-icon">▣</div>

          <div>
            <span>Total Documents</span>
            <strong>{documents.length}</strong>
            <small>Available to you</small>
          </div>
        </div>

        <div className="document-summary-card">
          <div className="document-summary-icon pdf">PDF</div>

          <div>
            <span>PDF Documents</span>
            <strong>{documents.filter((doc) => doc.type === "PDF").length}</strong>
            <small>Ready to view</small>
          </div>
        </div>

        <div className="document-summary-card">
          <div className="document-summary-icon secure">✓</div>

          <div>
            <span>Secure Access</span>
            <strong>Active</strong>
            <small>Your documents are protected</small>
          </div>
        </div>
      </div>

      {/* Documents Card */}
      <div className="documents-card">
        <div className="documents-card-header">
          <div>
            <h2>My Documents</h2>
            <p>Documents shared with you by the company.</p>
          </div>

          <div className="documents-count">
            {documents.length} Documents
          </div>
        </div>

        <div className="documents-list">
          {documents.map((document) => (
            <div className="document-row" key={document.id}>
              {/* Icon */}
              <div className="document-file-icon">
                <span>{document.type}</span>
              </div>

              {/* Information */}
              <div className="document-info">
                <strong>{document.name}</strong>

                <div className="document-meta">
                  <span>{document.category}</span>
                  <span>•</span>
                  <span>{document.size}</span>
                  <span>•</span>
                  <span>{document.date}</span>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                className="document-view-button"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}