import { useParams } from "react-router-dom";
import { useState } from "react";
import { getDatabase, push, ref } from "firebase/database";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

export default function Booking() {
  const { teacherId } = useParams();
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getDatabase();
    const appointmentRef = ref(db, "appointments");

    try {
      await push(appointmentRef, {
        studentId: user.uid,
        teacherId,
        date,
        time,
        status: "pending"
      });
      alert("Appointment booked!");
    } catch (err) {
      alert("Failed to book: " + err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3>Book Appointment</h3>
        <form onSubmit={handleSubmit}>
          <input type="date" className="form-control mb-2" onChange={(e) => setDate(e.target.value)} required />
          <input type="time" className="form-control mb-2" onChange={(e) => setTime(e.target.value)} required />
          <button className="btn btn-success">Book</button>
        </form>
      </div>
    </>
  );
}
