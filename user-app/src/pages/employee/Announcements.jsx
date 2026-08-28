import { useMemo, useState } from "react";
import "./Announcements.css";

const announcementsData = [
  {
    id: 1,
    title: "Independence Day Holiday",
    message:
      "The office will remain closed on 15 August in observance of Independence Day. Regular operations will resume on the next working day.",
    category: "Holiday",
    priority: "Important",
    author: "Atlas Management",
    date: "Aug 10, 2026",
    unread: true,
  },
  {
    id: 2,
    title: "Monthly Payroll Processing",
    message:
      "This month's payroll will be processed on the scheduled payroll date. Employees are requested to ensure their bank and personal details are up to date.",
    category: "Payroll",
    priority: "Normal",
    author: "Finance Department",
    date: "Aug 8, 2026",
    unread: true,
  },
  {
    id: 3,
    title: "Attendance Reminder",
    message:
      "All employees are requested to mark their attendance regularly and ensure that check-in and check-out timings are recorded correctly.",
    category: "HR",
    priority: "Normal",
    author: "HR Department",
    date: "Aug 5, 2026",
    unread: false,
  },
  {
    id: 4,
    title: "Updated Workplace Guidelines",
    message:
      "Please review the updated workplace guidelines available in the Documents section. These guidelines apply to all Atlas employees.",
    category: "General",
    priority: "Normal",
    author: "Atlas Management",
    date: "Aug 2, 2026",
    unread: false,
  },
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState(announcementsData);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(search.toLowerCase()) ||
        announcement.message.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || announcement.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [announcements, search, category]);

  const unreadCount = announcements.filter(
    (announcement) => announcement.unread
  ).length;

  const openAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);

    setAnnouncements((current) =>
      current.map((item) =>
        item.id === announcement.id
          ? { ...item, unread: false }
          : item
      )
    );
  };

  const markAllAsRead = () => {
    setAnnouncements((current) =>
      current.map((announcement) => ({
        ...announcement,
        unread: false,
      }))
    );
  };

  return (
    <div className="employee-announcements-page">
      {/* HEADER */}
      <div className="employee-announcements-header">
        <div>
          <span className="employee-announcements-eyebrow">
            Employee Portal
          </span>

          <h1>Announcements</h1>

          <p>
            Stay updated with the latest news, notices and important
            information from Atlas.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="employee-announcements-read-all"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* SUMMARY */}
      <div className="employee-announcements-summary">
        <div className="announcement-summary-card">
          <div className="announcement-summary-icon">◉</div>

          <div>
            <span>Total Announcements</span>
            <strong>{announcements.length}</strong>
          </div>
        </div>

        <div className="announcement-summary-card unread">
          <div className="announcement-summary-icon">●</div>

          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="announcement-summary-card">
          <div className="announcement-summary-icon">✓</div>

          <div>
            <span>Read</span>
            <strong>{announcements.length - unreadCount}</strong>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="employee-announcements-controls">
        <div className="employee-announcements-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="HR">HR</option>
          <option value="Payroll">Payroll</option>
          <option value="Holiday">Holiday</option>
        </select>
      </div>

      {/* ANNOUNCEMENT LIST */}
      <div className="employee-announcements-card">
        <div className="employee-announcements-card-header">
          <div>
            <h2>Latest Announcements</h2>
            <p>Important updates from across Atlas.</p>
          </div>

          <span>
            {filteredAnnouncements.length}{" "}
            {filteredAnnouncements.length === 1
              ? "announcement"
              : "announcements"}
          </span>
        </div>

        {filteredAnnouncements.length > 0 ? (
          <div className="employee-announcement-list">
            {filteredAnnouncements.map((announcement) => (
              <button
                key={announcement.id}
                className={`employee-announcement-item ${
                  announcement.unread ? "unread" : ""
                }`}
                onClick={() => openAnnouncement(announcement)}
              >
                <div className="announcement-item-icon">
                  {announcement.category === "Holiday"
                    ? "◆"
                    : announcement.category === "Payroll"
                    ? "₹"
                    : announcement.category === "HR"
                    ? "♙"
                    : "●"}
                </div>

                <div className="announcement-item-content">
                  <div className="announcement-item-top">
                    <div>
                      <h3>{announcement.title}</h3>

                      <div className="announcement-item-meta">
                        <span>{announcement.category}</span>
                        <span>•</span>
                        <span>{announcement.author}</span>
                      </div>
                    </div>

                    <time>{announcement.date}</time>
                  </div>

                  <p>{announcement.message}</p>

                  <div className="announcement-item-bottom">
                    <span
                      className={`announcement-priority ${announcement.priority.toLowerCase()}`}
                    >
                      {announcement.priority}
                    </span>

                    {announcement.unread && (
                      <span className="announcement-unread">
                        <i></i>
                        Unread
                      </span>
                    )}
                  </div>
                </div>

                <span className="announcement-arrow">›</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="employee-announcements-empty">
            <div className="announcement-empty-icon">⌕</div>
            <strong>No announcements found</strong>
            <span>
              Try changing your search or selecting a different category.
            </span>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedAnnouncement && (
        <div
          className="announcement-modal-overlay"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="announcement-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="announcement-modal-header">
              <div>
                <span className="announcement-modal-category">
                  {selectedAnnouncement.category}
                </span>

                <h2>{selectedAnnouncement.title}</h2>
              </div>

              <button
                className="announcement-modal-close"
                onClick={() => setSelectedAnnouncement(null)}
              >
                ×
              </button>
            </div>

            <div className="announcement-modal-meta">
              <span>{selectedAnnouncement.author}</span>
              <span>•</span>
              <span>{selectedAnnouncement.date}</span>
            </div>

            <div className="announcement-modal-message">
              <p>{selectedAnnouncement.message}</p>
            </div>

            <div className="announcement-modal-footer">
              <span
                className={`announcement-priority ${selectedAnnouncement.priority.toLowerCase()}`}
              >
                {selectedAnnouncement.priority}
              </span>

              <button
                className="announcement-modal-button"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}