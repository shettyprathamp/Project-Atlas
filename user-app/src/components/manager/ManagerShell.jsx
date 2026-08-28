import ManagerSidebar from "./ManagerSidebar";

import "./ManagerShell.css";

function ManagerShell({ children }) {
  return (
    <div className="manager-shell">

      <ManagerSidebar />

      <main className="manager-main">

        <div className="manager-page">
          {children}
        </div>

      </main>

    </div>
  );
}

export default ManagerShell;