import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";
import { getMessages, sendMessage, getAdminId } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

export default function FloatingChat() {
  const { user } = useAuth();
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [adminId,  setAdminId]  = useState(null);
  const [unread,   setUnread]   = useState(0);
  const [sending,  setSending]  = useState(false);
  const [ping,     setPing]     = useState(null);
  const bottomRef  = useRef(null);
  const openRef    = useRef(open);
  const adminIdRef = useRef(adminId);

  useEffect(() => { openRef.current    = open;    }, [open]);
  useEffect(() => { adminIdRef.current = adminId; }, [adminId]);

  const isAdmin = user?.role === "Administrator";

  const handleNewMessage = useCallback((msg) => {
    const myId    = user?._id;
    const senderId   = msg.sender?._id   || msg.sender;
    const receiverId = msg.receiver?._id || msg.receiver;

    // Only handle messages in this conversation (user ↔ admin)
    const relevant =
      senderId === myId   || receiverId === myId ||
      senderId === adminIdRef.current || receiverId === adminIdRef.current;

    if (!relevant) return;

    setMessages((prev) => prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]);

    // Increment unread only if chat is closed AND the message is from someone else
    if (!openRef.current && senderId !== myId) {
      setUnread((u) => u + 1);
    }
  }, [user?._id]);

  useSocket(user?._id, {
    onMessage: handleNewMessage,
    onPinged:  (data) => { setPing(data); setTimeout(() => setPing(null), 5000); },
  });

  // Load admin ID
  useEffect(() => {
    if (!user || isAdmin) return;
    getAdminId(user.token).then((a) => setAdminId(a._id)).catch(() => {});
  }, [user]);

  // Load history when chat opens
  useEffect(() => {
    if (!open || !user || isAdmin || !adminId) return;
    setUnread(0);
    getMessages(user.token, adminId).then(setMessages).catch(() => {});
  }, [open, adminId]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || !adminId) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      // Optimistic: add immediately so sender sees it right away
      const optimistic = {
        _id:       "opt-" + Date.now(),
        sender:    { _id: user._id },
        receiver:  { _id: adminId },
        content,
        read:      false,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      const saved = await sendMessage(user.token, { receiverId: adminId, content });
      // Replace optimistic with real message
      setMessages((prev) => prev.map((m) => m._optimistic ? saved : m));
    } catch {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => !m._optimistic));
    }
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
              const mine = (m.sender?._id || m.sender) === user._id;
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
            <input className="chat-input" placeholder="Type a message..."
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey} maxLength={500} />
            <button className="chat-send" onClick={handleSend} disabled={sending || !input.trim()}>
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}