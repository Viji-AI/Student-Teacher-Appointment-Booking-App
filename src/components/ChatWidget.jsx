// src/components/ChatWidget.jsx
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import { useAuth } from "../auth/AuthContext";

export default function ChatWidget() {
  const { user } = useAuth();
  const db = getDatabase();

  /* UI state */
  const [open, setOpen] = useState(false);
  const [partners, setPartners] = useState([]);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [hasUnread, setHasUnread] = useState(false);

  /** ───────── Load partner list (teachers <-> students) ───────── **/
  useEffect(() => {
    if (!user) return;
    const node = user.role === "student" ? "Teacher" : "Student";
    return onValue(ref(db, node), snap => {
      const data = snap.val() || {};
      setPartners(
        Object.entries(data).map(([uid, info]) => ({
          uid,
          name: info?.name || "Unnamed",
        }))
      );
    });
  }, [user, db]);

  /** ───────── Load messages for selected partner ───────── **/
  useEffect(() => {
    if (!user || !partner) return;
    const chatId = [user.uid, partner.uid].sort().join("_");
    const unsub = onValue(ref(db, `chats/${chatId}/messages`), snap => {
      const data = snap.val() || {};
      const list = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
      setMessages(list);

      /* Mark as read */
      if (list.length) {
        const last = list[list.length - 1];
        localStorage.setItem("lastRead_" + chatId, last.timestamp);
      }
    });
    return () => unsub();
  }, [user, partner, db]);

  /** ───────── Global unread‑message tracker ───────── **/
  useEffect(() => {
    if (!user) return;
    const unsub = onValue(ref(db, "chats"), snap => {
      let unread = false;
      const chats = snap.val() || {};
      Object.entries(chats).forEach(([chatId, chat]) => {
        if (!(chat.participants && chat.participants[user.uid])) return;
        const msgs = chat.messages ? Object.values(chat.messages) : [];
        if (!msgs.length) return;
        const last = msgs[msgs.length - 1];
        const lastRead = Number(localStorage.getItem("lastRead_" + chatId) || 0);
        if (last.senderId !== user.uid && last.timestamp > lastRead) {
          unread = true;
        }
      });
      setHasUnread(unread);
    });
    return () => unsub();
  }, [user, db]);

  /** ───────── Send message ───────── **/
  const send = async () => {
    if (!text.trim() || !partner) return;
    const chatId = [user.uid, partner.uid].sort().join("_");
    const msgRef = ref(db, `chats/${chatId}/messages`);
    await push(msgRef, {
      senderId: user.uid,
      text: text.trim(),
      timestamp: Date.now(),
    });
    /* update meta */
    await set(ref(db, `chats/${chatId}/participants/${user.uid}`), true);
    await set(ref(db, `chats/${chatId}/participants/${partner.uid}`), true);
    await set(ref(db, `chats/${chatId}/lastUpdated`), Date.now());
    setText("");
  };

  /** ───────── Widget JSX ───────── **/
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
      {open ? (
        <div style={{ width: 320 }} className="card shadow">
          <div className="card-header d-flex align-items-center gap-2">
            {partner && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setPartner(null)}
                title="Back to list"
              >
                ←
              </button>
            )}
            <strong className="flex-grow-1">
              {partner ? `Chat – ${partner.name}` : "Select Partner"}
            </strong>
            <button className="btn-close" onClick={() => setOpen(false)} />
          </div>

          {/* Partner list */}
          {!partner && (
            <div className="list-group list-group-flush">
              {partners.map(p => (
                <button
                  key={p.uid}
                  className="list-group-item list-group-item-action"
                  onClick={() => setPartner(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Chat window */}
          {partner && (
            <>
              <div
                className="card-body"
                style={{ height: 240, overflowY: "auto", fontSize: "0.9rem" }}
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 text-${m.senderId === user.uid ? "end" : "start"}`}
                  >
                    <span className={`badge bg-${m.senderId === user.uid ? "primary" : "secondary"}`}>
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card-footer p-2">
                <input
                  className="form-control"
                  placeholder="Type..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <button className="btn btn-primary position-relative" onClick={() => setOpen(true)}>
          💬 Chat
          {hasUnread && (
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
              style={{ width: 10, height: 10 }}
            />
          )}
        </button>
      )}
    </div>
  );
}
