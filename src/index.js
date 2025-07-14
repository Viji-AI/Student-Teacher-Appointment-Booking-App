import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ Include both CSS and JS from Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // <-- Needed for dropdowns

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
