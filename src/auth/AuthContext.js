import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../api/firebase";
import { ref, get } from "firebase/database";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);                 // current session user
  const [loading, setLoading] = useState(true);
  const [originalAdmin, setOriginalAdmin] = useState(null); // admin snapshot for impersonation

  /* ───────── Firebase listener ───────── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const uid = firebaseUser.uid;

      try {
        // Check if student
        const stuSnap = await get(ref(db, `Student/${uid}`));
        if (stuSnap.exists()) {
          setUser({ uid, ...stuSnap.val(), role: "student" });
          setLoading(false);
          return;
        }

        // Check if teacher
        const teaSnap = await get(ref(db, `Teacher/${uid}`));
        if (teaSnap.exists()) {
          setUser({ uid, ...teaSnap.val(), role: "teacher" });
          setLoading(false);
          return;
        }

        // Check admin via localStorage flag
        const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
        if (isAdmin) {
          setUser({ uid, email: firebaseUser.email, name: "Admin", role: "admin" });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ───────── View‑as‑Public ───────── */
  const viewAsPublic = () => {
    if (!user || user.role !== "admin" || originalAdmin) return; // ✅ Prevent duplicates
    console.log("✅ Switching to public mode");
    setOriginalAdmin(user);
    setUser(null);
  };

  const returnAsAdmin = () => {
    if (originalAdmin) {
      console.log("🔁 Returning to admin");
      setUser(originalAdmin);
      setOriginalAdmin(null);
    }
  };

  /* ───────── View‑as‑User (impersonation) ───────── */
  const impersonateUser = async (uid, role) => {
  try {
    const dbPath = role === "student" ? "Student" : "Teacher";
    const snap = await get(ref(db, `${dbPath}/${uid}`));

    if (!snap.exists()) {
      alert("User not found in database.");
      return;
    }

    // ✅ Save admin snapshot only once (if not already saved)
    if (!originalAdmin && user?.role === "admin") {
      console.log("📌 Saving admin snapshot before impersonating");
      setOriginalAdmin(user);
    }

    setUser({ uid, ...snap.val(), role });
    console.log(`✅ Now impersonating ${role}: ${snap.val().name}`);
  } catch (err) {
    console.error("❌ Impersonation failed:", err);
    alert("Failed to impersonate user.");
  }
};


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        viewAsPublic,
        returnAsAdmin,
        impersonateUser,
        impersonating: !!originalAdmin,
      }}
    >
      {loading ? <div className="text-center mt-5">Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
