// src/components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-auto w-100">
      <div className="container py-3 d-flex flex-column flex-md-row
                      justify-content-between align-items-center">

        <p className="mb-2 mb-md-0 small">
          © {new Date().getFullYear()} <span className="fw-semibold">EduSlot</span>. All rights reserved.
        </p>

        <ul className="nav">
          <li className="nav-item">
            <a className="nav-link px-2 text-white" href="/#/about">About</a>
          </li>
          <li className="nav-item">
            <a className="nav-link px-2 text-white" href="/#/contact">Contact</a>
          </li>
          <li className="nav-item">
            <a className="nav-link px-2 text-white" href="/#/privacy">Privacy</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
