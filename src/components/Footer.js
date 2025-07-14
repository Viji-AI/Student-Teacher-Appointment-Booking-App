// src/components/Footer.js
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-auto w-100">
      <div className="container py-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <p className="mb-2 mb-md-0 small">
          © {new Date().getFullYear()} <span className="fw-semibold">EduSlot</span>. All rights reserved.
        </p>

        <ul className="nav">
          <li className="nav-item">
            <Link to="/about" className="text-white nav-link px-2">About</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="text-white nav-link px-2">Contact</Link>
          </li>
          <li className="nav-item">
            <Link to="/privacy" className="text-white nav-link px-2">Privacy</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
