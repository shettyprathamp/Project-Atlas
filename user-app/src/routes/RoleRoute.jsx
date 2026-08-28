import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f19",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading Atlas...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();

  const permitted = allowedRoles.some(
    (role) => role.toLowerCase() === userRole
  );

  if (!permitted) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}