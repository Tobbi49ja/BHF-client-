import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";
import {
  getAdminRecords, getUsers, deleteUser, updateUserRole,
  exportRecordsExcel, exportUsersExcel,
  getAdminConversations, getMessages, sendMessage, clearChat,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

const ROLES = ["Field Volunteer", "Health Worker", "Program Manager", "Data Analyst", "Administrator"];

// Status colour + label maps
const SC = { active: "#10b981", idle: "#f59e0b", offline: "#6b7280" };
const SL = { active: "Active",  idle: "Idle",    offline: "Offline"  };

// Sort priority: active first, then idle, then offline
const STATUS_ORDER = { active: 0, idle: 1, offline: 2 };

// ─────────────────────────────────────────────────────────────
// Draggable hook for the admin chat panel
// ─────────────────────────────────────────────────────────────
function useDraggablePanel() {
  // pos is a pixel offset from the panel's natural CSS position
  const [pos,     setPos]     = useState({ x: 0, y: 0 });
  const [isDrag,  setIsDrag]  = useState(false);
  const dragging = useRef(false);
  const origin   = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });

  const onMouseDown = useCallback((e) => {
    if (e.target.closest("button")) return;
    dragging.current = true;
    setIsDrag(true);
    origin.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({
        x: origin.current.wx + (e.clientX - origin.current.mx),
        y: origin.current.wy + (e.clientY - origin.current.my),
      });
    };
    const onUp = () => { dragging.current = false; setIsDrag(false); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return { pos, isDrag, onMouseDown, resetPos: () => setPos({ x: 0, y: 0 }) };
}

// ─────────────────────────────────────────────────────────────
// AdminDashboard
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [tab,       setTab]     = useState("records");
  const [records,   setRecords] = useState([]);
  const [users,     setUsers]   = useState([]);
  const [loading,   setLoading] = useState(true);
  const [error,     setError]   = useState("");
  const [search,    setSearch]  = useState("");
  const [exporting, setExport]  = useState(false);

  // Live status map: userId → "active"|"idle"|"offline"
  const [statuses, setStatuses] = useState({});

  // Unread badge map: userId → count
  const [unreadMap, setUnread] = useState({});
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  // Chat state
  const [chatUser,  setChatUser] = useState(null);
  const [messages,  setMessages] = useState([]);
  const [chatInput, setChatIn]   = useState("");
  const [sending,   setSending]  = useState(false);
  const [clearing,  setClearing] = useState(false);

  const bottomRef  = useRef(null);
  const sendingRef = useRef(false);

  // Stable refs for socket callbacks
  const chatUserRef = useRef(null);
  const userIdRef   = useRef(null);
  useEffect(() => { chatUserRef.current = chatUser; }, [chatUser]);
  useEffect(() => { userIdRef.current   = user?._id; }, [user]);

  // Draggable chat panel
  const { pos: panelPos, isDrag, onMouseDown: onPanelDrag, resetPos } = useDraggablePanel();

  // ── Socket ───────────────────────────────────────────────
  const { pingUser } = useSocket(user?._id, {

    onMessage: (msg) => {
      const senderId   = String(msg.sender?._id   || msg.sender   || "");
      const receiverId = String(msg.receiver?._id || msg.receiver || "");
      const myId       = String(userIdRef.current || "");
      const peer       = String(chatUserRef.current?._id || "");

      if (senderId !== myId && receiverId !== myId) return;

      const otherId = senderId === myId ? receiverId : senderId;

      if (otherId === peer) {
        // Message belongs to the currently open chat panel
        setMessages((prev) => {
          if (msg._opt) return prev;

          // Replace optimistic bubble
          const optIdx = prev.findIndex(
            (m) => m._opt &&
              String(m.sender?._id || m.sender) === myId &&
              m.content === msg.content
          );
          if (optIdx !== -1) {
            const next = [...prev];
            next[optIdx] = msg;
            return next;
          }
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      } else if (senderId !== myId) {
        // Message from a different user — bump their red dot
        setUnread((prev) => ({ ...prev, [otherId]: (prev[otherId] || 0) + 1 }));
      }
    },

    onStatus: ({ userId, status }) => {
      const uid = String(userId);
      setStatuses((p) => ({ ...p, [uid]: status }));
      setUsers((p) =>
        p.map((u) => String(u._id) === uid ? { ...u, status } : u)
      );
    },

    // Admin's own chat panel clears when the backend confirms deletion
    onChatCleared: ({ forUserId } = {}) => {
      if (!forUserId) return;
      const uid = String(forUserId);
      if (uid === String(chatUserRef.current?._id)) {
        setMessages([]);
      }
      setUnread((p) => { const n = { ...p }; delete n[uid]; return n; });
    },

    // When a user opens our conversation, mark our sent messages as read ✓✓
    onMessagesRead: ({ byUserId }) => {
      if (!byUserId) return;
      const uid = String(byUserId);
      if (uid !== String(chatUserRef.current?._id)) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m.sender?._id || m.sender) === String(userIdRef.current)
            ? { ...m, read: true }
            : m
        )
      );
    },
  });

  // ── Load data ────────────────────────────────────────────
  useEffect(() => { loadData(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      if (tab === "records") {
        setRecords(await getAdminRecords(user.token));
      } else {
        const [userData, convos] = await Promise.all([
          getUsers(user.token),
          getAdminConversations(user.token),
        ]);
        setUsers(userData);

        // Seed status map from DB values
        const s = {};
        userData.forEach((u) => { s[String(u._id)] = u.status || "offline"; });
        setStatuses(s);

        // Seed unread map from conversation counts
        const map = {};
        convos.forEach((c) => { if (c.unread > 0) map[String(c.user._id)] = c.unread; });
        setUnread(map);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Open chat ────────────────────────────────────────────
  const openChat = async (u) => {
    chatUserRef.current = u; // sync ref immediately
    setChatUser(u);
    setMessages([]);
    resetPos();
    setUnread((p) => { const n = { ...p }; delete n[String(u._id)]; return n; });

    try {
      const fetched = await getMessages(user.token, u._id);
      setMessages((prev) => {
        const ids   = new Set(fetched.map((m) => m._id));
        // Keep messages not yet in the fetched list (in-flight or socket-received)
        const extra = prev.filter((m) => !ids.has(m._id));
        return [...fetched, ...extra].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    } catch { /* non-fatal */ }
  };

  const closeChat = () => {
    chatUserRef.current = null;
    setChatUser(null);
    setMessages([]);
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ─────────────────────────────────────────────────
  const handleSend = async () => {
    if (!chatInput.trim() || !chatUser || sendingRef.current) return;
    sendingRef.current = true;
    const content = chatInput.trim();
    setChatIn("");
    setSending(true);

    const optId = `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const opt = {
      _id: optId,
      sender:   { _id: user._id },
      receiver: { _id: chatUser._id },
      content,
      read: false,
      createdAt: new Date().toISOString(),
      _opt: true,
    };
    setMessages((p) => [...p, opt]);

    try {
      const saved = await sendMessage(user.token, { receiverId: chatUser._id, content });
      setMessages((p) => p.map((m) => (m._id === optId ? saved : m)));
    } catch {
      setMessages((p) => p.filter((m) => m._id !== optId));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  // ── Ping ─────────────────────────────────────────────────
  const handlePing = (u) => pingUser(u._id, user.fullName);

  // ── Clear chat ───────────────────────────────────────────
  const handleClear = async () => {
    if (!chatUser || !confirm(`Clear all messages with ${chatUser.fullName}?`)) return;
    setClearing(true);
    try {
      await clearChat(user.token, chatUser._id);
      setMessages([]);
      setUnread((p) => { const n = { ...p }; delete n[String(chatUser._id)]; return n; });
    } catch (e) {
      alert(e.message);
    } finally {
      setClearing(false);
    }
  };

  // ── User CRUD ────────────────────────────────────────────
  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(user.token, id);
      setUsers((p) => p.filter((u) => u._id !== id));
      if (chatUser?._id === id) closeChat();
    } catch (e) { alert(e.message); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(user.token, id, role);
      setUsers((p) => p.map((u) => u._id === id ? { ...u, role } : u));
    } catch (e) { alert(e.message); }
  };

  // ── Tick helper ──────────────────────────────────────────
  const ticks = (m, isMine) => {
    if (!isMine) return null;
    if (m._opt)  return <span className="chat-ticks pending">···</span>;
    if (m.read)  return <span className="chat-ticks read">✓✓</span>;
    return <span className="chat-ticks delivered">✓</span>;
  };

  // ── Filtered + sorted user list ──────────────────────────
  const fRec = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.firstName?.toLowerCase().includes(q) ||
      r.lastName?.toLowerCase().includes(q)  ||
      (r.address?.full || "").toLowerCase().includes(q)
    );
  });

  const fUsr = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Primary: status order (active → idle → offline)
      const sa = STATUS_ORDER[statuses[String(a._id)] || a.status || "offline"] ?? 2;
      const sb = STATUS_ORDER[statuses[String(b._id)] || b.status || "offline"] ?? 2;
      if (sa !== sb) return sa - sb;
      // Secondary: users with unread messages float above same-status peers
      return (unreadMap[String(b._id)] || 0) - (unreadMap[String(a._id)] || 0);
    });

  const bmiColor = (v) => {
    if (!v) return "var(--text-3)";
    const b = parseFloat(v);
    return b < 18.5 ? "#f59e0b" : b < 25 ? "#10b981" : b < 30 ? "#f59e0b" : "#ef4444";
  };

  const thisMo = records.filter((r) => {
    const d = new Date(r.createdAt), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  const actCt  = Object.values(statuses).filter((s) => s === "active").length;
  const idleCt = Object.values(statuses).filter((s) => s === "idle").length;
  const offCt  = Object.values(statuses).filter((s) => s === "offline").length;

  // ── JSX ──────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <div className="admin-bg-grid" />

      {/* ── Header ── */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="landing-logo-icon"><Icon name="shield-plus" size={18} /></div>
          <div className="admin-title-block">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-sub">
              Logged in as <strong>{user.fullName}</strong> · Administrator
            </p>
          </div>
        </div>
        <div className="admin-header-right">
          <div className="user-chip">
            <div className="user-chip-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
            <div className="user-chip-info">
              <span className="user-chip-name">{user.fullName}</span>
              <span className="user-chip-role">Administrator</span>
            </div>
            <button
              className="user-chip-logout"
              onClick={() => { logout(); window.location.href = "/"; }}
              title="Logout"
            >
              <Icon name="log-out" size={15} />
            </button>
          </div>
          {tab === "records" && (
            <button className="btn btn-success"
              disabled={exporting || records.length === 0}
              onClick={() => { setExport(true); exportRecordsExcel(user.token).finally(() => setExport(false)); }}>
              {exporting ? <><span className="login-spinner" />Exporting...</> : <><Icon name="file-text" size={16} />Export Records</>}
            </button>
          )}
          {tab === "users" && (
            <button className="btn btn-secondary"
              disabled={exporting || users.length === 0}
              onClick={() => { setExport(true); exportUsersExcel(user.token).finally(() => setExport(false)); }}>
              {exporting ? <><span className="login-spinner" />Exporting...</> : <><Icon name="file-text" size={16} />Export Users</>}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="admin-stats-bar">
        {[
          { val: records.length, label: "Total Records"    },
          { val: users.length,   label: "Registered Users" },
          { val: actCt,          label: "🟢 Active",  color: "#10b981" },
          { val: idleCt,         label: "🟡 Idle",    color: "#f59e0b" },
          { val: offCt,          label: "⚫ Offline", color: "#6b7280" },
          { val: thisMo,         label: "This Month"       },
        ].map(({ val, label, color }) => (
          <div className="admin-stat" key={label}>
            <span className="admin-stat-val" style={color ? { color } : {}}>{val}</span>
            <span className="admin-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-toolbar">
        <div className="admin-tabs">
          <button className={`admin-tab${tab === "records" ? " active" : ""}`}
            onClick={() => { setTab("records"); setSearch(""); }}>
            <Icon name="clipboard-list" size={15} />Beneficiary Records
          </button>
          <button className={`admin-tab${tab === "users" ? " active" : ""}`}
            style={{ position: "relative" }}
            onClick={() => { setTab("users"); setSearch(""); }}>
            <Icon name="users" size={15} />Manage Users
            {totalUnread > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5,
                background: "#ef4444", color: "white", borderRadius: "999px",
                fontSize: "0.6rem", fontWeight: 800, padding: "0.1rem 0.35rem",
                border: "2px solid var(--bg)", minWidth: 16, textAlign: "center",
              }}>
                {totalUnread}
              </span>
            )}
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <div className="input-wrapper" style={{ maxWidth: 340, width: "100%" }}>
            <Icon name="search" size={16} className="input-icon" />
            <input
              type="text"
              placeholder={tab === "records" ? "Search records…" : "Search users…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem",
                background: "var(--input)", border: "1px solid var(--border)",
                borderRadius: "0.5rem", color: "var(--text)",
                fontSize: "0.875rem", fontFamily: "inherit",
              }}
            />
          </div>
          <button className="btn btn-secondary" onClick={loadData} style={{ flexShrink: 0 }}>
            <Icon name="refresh-cw" size={15} />Refresh
          </button>
        </div>
      </div>

      {error   && <div className="submit-error"><Icon name="x" size={14} />{error}</div>}
      {loading && (
        <div className="admin-loading">
          <span className="login-spinner" style={{ width: 20, height: 20 }} />Loading...
        </div>
      )}

      {/* ── Records table ── */}
      {!loading && tab === "records" && (
        <div className="admin-table-wrap">
          {fRec.length === 0
            ? <div className="admin-loading"><Icon name="clipboard-list" size={32} />No records found</div>
            : (
              <table className="admin-table">
                <thead><tr>
                  <th>Name</th><th>Gender</th><th>Age</th><th>Phone</th><th>Address</th>
                  <th>BP</th><th>Blood Sugar</th><th>BMI</th><th>Conditions</th><th>Volunteer</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {fRec.map((r) => (
                    <tr key={r._id}>
                      <td className="td-name">{r.firstName} {r.lastName}</td>
                      <td className="td-muted" style={{ textTransform: "capitalize" }}>{r.gender || "—"}</td>
                      <td className="td-muted">{r.age || "—"}</td>
                      <td className="td-muted">{r.phone || "—"}</td>
                      <td className="td-muted">{r.address?.full || r.address || "—"}</td>
                      <td className="td-muted">
                        {r.bloodPressureSystolic && r.bloodPressureDiastolic
                          ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}` : "—"}
                      </td>
                      <td className="td-muted">{r.bloodSugar ? `${r.bloodSugar} mg/dL` : "—"}</td>
                      <td>{r.bmi ? <span style={{ color: bmiColor(r.bmi), fontWeight: 700 }}>{r.bmi}</span> : "—"}</td>
                      <td>
                        {r.conditions?.length
                          ? r.conditions.map((c) => (
                            <span key={c} className="tag" style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem", marginRight: 2 }}>{c}</span>
                          )) : "—"}
                      </td>
                      <td className="td-muted">{r.submittedBy?.fullName || r.volunteerName || "—"}</td>
                      <td className="td-muted" style={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                        {new Date(r.submittedAt || r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      )}

      {/* ── Users tab ── */}
      {!loading && tab === "users" && (
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", position: "relative" }}>

          {/* Users table */}
          <div className="admin-table-wrap" style={{ flex: 1, minWidth: 0 }}>
            {fUsr.length === 0
              ? <div className="admin-loading"><Icon name="users" size={32} />No users found</div>
              : (
                <table className="admin-table">
                  <thead><tr>
                    <th>Name</th><th>Email</th><th>Role</th>
                    <th>Status</th><th>Last Seen</th><th>Joined</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {fUsr.map((u) => {
                      const uid    = String(u._id);
                      const st     = statuses[uid] || u.status || "offline";
                      const unread = unreadMap[uid] || 0;
                      const active = chatUser?._id === u._id;

                      return (
                        <tr key={u._id}
                          style={{ background: active ? "rgba(37,99,235,0.08)" : undefined }}>

                          {/* Name + status dot + unread badge */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ position: "relative", flexShrink: 0 }}>
                                <div className="user-chip-avatar"
                                  style={{ width: 28, height: 28, fontSize: "0.72rem" }}>
                                  {u.fullName?.charAt(0).toUpperCase()}
                                </div>
                                {/* Live status dot */}
                                <span style={{
                                  position: "absolute", bottom: 0, right: 0,
                                  width: 8, height: 8, borderRadius: "50%",
                                  background: SC[st],
                                  border: "1.5px solid var(--card)",
                                  transition: "background 0.3s ease",
                                }} />
                              </div>
                              <span className="td-name">{u.fullName}</span>
                              {/* Red dot badge for unread messages */}
                              {unread > 0 && (
                                <span style={{
                                  background: "#ef4444", color: "white",
                                  borderRadius: "999px", fontSize: "0.62rem",
                                  fontWeight: 800, padding: "0.1rem 0.45rem",
                                  animation: "pulse 1.4s ease-in-out infinite",
                                  flexShrink: 0,
                                }}>
                                  {unread} new
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="td-muted">{u.email}</td>

                          {/* Role selector */}
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="role-select"
                              disabled={u._id === user._id}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>

                          {/* Live status label */}
                          <td>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.35rem",
                              fontSize: "0.78rem", color: SC[st], fontWeight: 600,
                            }}>
                              <span style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: SC[st], display: "inline-block",
                                // Pulse animation only for active users
                                animation: st === "active"
                                  ? "pulse 2s ease-in-out infinite" : "none",
                              }} />
                              {SL[st]}
                            </span>
                          </td>

                          <td className="td-muted" style={{ fontSize: "0.75rem" }}>
                            {u.lastSeen ? new Date(u.lastSeen).toLocaleString() : "—"}
                          </td>
                          <td className="td-muted" style={{ fontSize: "0.78rem" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          {/* Action buttons */}
                          <td>
                            <div style={{ display: "flex", gap: "0.35rem" }}>
                              {/* Chat — red when unread */}
                              <button className="icon-btn" title="Open chat"
                                onClick={() => openChat(u)}
                                style={{ color: unread > 0 ? "#ef4444" : "#10b981", position: "relative" }}>
                                <Icon name="message-circle" size={14} />
                                {unread > 0 && (
                                  <span style={{
                                    position: "absolute", top: -3, right: -3,
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: "#ef4444",
                                    border: "1px solid var(--card)",
                                  }} />
                                )}
                              </button>
                              {/* Ping */}
                              <button className="icon-btn" title="Ping user"
                                style={{ color: "#f59e0b" }} onClick={() => handlePing(u)}>
                                <Icon name="bell" size={14} />
                              </button>
                              {u._id !== user._id && (
                                <button className="icon-btn red" title="Delete user"
                                  onClick={() => handleDeleteUser(u._id)}>
                                  <Icon name="trash-2" size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
          </div>

          {/* ── Draggable chat panel ── */}
          {chatUser && (
            <div
              className="admin-chat-panel"
              style={{
                transform: `translate(${panelPos.x}px, ${panelPos.y}px)`,
                transition: isDrag ? "none" : "transform 0.1s ease",
                cursor: isDrag ? "grabbing" : "default",
                // Make it float above the table when dragged far
                zIndex: isDrag ? 50 : 1,
              }}
            >
              {/* Draggable header */}
              <div
                className="admin-chat-header"
                onMouseDown={onPanelDrag}
                style={{ cursor: isDrag ? "grabbing" : "grab", userSelect: "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 0 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div className="user-chip-avatar" style={{ width: 32, height: 32, fontSize: "0.78rem" }}>
                      {chatUser.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 9, height: 9, borderRadius: "50%",
                      background: SC[statuses[String(chatUser._id)] || "offline"],
                      border: "2px solid var(--card)",
                      transition: "background 0.3s ease",
                    }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: "0.875rem",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {chatUser.fullName}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: SC[statuses[String(chatUser._id)] || "offline"] }}>
                      {SL[statuses[String(chatUser._id)] || "offline"]} · {chatUser.role}
                    </div>
                  </div>
                </div>
                {/* Panel controls */}
                <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.58rem", color: "var(--text-3)", alignSelf: "center", marginRight: "0.15rem" }}>drag</span>
                  <button className="icon-btn" title="Ping user"
                    style={{ color: "#f59e0b" }} onClick={() => handlePing(chatUser)}>
                    <Icon name="bell" size={14} />
                  </button>
                  <button className="icon-btn red" title="Clear all messages"
                    disabled={clearing || messages.length === 0}
                    style={{ opacity: messages.length === 0 ? 0.4 : 1 }}
                    onClick={handleClear}>
                    {clearing
                      ? <span className="login-spinner" style={{ width: 12, height: 12 }} />
                      : <Icon name="trash-2" size={14} />}
                  </button>
                  <button className="icon-btn" title="Close" onClick={closeChat}>
                    <Icon name="x" size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="admin-chat-messages">
                {messages.length === 0 && (
                  <div className="chat-empty">
                    <Icon name="message-circle" size={24} />
                    <p>No messages yet</p>
                  </div>
                )}
                {messages.map((m) => {
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
                  placeholder={`Message ${chatUser.fullName}…`}
                  value={chatInput}
                  onChange={(e) => setChatIn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  maxLength={500}
                  autoFocus
                />
                <button className="chat-send" onClick={handleSend}
                  disabled={sending || !chatInput.trim()}>
                  <Icon name="send" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}