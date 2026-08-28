
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="atlas-layout">

      {/* SIDEBAR */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* MAIN AREA */}
      <div className="atlas-main">

        <Header
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="atlas-content">
          {children}
        </main>

      </div>

    </div>
  );
}
