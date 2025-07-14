import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Teachers from "./pages/Teachers";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminWelcome from "./pages/AdminWelcome";
import AdminApprovals from "./pages/AdminApproval";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Navbar from "./components/Navbar";

import ChatWidget from "./components/ChatWidget";
import Footer from "./components/Footer";

function AppRoutes() {
  const { user } = useAuth();

  return (
    // ✅ Full-height layout with flex column
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      {/* ✅ Main content that grows to fill available space */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/booking/:teacherId" element={<Booking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminWelcome />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/admin-approvals" element={<AdminApprovals />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>

      {/* ✅ Footer sticks to bottom */}
      <Footer />

      {/* ✅ Floating Chat Widget */}
      {user && (user.role === "student" || user.role === "teacher") && (
        <ChatWidget />
      )}
    </div>
  );
}



export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
