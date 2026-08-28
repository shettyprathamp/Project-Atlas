import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import DashboardLayout from "./components/layout/DashboardLayout";

import ManagerShell from "./components/manager/ManagerShell";
import EmployeeSidebar from "./components/employee/EmployeeSidebar";

// =========================================================
// MANAGER
// =========================================================

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerEmployees from "./pages/manager/Employees";
import ManagerTeams from "./pages/manager/Teams";
import ManagerPerformance from "./pages/manager/Performance";
import ManagerAttendance from "./pages/manager/Attendance";
import ManagerLeave from "./pages/manager/Leave";
import ManagerMyAttendance from "./pages/manager/MyAttendance";
import ManagerMyLeave from "./pages/manager/MyLeave";
import ManagerPayroll from "./pages/manager/Payroll";
import ManagerMyPayroll from "./pages/manager/MyPayroll";

import ManagerProfile from "./pages/manager/Profile";
import ManagerSettings from "./pages/manager/Settings";

// =========================================================
// HR
// =========================================================

import HRDashboard from "./pages/hr/HRDashboard";
import Employees from "./pages/hr/Employees";
import Attendance from "./pages/hr/Attendance";
import Leave from "./pages/hr/Leave";
import Recruitment from "./pages/hr/Recruitment";
import Payroll from "./pages/hr/Payroll";
import Reports from "./pages/hr/Reports";

// =========================================================
// EMPLOYEE
// =========================================================

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeLeave from "./pages/employee/Leave";
import EmployeePayroll from "./pages/employee/Payroll";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeSettings from "./pages/employee/Settings";

// =========================================================
// GLOBAL STYLES
// =========================================================

import "./App.css";

// =========================================================
// WORKSPACE
// =========================================================

function Workspace({ title }) {
  return (
    <div className="atlas-workspace">
      <div className="atlas-workspace-inner">
        <h1>{title}</h1>

        <p>Project Atlas workspace</p>
      </div>
    </div>
  );
}

// =========================================================
// UNAUTHORIZED
// =========================================================

function Unauthorized() {
  return (
    <div className="atlas-unauthorized">
      <div>
        <h1>Access Denied</h1>

        <p>
          You do not have permission to access this workspace.
        </p>
      </div>
    </div>
  );
}

// =========================================================
// HR / BILLING SHELL
// =========================================================

function ProtectedLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

// =========================================================
// EMPLOYEE SHELL
// =========================================================
//
// IMPORTANT:
// EmployeeDashboard already contains its own sidebar.
//
// The other employee pages use this shell.
//
// Therefore we DO NOT render EmployeeSidebar here
// for EmployeeDashboard.
//
// Other employee pages get the sidebar through this shell.
//

function EmployeeShell({ children }) {
  return (
    <div className="employee-shell">
      <EmployeeSidebar />

      <main className="employee-shell-main">
        {children}
      </main>
    </div>
  );
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ===================================================
              PUBLIC
          =================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* ===================================================
              PROTECTED
          =================================================== */}

          <Route element={<ProtectedRoute />}>

            {/* =================================================
                MANAGER
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={["manager"]}
                />
              }
            >

              <Route
                path="/manager"
                element={
                  <ManagerShell>
                    <ManagerDashboard />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/employees"
                element={
                  <ManagerShell>
                    <ManagerEmployees />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/teams"
                element={
                  <ManagerShell>
                    <ManagerTeams />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/performance"
                element={
                  <ManagerShell>
                    <ManagerPerformance />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/attendance"
                element={
                  <ManagerShell>
                    <ManagerAttendance />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/leave"
                element={
                  <ManagerShell>
                    <ManagerLeave />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/payroll"
                element={
                  <ManagerShell>
                    <ManagerPayroll />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/my-attendance"
                element={
                  <ManagerShell>
                    <ManagerMyAttendance />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/my-leave"
                element={
                  <ManagerShell>
                    <ManagerMyLeave />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/my-payroll"
                element={
                  <ManagerShell>
                    <ManagerMyPayroll />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/profile"
                element={
                  <ManagerShell>
                    <ManagerProfile />
                  </ManagerShell>
                }
              />

              <Route
                path="/manager/settings"
                element={
                  <ManagerShell>
                    <ManagerSettings />
                  </ManagerShell>
                }
              />

            </Route>

            {/* =================================================
                BILLING
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={["billing"]}
                />
              }
            >

              <Route
                path="/billing"
                element={
                  <ProtectedLayout>
                    <Workspace title="Billing Software" />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/billing/invoices"
                element={
                  <ProtectedLayout>
                    <Workspace title="Invoices" />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/billing/customers"
                element={
                  <ProtectedLayout>
                    <Workspace title="Customers" />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/billing/payments"
                element={
                  <ProtectedLayout>
                    <Workspace title="Payments" />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/billing/expenses"
                element={
                  <ProtectedLayout>
                    <Workspace title="Expenses" />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/billing/reports"
                element={
                  <ProtectedLayout>
                    <Workspace title="Billing Reports" />
                  </ProtectedLayout>
                }
              />

            </Route>

            {/* =================================================
                HR
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={["hr"]}
                />
              }
            >

              <Route
                path="/hr"
                element={
                  <ProtectedLayout>
                    <HRDashboard />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/hr/employees"
                element={
                  <ProtectedLayout>
                    <Employees />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/hr/attendance"
                element={
                  <ProtectedLayout>
                    <Attendance />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/hr/leave"
                element={
                  <ProtectedLayout>
                    <Leave />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/hr/recruitment"
                element={
                  <ProtectedLayout>
                    <Recruitment />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/hr/payroll"
                element={
                  <ProtectedLayout>
                    <Payroll />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/hr/reports"
                element={
                  <ProtectedLayout>
                    <Reports />
                  </ProtectedLayout>
                }
              />

            </Route>

            {/* =================================================
                EMPLOYEE
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={["employee"]}
                />
              }
            >

              {/* DASHBOARD
                  Dashboard has its OWN sidebar.
              */}

              <Route
                path="/employee"
                element={<EmployeeDashboard />}
              />

              {/* ATTENDANCE */}

              <Route
                path="/employee/attendance"
                element={
                  <EmployeeShell>
                    <EmployeeAttendance />
                  </EmployeeShell>
                }
              />

              {/* LEAVE */}

              <Route
                path="/employee/leave"
                element={
                  <EmployeeShell>
                    <EmployeeLeave />
                  </EmployeeShell>
                }
              />

              {/* TASKS */}

              <Route
                path="/employee/tasks"
                element={
                  <EmployeeShell>
                    <Workspace title="Employee Tasks" />
                  </EmployeeShell>
                }
              />

              {/* PAYSLIPS */}

              <Route
                path="/employee/payslips"
                element={
                  <EmployeeShell>
                    <EmployeePayroll />
                  </EmployeeShell>
                }
              />

              {/* PAYROLL */}

              <Route
                path="/employee/payroll"
                element={
                  <EmployeeShell>
                    <EmployeePayroll />
                  </EmployeeShell>
                }
              />

              {/* PROFILE */}

              <Route
                path="/employee/profile"
                element={
                  <EmployeeShell>
                    <EmployeeProfile />
                  </EmployeeShell>
                }
              />

              {/* SETTINGS */}

              <Route
                path="/employee/settings"
                element={
                  <EmployeeShell>
                    <EmployeeSettings />
                  </EmployeeShell>
                }
              />

            </Route>

          </Route>

          {/* ===================================================
              UNKNOWN ROUTES
          =================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;