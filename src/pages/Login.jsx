import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../api/firebase";
import { ref, get } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  /* ---------- main login flow ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Check Student
      const studentSnap = await get(ref(db, `Student/${res.user.uid}`));
      if (studentSnap.exists()) {
        setUser({ ...studentSnap.val(), uid: res.user.uid, role: "student" });
        return navigate("/dashboard");
      }

      // Check Teacher
      const teacherSnap = await get(ref(db, `Teacher/${res.user.uid}`));
      if (teacherSnap.exists()) {
        setUser({ ...teacherSnap.val(), uid: res.user.uid, role: "teacher" });
        return navigate("/dashboard");
      }

      setError("User profile not found in database.");
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------- forgot‑password flow ---------- */
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your e‑mail first, then click 'Forgot password?'.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError(
        "Password‑reset e‑mail sent! Check your inbox (and spam folder)."
      );
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="card shadow p-4" style={{ width: "100%", maxWidth: 420 }}>
          <h3 className="text-center mb-3">Sign In to EduSlot</h3>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="d-grid mb-3">
              <button className="btn btn-primary" type="submit">
                Login
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <small>
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </small>
              <small>
                <Link to="/admin-login">Login as Admin?</Link>
              </small>
            </div>

            <div className="text-center">
              <small>
                Don’t have an account? <Link to="/register">Register here</Link>
              </small>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
