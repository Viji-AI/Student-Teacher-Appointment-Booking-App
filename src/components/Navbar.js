import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../api/firebase";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    viewAsPublic,
    returnAsAdmin,
    impersonating,
    impersonateUser,
  } = useAuth();

  const [students, setStudents]   = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  /* fetch students & teachers once we enter public mode */
  useEffect(() => {
    if (!impersonating) return;

    (async () => {
      try {
        setLoadingUsers(true);
        const [stuSnap, teaSnap] = await Promise.all([
          get(ref(db, "Student")),
          get(ref(db, "Teacher")),
        ]);

        const stuList = Object.entries(stuSnap.val() || {}).map(([uid, info]) => ({
          uid,
          name: info?.name || "Unnamed Student",
        }));
        const teaList = Object.entries(teaSnap.val() || {}).map(([uid, info]) => ({
          uid,
          name: info?.name || "Unnamed Teacher",
        }));

        setStudents(stuList);
        setTeachers(teaList);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [impersonating]);

  /* helpers */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch {
      alert("Failed to log out");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">EduSlot</Link>

        <div className="ms-auto">
          {/* ───── Impersonation controls ───── */}
          {impersonating && (
            <>
              {/* dropdown only while user == null (public view) */}
              {!user && (
                <div className="dropdown d-inline me-2">
                  <button
                    className="btn btn-outline-info btn-sm dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    View&nbsp;As
                  </button>
                  <ul className="dropdown-menu">
                    <li className="dropdown-header">Students</li>
                    {loadingUsers ? (
                      <li className="dropdown-item text-muted">Loading…</li>
                    ) : students.length ? (
                      students.map(s => (
                        <li key={s.uid}>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              impersonateUser(s.uid, "student");
                              navigate("/dashboard");
                            }}
                          >
                            {s.name}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="dropdown-item text-muted">No students</li>
                    )}

                    <li><hr className="dropdown-divider" /></li>

                    <li className="dropdown-header">Teachers</li>
                    {teachers.length ? (
                      teachers.map(t => (
                        <li key={t.uid}>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              impersonateUser(t.uid, "teacher");
                              navigate("/dashboard");
                            }}
                          >
                            {t.name}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="dropdown-item text-muted">No teachers</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Return‑to‑Admin always visible while impersonating */}
              <button
                onClick={() => { returnAsAdmin(); navigate("/admin"); }}
                className="btn btn-outline-warning btn-sm me-2"
              >
                Return&nbsp;to&nbsp;Admin
              </button>
            </>
          )}

          {/* ───── Logged‑in navbar (admin / student / teacher) ───── */}
          {user && (
            <>
              {user.name && (
                <span className="me-3">
                  Hello,&nbsp;<strong>{user.name}</strong>
                </span>
              )}

              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="btn btn-outline-secondary btn-sm me-2"
              >
                Dashboard
              </Link>

              {user.role === "student" && (
                <Link
                  to="/teachers"
                  className="btn btn-outline-secondary btn-sm me-2"
                >
                  Teachers
                </Link>
              )}

              {user.role === "admin" && !impersonating && (
                <>
                  <Link
                    to="/admin-approvals"
                    className="btn btn-outline-warning btn-sm me-2"
                  >
                    Approvals
                  </Link>
                  <button
                    onClick={() => { viewAsPublic(); navigate("/"); }}
                    className="btn btn-outline-info btn-sm me-2"
                  >
                    View&nbsp;as&nbsp;Public
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
              >
                Logout
              </button>
            </>
          )}

          {/* ───── Public navbar (not logged in) ───── */}
          {!user && !impersonating && (
            <>
              <Link to="/login" className="btn btn-outline-primary btn-sm me-2">Login</Link>
              <Link to="/register" className="btn btn-outline-success btn-sm me-2">Register</Link>
              <Link to="/admin-login" className="btn btn-outline-dark btn-sm">Admin&nbsp;Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
