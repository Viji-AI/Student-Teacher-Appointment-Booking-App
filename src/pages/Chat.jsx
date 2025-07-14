import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getDatabase, ref, onValue, push, set } from "firebase/database";

export default function Chat() {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const db = getDatabase();

  // 🔄 Fetch partners (Teachers for students, Students for teachers)
  useEffect(() => {
    if (!user) return;
    const path = user.role === "student" ? "Teacher" : "Student";
    const refPath = ref(db, path);
    onValue(refPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([uid, info]) => ({ uid, ...info }));
        setPartners(list);
      }
    });
  }, [user, db]);

  // 🔄 Load chat messages between user and selected partner
  useEffect(() => {
    if (!user || !selectedPartner) return;
    const chatId = [user.uid, selectedPartner.uid].sort().join("_");
    const msgRef = ref(db, `chats/${chatId}/messages`);

    onValue(msgRef, (snapshot) => {
      const data = snapshot.val() || {};
      const msgs = Object.values(data);
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgs);
    });
  }, [user, selectedPartner, db]);

  // 📨 Send a message
  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    const chatId = [user.uid, selectedPartner.uid].sort().join("_");
    const msgRef = ref(db, `chats/${chatId}/messages`);
    const newMsgRef = push(msgRef);
    const msgData = {
      senderId: user.uid,
      receiverId: selectedPartner.uid,
      text: newMsg,
      timestamp: Date.now(),
    };
    await set(newMsgRef, msgData);
    setNewMsg("");
  };

  return (
    <>
      <div className="container mt-4">
        <h3>Chat Portal</h3>
        {!user && <p>Please login to access chat.</p>}

        <div className="row mt-4">
          <div className="col-md-4 border-end">
            <h5>Available {user?.role === "student" ? "Teachers" : "Students"}</h5>
            <ul className="list-group">
              {partners.map((p) => (
                <li
                  key={p.uid}
                  className={`list-group-item ${selectedPartner?.uid === p.uid ? "active" : ""}`}
                  onClick={() => setSelectedPartner(p)}
                  style={{ cursor: "pointer" }}
                >
                  {p.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-8">
            {selectedPartner ? (
              <>
                <h5>Chat with {selectedPartner.name}</h5>
                <div className="chat-box border p-2 mb-2" style={{ height: "300px", overflowY: "scroll" }}>
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`mb-2 ${m.senderId === user.uid ? "text-end" : "text-start"}`}
                    >
                      <span
                        className={`badge bg-${m.senderId === user.uid ? "primary" : "secondary"}`}
                      >
                        {m.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="input-group">
                  <input
                    className="form-control"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button className="btn btn-success" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <p>Select a {user?.role === "student" ? "teacher" : "student"} to start chatting.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
