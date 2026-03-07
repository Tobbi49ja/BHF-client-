import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import { getMessages, sendMessage, getAdminId } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

export default function FloatingChat() {
  const { user } = useAuth();
  const [open,     setOpen]    = useState(false);
  const [messages, setMsgs]   = useState([]);
  const [input,    setInput]   = useState("");
  const [adminId,  setAdminId] = useState(null);
  const [unread,   setUnread]  = useState(0);
  const [ping,     setPing]    = useState(null);
  const sendingRef = useRef(false);   // prevents double-send
  const bottomRef  = useRef(null);

  // stable refs so socket callbacks never go stale
  const openRef    = useRef(false);
  const adminIdRef = useRef(null);
  const userIdRef  = useRef(null);
  useEffect(() => { openRef.current    = open;      }, [open]);
  useEffect(() => { adminIdRef.current = adminId;   }, [adminId]);
  useEffect(() => { userIdRef.current  = user?._id; }, [user]);

  const isAdmin = user?.role === "Administrator";

  // Debug
  useEffect(() => {
    console.log("[FloatingChat] user._id:", user?._id, "| adminId:", adminId, "| isAdmin:", isAdmin);
  }, [user?._id, adminId]);

  useSocket(user?._id, {
    onMessage: (msg) => {
      const senderId   = msg.sender?._id   || msg.sender;
      const receiverId = msg.receiver?._id || msg.receiver;
      const myId       = userIdRef.current;
      const aid        = adminIdRef.current;

      const relevant =
        (senderId === myId && receiverId === aid) ||
        (senderId === aid  && receiverId === myId);
      if (!relevant) return;

      setMsgs((prev) => prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]);
      if (!openRef.current && senderId !== myId) setUnread((u) => u + 1);
    },
    onPinged: (data) => {
      setPing(data);
      setTimeout(() => setPing(null), 6000);
    },
  });

  // Load admin ID once
  useEffect(() => {
    if (!user || isAdmin) return;
    getAdminId(user.token).then((a) => setAdminId(a._id)).catch(() => {});
  }, [user?._id]);

  // Load history when chat opens
  useEffect(() => {
    if (!open || !adminId || isAdmin) return;
    setUnread(0);
    getMessages(user.token, adminId).then(setMsgs).catch(() => {});
  }, [open, adminId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !adminId || sendingRef.current) return;
    sendingRef.current = true;
    const content = input.trim();
    setInput("");

    const optimistic = {
      _id: "opt-" + Date.now(),
      sender:   { _id: user._id },
      receiver: { _id: adminId },
      content, read: false,
      createdAt: new Date().toISOString(),
      _opt: true,
    };
    setMsgs((p) => [...p, optimistic]);

    try {
      const saved = await sendMessage(user.token, { receiverId: adminId, content });
      setMsgs((p) => p.map((m) => m._opt ? saved : m));
    } catch {
      setMsgs((p) => p.filter((m) => !m._opt));
    } finally {
      sendingRef.current = false;
    }
  };

  if (!user || isAdmin) return null;

  return (
    <>
      {ping && (
        <div className="ping-popup">
          <Icon name="bell" size={14} />
          <span>{ping.message}</span>
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen((o) => !o)}>
        <Icon name="message-circle" size={22} />
        {unread > 0 && <span className="chat-fab-badge">{unread}</span>}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">A</div>
              <div>
                <div className="chat-header-name">BHF Support</div>
                <div className="chat-header-status">Admin</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <Icon name="x" size={15} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <Icon name="message-circle" size={28} />
                <p>Send a message to BHF Support</p>
              </div>
            )}
            {messages.map((m) => {
              const mine = (m.sender?._id || m.sender) === user._id;
              return (
                <div key={m._id} className={`chat-msg ${mine ? "mine" : "theirs"}`}>
                  <div className="chat-bubble">{m.content}</div>
                  <div className="chat-time">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                    {mine && <span className="chat-read">{m.read ? " ✓✓" : " ✓"}</span>}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              maxLength={500}
            />
            <button className="chat-send" onClick={handleSend} disabled={!input.trim()}>
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}