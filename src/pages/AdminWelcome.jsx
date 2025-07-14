import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminWelcome() {
  const { user } = useAuth();
  const isAdmin = localStorage.getItem("adminLoggedIn") === "true" || user?.role === "admin";

  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return (
    <>
      <div className="container mt-5">
        <h2>Welcome Admin 👑</h2>
        <p className="lead">
          You’ve successfully logged in. You can now access the{" "}
          <a href="/admin-panel">Admin Panel</a> to manage users and appointments.
        </p>
      </div>
    </>
  );
}
