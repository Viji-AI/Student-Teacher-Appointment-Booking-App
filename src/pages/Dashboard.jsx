// ✅ Page: /src/pages/Dashboard.jsx — rev3 (teacher actions)
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  /* ───────── Fetch & Filter ───────── */
  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const apptRef = ref(db, "appointments");

    const unsub = onValue(apptRef, snap => {
      const data = snap.val() || {};
      const list = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .filter(a =>
          user.role === "student"
            ? a.studentId === user.uid
            : user.role === "teacher"
            ? a.teacherId === user.uid
            : false
        );
      setAppointments(list);
    });
    return () => unsub();
  }, [user]);

  /* ───────── Student Cancel ───────── */
  const cancelAppt = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    await remove(ref(getDatabase(), `appointments/${id}`));
  };

  /* ───────── Teacher Actions ───────── */
  const updateStatus = async (id, status) => {
    await update(ref(getDatabase(), `appointments/${id}`), { status });
  };

  /* ───────── Render ───────── */
  if (!user) {
    return (
      <>
        <div className="container mt-4">
          <h3>Please log in to view your dashboard.</h3>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mt-4">
        <h3>My Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <ul className="list-group">
            {appointments.map((app) => (
              <li
                key={app.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{app.date}</strong> at {app.time} — {" "}
                  {user.role === "teacher" ? `Student: ${app.studentId}` : `Teacher: ${app.teacherId}`}{" "}
                  <span className="badge bg-info ms-1">{app.status}</span>
                </div>

                {/* Student can cancel pending */}
                {user.role === "student" && app.status === "pending" && (
                  <button className="btn btn-outline-danger btn-sm" onClick={() => cancelAppt(app.id)}>
                    Cancel
                  </button>
                )}

                {/* Teacher actions */}
                {user.role === "teacher" && (
                  <div className="btn-group">
                    {app.status === "pending" && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(app.id, "confirmed")}>Confirm</button>
                        <button className="btn btn-danger btn-sm" onClick={() => cancelAppt(app.id)}>Cancel</button>
                      </>
                    )}
                    {app.status === "confirmed" && (
                      <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(app.id, "completed")}>Completed</button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
