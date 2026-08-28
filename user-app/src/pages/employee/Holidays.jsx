import "./Holidays.css";

export default function Holidays() {
  const holidays = [
    {
      id: 1,
      date: "15 August 2026",
      day: "Saturday",
      name: "Independence Day",
      type: "National Holiday",
    },
    {
      id: 2,
      date: "27 August 2026",
      day: "Thursday",
      name: "Ganesh Chaturthi",
      type: "Public Holiday",
    },
    {
      id: 3,
      date: "2 October 2026",
      day: "Friday",
      name: "Gandhi Jayanti",
      type: "National Holiday",
    },
    {
      id: 4,
      date: "20 October 2026",
      day: "Tuesday",
      name: "Dussehra",
      type: "Public Holiday",
    },
    {
      id: 5,
      date: "8 November 2026",
      day: "Sunday",
      name: "Diwali",
      type: "Public Holiday",
    },
    {
      id: 6,
      date: "25 December 2026",
      day: "Friday",
      name: "Christmas Day",
      type: "Public Holiday",
    },
  ];

  return (
    <div className="employee-holidays-page">
      {/* Header */}
      <div className="holidays-header">
        <div>
          <span className="holidays-eyebrow">EMPLOYEE</span>
          <h1>Holidays</h1>
          <p>
            View company holidays and upcoming days off.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="holidays-summary">
        <div className="holiday-summary-card">
          <div className="holiday-summary-icon">📅</div>

          <div>
            <span>Total Holidays</span>
            <strong>{holidays.length}</strong>
            <small>2026 calendar</small>
          </div>
        </div>

        <div className="holiday-summary-card">
          <div className="holiday-summary-icon upcoming">⌛</div>

          <div>
            <span>Upcoming</span>
            <strong>5</strong>
            <small>Remaining holidays</small>
          </div>
        </div>

        <div className="holiday-summary-card">
          <div className="holiday-summary-icon weekend">☀</div>

          <div>
            <span>Weekend Holidays</span>
            <strong>2</strong>
            <small>Fall on weekends</small>
          </div>
        </div>
      </div>

      {/* Holiday List */}
      <div className="holidays-card">
        <div className="holidays-card-header">
          <div>
            <h2>Holiday Calendar</h2>
            <p>Company holidays for the year 2026.</p>
          </div>

          <div className="holiday-year">2026</div>
        </div>

        <div className="holidays-list">
          {holidays.map((holiday) => (
            <div className="holiday-row" key={holiday.id}>
              <div className="holiday-date">
                <strong>{holiday.date.split(" ")[0]}</strong>
                <span>
                  {holiday.date.split(" ")[1]}{" "}
                  {holiday.date.split(" ")[2]}
                </span>
              </div>

              <div className="holiday-info">
                <strong>{holiday.name}</strong>
                <span>{holiday.type}</span>
              </div>

              <div className="holiday-day">
                {holiday.day}
              </div>

              <div className="holiday-status">
                <span className="holiday-dot"></span>
                Holiday
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}