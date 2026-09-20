import EmployeeSidebar from "./EmployeeSidebar";
import "./EmployeeLayout.css";

export default function EmployeeLayout({ children }) {
  return (
    <div className="employee-layout">
      <EmployeeSidebar />

      <main className="employee-layout-content">
        {children}
      </main>
    </div>
  );
}