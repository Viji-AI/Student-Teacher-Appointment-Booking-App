import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminPanel() {
  const { user } = useAuth();
  const isAdmin = localStorage.getItem("adminLoggedIn") === "true" || user?.role === "admin";

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // ✅ Always call hooks first (NO conditional return before this)
  useEffect(() => {
    if (!isAdmin) return;

    const db = getDatabase();

    // 👨‍🎓 Load Students
    const studentRef = ref(db, "Student");
    onValue(studentRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setStudents(list);
    });

    // 👩‍🏫 Load Teachers
    const teacherRef = ref(db, "Teacher");
    onValue(teacherRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setTeachers(list);
    });

    // 📅 Load Appointments
    const appointmentRef = ref(db, "appointments");
    onValue(appointmentRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setAppointments(list);
    });
  }, [isAdmin]);

  const handleDeleteUser = async (rolePath, userId) => {
    const db = getDatabase();
    await remove(ref(db, `${rolePath}/${userId}`));
    alert("User deleted");
  };

  const handleDeleteAppointment = async (appId) => {
    const db = getDatabase();
    await remove(ref(db, `appointments/${appId}`));
    alert("Appointment deleted");
  };

  // ✅ Now it's safe to redirect AFTER the hooks
  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return (
    <>
      <div className="container mt-4">
        <h2>👑 Admin Panel</h2>

        <h4 className="mt-4">All Students</h4>
        <ul className="list-group">
          {students.map((s) => (
            <li key={s.id} className="list-group-item d-flex justify-content-between">
              <div>{s.name} — {s.email}</div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser("Student", s.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>

        <h4 className="mt-4">All Teachers</h4>
        <ul className="list-group">
          {teachers.map((t) => (
            <li key={t.id} className="list-group-item d-flex justify-content-between">
              <div>{t.name} ({t.department}) — {t.email}</div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser("Teacher", t.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>

        <h4 className="mt-4">All Appointments</h4>
        <ul className="list-group">
          {appointments.map((a) => (
            <li key={a.id} className="list-group-item d-flex justify-content-between">
              <div>
                {a.date} @ {a.time} — Student: {a.studentId}, Teacher: {a.teacherId} ({a.status})
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAppointment(a.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
