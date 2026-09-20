import { useState } from "react";
import ManagerSidebar from "./ManagerSidebar";
import "./ManagerShell.css";

function ManagerShell({ children }) {
const [sidebarOpen, setSidebarOpen] = useState(false);

const closeSidebar = () => {
setSidebarOpen(false);
};

const toggleSidebar = () => {
setSidebarOpen((current) => !current);
};

return ( <div className="manager-shell"> <header className="manager-mobile-header"> <div className="manager-mobile-brand"> <div className="manager-mobile-brand-title">
ATLAS </div>


      <div className="manager-mobile-brand-role">
        MANAGER PORTAL
      </div>
    </div>

    <button
      type="button"
      className={
        sidebarOpen
          ? "manager-mobile-menu is-open"
          : "manager-mobile-menu"
      }
      onClick={toggleSidebar}
      aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      aria-expanded={sidebarOpen}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>

  {sidebarOpen && (
    <button
      type="button"
      className="manager-sidebar-overlay"
      onClick={closeSidebar}
      aria-label="Close menu"
    ></button>
  )}

  <div
    className={
      sidebarOpen
        ? "manager-sidebar-wrapper mobile-sidebar-open"
        : "manager-sidebar-wrapper"
    }
  >
    <ManagerSidebar />
  </div>

  <main className="manager-main">
    <div className="manager-page">
      {children}
    </div>
  </main>
</div>


);
}

export default ManagerShell;
