import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminApprovals() {
  const { user } = useAuth();
  const isAdmin =
    localStorage.getItem("adminLoggedIn") === "true" || user?.role === "admin";

  const [appointments, setAppointments] = useState([]);

  /* modal state */
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(""); // approve / deny

  /* fetch all appointments once */
  useEffect(() => {
    if (!isAdmin) return;

    const db = getDatabase();
    const appRef = ref(db, "appointments");
    onValue(appRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setAppointments(list);
    });
  }, [isAdmin]);

  /* open + close modal */
  const openModal  = (type, app) => {
    setActionType(type);
    setSelectedApp(app);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
    setActionType("");
  };

  /* confirm approve / deny */
  const confirmAction = async () => {
    const db = getDatabase();
    const newStatus = actionType === "approve" ? "approved" : "denied";
    await update(ref(db, `appointments/${selectedApp.id}`), {
      ...selectedApp,
      status: newStatus,
    });
    closeModal();
  };

  /* block non‑admins */
  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return (
    <>
      <div className="container mt-4">
        <h3>Appointment Approvals</h3>

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
                  <strong>{app.date}</strong> at {app.time} &nbsp;
                  <span className={`badge bg-${badgeColor(app.status)}`}>
                    {app.status}
                  </span>
                  <br />
                  Student: {app.studentId} &nbsp;|&nbsp; Teacher: {app.teacherId}
                </div>
                <div>
                  <button
                    className="btn btn-success btn-sm me-2"
                    disabled={app.status === "approved"}
                    onClick={() => openModal("approve", app)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={app.status === "denied"}
                    onClick={() => openModal("deny", app)}
                  >
                    Deny
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* -------- Confirmation Modal -------- */}
      {showModal && selectedApp && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-capitalize">
                  {actionType} Appointment
                </h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to{" "}
                  <strong>{actionType}</strong> this appointment?
                </p>
                <p>
                  <strong>Date:</strong> {selectedApp.date}
                  <br />
                  <strong>Time:</strong> {selectedApp.time}
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className={`btn btn-${
                    actionType === "approve" ? "success" : "danger"
                  }`}
                  onClick={confirmAction}
                >
                  Yes, {actionType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* helper for badge color */
function badgeColor(status) {
  if (status === "approved") return "success";
  if (status === "denied") return "danger";
  return "warning"; // pending
}
