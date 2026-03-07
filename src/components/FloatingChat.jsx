import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import { getMessages, sendMessage, getAdminId } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

export default function FloatingChat() {
  const { user } = useAuth();
  const [open,       setOpen]       = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState("");
  const [adminId,    setAdminId]    = useState(null);
  const [unread,     setUnread]     = useState(0);
  const [sending,    setSending]    = useState(false);
  const [ping,       setPing]       = useState(null);
  const bottomRef = useRef(null);

  const isAdmin = user?.role === "Administrator";

  // Socket for real-time
  useSocket(user?._id, {
    onMessage: (msg) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
      if (!open) setUnread((u) => u + 1);
    },
    onPinged: (data) => {
      setPing(data);
      setTimeout(() => setPing(null), 5000);
    },
  });

  // Load admin ID for non-admin users
  useEffect(() => {
    if (!user || isAdmin) return;
    getAdminId(user.token)
      .then((a) => setAdminId(a._id))
      .catch(() => {});
  }, [user]);

  // Load messages when opened
  useEffect(() => {
    if (!open || !user) return;
    const target = isAdmin ? null : adminId;
    if (!target && !isAdmin) return;
    setUnread(0);
    if (!isAdmin) {
      getMessages(user.token, target)
        .then(setMessages)
        .catch(() => {});
    }
  }, [open, adminId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const target = isAdmin ? messages[messages.length - 1]?.sender?._id : adminId;
    if (!target) return;
    setSending(true);
    try {
      await sendMessage(user.token, { receiverId: target, content: input.trim() });
      setInput("");
    } catch {}
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!user) return null;
  // Admins use the full dashboard chat — hide floating chat for them
  if (isAdmin) return null;

  return (
    <>
      {/* Ping popup */}
      {ping && (
        <div className="ping-popup">
          <Icon name="bell" size={14} />
          <span>{ping.message}</span>
        </div>
      )}

      {/* Floating button */}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)}>
        <Icon name="message-circle" size={22} />
        {unread > 0 && <span className="chat-fab-badge">{unread}</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">A</div>
              <div>
                <div className="chat-header-name">BHF Support</div>
                <div className="chat-header-status">Admin · Online</div>
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
              const mine = m.sender?._id === user._id || m.sender === user._id;
              return (
                <div key={m._id} className={`chat-msg ${mine ? "mine" : "theirs"}`}>
                  <div className="chat-bubble">{m.content}</div>
                  <div className="chat-time">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
              onKeyDown={handleKey}
              maxLength={500}
            />
            <button className="chat-send" onClick={handleSend} disabled={sending || !input.trim()}>
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}