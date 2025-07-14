import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../api/firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
      const dbPath = role === "student" ? "Student" : "Teacher";

      console.log("✅ Firebase Auth success:");
      console.log("→ UID:", uid);
      console.log("→ Role:", role);
      console.log("→ Department:", department);

      const userData = {
        name,
        email,
        role,
        ...(role === "teacher" && { department }),
      };

      console.log("📤 Writing to Realtime DB at:", `${dbPath}/${uid}`);
      console.log("📝 Data:", userData);

      await set(ref(db, `${dbPath}/${uid}`), userData);

      alert("Registered successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Registration Error:", err.message);
      alert(err.message);
    }
  };

  return (
    <>
      <div className="container mt-5">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="form-control mb-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {role === "teacher" && (
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Department"
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          )}
          <button type="submit" className="btn btn-success">Register</button>
        </form>
      </div>
    </>
  );
}
