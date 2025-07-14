import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../api/firebase";
import { Link } from "react-router-dom";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const snapshot = await get(ref(db, "Teacher"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setTeachers(teachersList);
      } else {
        setTeachers([]);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <>
      <div className="container mt-4">
        <h3>Available Teachers</h3>
        <ul className="list-group">
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <li
                key={teacher.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{teacher.name}</strong> — {teacher.department || "No Dept"}
                </div>
                <Link
                  to={`/booking/${teacher.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  Book
                </Link>
              </li>
            ))
          ) : (
            <li className="list-group-item">No teachers found.</li>
          )}
        </ul>
      </div>
    </>
  );
}
