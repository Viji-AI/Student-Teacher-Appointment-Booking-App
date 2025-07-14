import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../api/firebase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const ADMIN_EMAIL = "vijinet6@gmail.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      if (res.user.email !== ADMIN_EMAIL) {
        setError("Not authorized as admin.");
        return;
      }

      // Save admin session
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="card shadow p-4" style={{ width: "100%", maxWidth: 420 }}>
          <h3 className="text-center mb-3">Admin Login</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-danger">
                Login as Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
