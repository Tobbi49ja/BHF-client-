import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";
import { getMessages, sendMessage, getAdminId } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

// ─────────────────────────────────────────────────────────────
// Draggable hook — lets the chat window be repositioned
// ─────────────────────────────────────────────────────────────
function useDraggable(initialPos) {
  const [pos, setPos]       = useState(initialPos);
  const dragging            = useRef(false);
  const origin              = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });
  const ref                 = useRef(null);

  const onMouseDown = useCallback((e) => {
    // Only drag from the header bar, ignore buttons inside it
    if (e.target.closest("button")) return;
    dragging.current = true;
    origin.current = {
      mx: e.clientX,
      my: e.clientY,
      wx: pos.x,
      wy: pos.y,
    };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - origin.current.mx;
      const dy = e.clientY - origin.current.my;
      setPos({ x: origin.current.wx + dx, y: origin.current.wy + dy });
    };
    const onMouseUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, []);

  return { pos, ref, onMouseDown };
}

// ─────────────────────────────────────────────────────────────
// Inner component — only mounts for non-admin users
// ─────────────────────────────────────────────────────────────
function UserChat({ user }) {
  const [open,    setOpen]  = useState(false);
  const [msgs,    setMsgs]  = useState([]);
  const [input,   setInput] = useState("");
  const [adminId, setAdmin] = useState(null);
  const [unread,  setUnread]= useState(0);
  const [ping,    setPing]  = useState(null);

  const sendingRef = useRef(false);
  const bottomRef  = useRef(null);
  const openRef    = useRef(false);
  const myIdRef    = useRef(String(user._id));
  const adminIdRef = useRef(null);

  useEffect(() => { openRef.current    = open;             }, [open]);
  useEffect(() => { myIdRef.current    = String(user._id); }, [user._id]);
  useEffect(() => { adminIdRef.current = adminId;          }, [adminId]);

  // Draggable — default bottom-right, offset from edge
  const { pos, onMouseDown: onDragHeader } = useDraggable({ x: 0, y: 0 });

  // ── Socket ───────────────────────────────────────────────
  useSocket(user._id, {

    onMessage: (msg) => {
      const sid = String(msg.sender?._id   || msg.sender   || "");
      const rid = String(msg.receiver?._id || msg.receiver || "");
      const me  = myIdRef.current;

      // Drop anything that doesn't involve this user
      if (sid !== me && rid !== me) return;

      setMsgs((prev) => {
        if (msg._opt) return prev; // never accept _opt echoes

        // Replace matching optimistic bubble (same sender + content)
        const optIdx = prev.findIndex(
          (m) => m._opt &&
            String(m.sender?._id || m.sender) === me &&
            m.content === msg.content
        );
        if (optIdx !== -1) {
          const next = [...prev];
          next[optIdx] = msg;
          return next;
        }
        // Deduplicate by _id
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Bump badge only when window is closed and message is from other party
      if (!openRef.current && sid !== me) setUnread((u) => u + 1);
    },

    // When admin opens OUR conversation, mark all our sent messages as read (✓✓)
    onMessagesRead: ({ byUserId }) => {
      if (!byUserId) return;
      setMsgs((prev) =>
        prev.map((m) =>
          String(m.sender?._id || m.sender) === myIdRef.current ? { ...m, read: true } : m
        )
      );
    },

    onPinged: (data) => {
      setPing(data);
      setTimeout(() => setPing(null), 6000);
    },

    onChatCleared: () => {
      setMsgs([]);
      setUnread(0);
    },
  });

  // ── Load admin ID once ───────────────────────────────────
  useEffect(() => {
    getAdminId(user.token).then((a) => setAdmin(a._id)).catch(() => {});
  }, [user._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch history when window opens ─────────────────────
  useEffect(() => {
    if (!open || !adminId) return;
    setUnread(0);
    getMessages(user.token, adminId)
      .then((fetched) => {
        setMsgs((prev) => {
          const ids = new Set(fetched.map((m) => m._id));
          // Keep everything not yet confirmed by the server (optimistic OR
          // socket-received messages that arrived before the fetch completed)
          const extra = prev.filter((m) => !ids.has(m._id));
          return [...fetched, ...extra].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
      })
      .catch(() => {});
  }, [open, adminId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // ── Send ─────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !adminId || sendingRef.current) return;
    sendingRef.current = true;
    const content = input.trim();
    setInput("");

    const optId = `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const opt = {
      _id: optId,
      sender:   { _id: user._id },
      receiver: { _id: adminId },
      content,
      read: false,
      createdAt: new Date().toISOString(),
      _opt: true,
    };
    setMsgs((p) => [...p, opt]);

    try {
      const saved = await sendMessage(user.token, { receiverId: adminId, content });
      setMsgs((p) => p.map((m) => (m._id === optId ? saved : m)));
    } catch {
      setMsgs((p) => p.filter((m) => m._id !== optId));
    } finally {
      sendingRef.current = false;
    }
  };

  // ── Tick display helper ───────────────────────────────────
  const ticks = (m, isMine) => {
    if (!isMine) return null;
    if (m._opt)  return <span className="chat-ticks pending">···</span>;
    if (m.read)  return <span className="chat-ticks read">✓✓</span>;
    return <span className="chat-ticks delivered">✓</span>;
  };

  // Window position style: offset from bottom-right corner
  const windowStyle = {
    position: "fixed",
    bottom:   `calc(5.5rem + ${-pos.y}px)`,
    right:    `calc(1.75rem + ${-pos.x}px)`,
    zIndex:   199,
  };

  return (
    <>
      {ping && (
        <div className="ping-popup">
          <Icon name="bell" size={14} />
          <span>{ping.message}</span>
        </div>
      )}

      {/* FAB */}
      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        style={{ position: "fixed", bottom: "1.75rem", right: "1.75rem", zIndex: 200 }}
      >
        <Icon name="message-circle" size={22} />
        {unread > 0 && <span className="chat-fab-badge">{unread}</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window" style={windowStyle}>
          {/* Draggable header */}
          <div
            className="chat-header"
            onMouseDown={onDragHeader}
            style={{ cursor: "grab", userSelect: "none" }}
          >
            <div className="chat-header-info">
              <div className="chat-avatar">A</div>
              <div>
                <div className="chat-header-name">BHF Support</div>
                <div className="chat-header-status">Admin</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.6rem", color: "var(--text-3)", marginRight: "0.25rem" }}>drag to move</span>
              <button className="chat-close" onClick={() => setOpen(false)}>
                <Icon name="x" size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {msgs.length === 0 && (
              <div className="chat-empty">
                <Icon name="message-circle" size={28} />
                <p>Send a message to BHF Support</p>
              </div>
            )}
            {msgs.map((m) => {
              const mine = String(m.sender?._id || m.sender) === String(user._id);
              return (
                <div key={m._id} className={`chat-msg ${mine ? "mine" : "theirs"}`}>
                  <div className="chat-bubble">{m.content}</div>
                  <div className="chat-time">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {ticks(m, mine)}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
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

// ── Outer wrapper ─────────────────────────────────────────────
export default function FloatingChat() {
  const { user } = useAuth();
  if (!user || user.role === "Administrator") return null;
  return <UserChat user={user} />;
}