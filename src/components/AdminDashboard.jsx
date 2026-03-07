import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import {
  getAdminRecords, getUsers, deleteUser, updateUserRole,
  exportRecordsExcel, exportUsersExcel,
  getAdminConversations, getMessages, sendMessage,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

const ROLES = ["Field Volunteer", "Health Worker", "Program Manager", "Data Analyst", "Administrator"];

const STATUS_COLOR = { active: "#10b981", idle: "#f59e0b", offline: "#6b7280" };
const STATUS_LABEL = { active: "Active", idle: "Idle", offline: "Offline" };

export default function AdminDashboard({ onBack }) {
  const { user, logout } = useAuth();
  const [tab,        setTab]        = useState("records");
  const [records,    setRecords]    = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [exporting,  setExporting]  = useState(false);

  // Chat state
  const [chatOpen,   setChatOpen]   = useState(false);
  const [chatUser,   setChatUser]   = useState(null); // { _id, fullName }
  const [messages,   setMessages]   = useState([]);
  const [chatInput,  setChatInput]  = useState("");
  const [convos,     setConvos]     = useState([]);
  const [sending,    setSending]    = useState(false);
  const bottomRef = useRef(null);

  // Live user statuses
  const [statuses, setStatuses] = useState({});

  // Stable ref so socket callback always sees latest chatUser
  const chatUserRef = useRef(chatUser);
  useEffect(() => { chatUserRef.current = chatUser; }, [chatUser]);

  const { pingUser } = useSocket(user?._id, {
    onMessage: (msg) => {
      const senderId   = msg.sender?._id   || msg.sender;
      const receiverId = msg.receiver?._id || msg.receiver;
      const activePeer = chatUserRef.current?._id;
      const myId       = user?._id;

      // Add to messages only if it belongs to the currently open conversation
      const inActiveChat =
        (senderId === activePeer && receiverId === myId) ||
        (senderId === myId       && receiverId === activePeer);

      if (inActiveChat) {
        setMessages((prev) => prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]);
      }

      // Update conversation list unread count
      setConvos((prev) => prev.map((c) =>
        c.user._id === senderId
          ? { ...c, lastMessage: msg, unread: activePeer === senderId ? 0 : c.unread + 1 }
          : c
      ));
    },
    onStatus: ({ userId, status }) => {
      setStatuses((prev) => ({ ...prev, [userId]: status }));
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status } : u));
    },
  });

  useEffect(() => { loadData(); }, [tab]);

  // Load conversations when on users tab
  useEffect(() => {
    if (tab === "users") loadConversations();
  }, [tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      if (tab === "records") {
        setRecords(await getAdminRecords(user.token));
      } else {
        const data = await getUsers(user.token);
        setUsers(data);
        const s = {};
        data.forEach((u) => { s[u._id] = u.status || "offline"; });
        setStatuses(s);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const loadConversations = async () => {
    try {
      const data = await getAdminConversations(user.token);
      setConvos(data);
    } catch {}
  };

  const openChat = async (u) => {
    setChatUser(u);
    setChatOpen(true);
    try {
      const msgs = await getMessages(user.token, u._id);
      setMessages(msgs);
      // Mark as read in convos
      setConvos((prev) => prev.map((c) => c.user._id === u._id ? { ...c, unread: 0 } : c));
    } catch {}
  };

  const handleSend = async () => {
    if (!chatInput.trim() || !chatUser) return;
    const content = chatInput.trim();
    setChatInput("");
    setSending(true);
    try {
      // Optimistic: admin sees message immediately
      const optimistic = {
        _id:        "opt-" + Date.now(),
        sender:     { _id: user._id },
        receiver:   { _id: chatUser._id },
        content,
        read:       false,
        createdAt:  new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      const saved = await sendMessage(user.token, { receiverId: chatUser._id, content });
      setMessages((prev) => prev.map((m) => m._optimistic ? saved : m));
    } catch {
      setMessages((prev) => prev.filter((m) => !m._optimistic));
    }
    setSending(false);
  };

  const handlePing = (u) => {
    pingUser(u._id, user.fullName);
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(user.token, id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(user.token, id, role);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
    } catch (err) { alert(err.message); }
  };

  const handleExport = async () => {
    setExporting(true);
    try { await exportRecordsExcel(user.token); }
    finally { setExporting(false); }
  };

  const handleExportUsers = async () => {
    setExporting(true);
    try { await exportUsersExcel(user.token); }
    finally { setExporting(false); }
  };

  const handleLogout = () => { logout(); window.location.href = "/"; };

  const filteredRecords = records.filter((r) => {
    const q = search.toLowerCase();
    const addr = r.address?.full || r.address || "";
    return r.firstName?.toLowerCase().includes(q) || r.lastName?.toLowerCase().includes(q)
      || addr.toLowerCase().includes(q) || r.submittedBy?.fullName?.toLowerCase().includes(q);
  });

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const bmiColor = (bmi) => {
    if (!bmi) return "var(--text-3)";
    const b = parseFloat(bmi);
    if (b < 18.5) return "#f59e0b";
    if (b < 25)   return "#10b981";
    if (b < 30)   return "#f59e0b";
    return "#ef4444";
  };

  // Status counts
  const activeCt  = Object.values(statuses).filter((s) => s === "active").length;
  const idleCt    = Object.values(statuses).filter((s) => s === "idle").length;
  const offlineCt = Object.values(statuses).filter((s) => s === "offline").length;

  return (
    <div className="admin-page">
      <div className="admin-bg-grid" />

      {/* ── Header ── */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="landing-logo-icon"><Icon name="shield-plus" size={18} /></div>
          <div className="admin-title-block">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-sub">Logged in as <strong>{user.fullName}</strong> · Administrator</p>
          </div>
        </div>
        <div className="admin-header-right">
          <div className="user-chip">
            <div className="user-chip-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
            <div className="user-chip-info">
              <span className="user-chip-name">{user.fullName}</span>
              <span className="user-chip-role">Administrator</span>
            </div>
            <button className="user-chip-logout" onClick={handleLogout} title="Logout">
              <Icon name="log-out" size={15} />
            </button>
          </div>
          {tab === "records" && (
            <button className="btn btn-success" onClick={handleExport} disabled={exporting || records.length === 0}>
              {exporting ? <><span className="login-spinner" />Exporting...</> : <><Icon name="file-text" size={16} />Export Records</>}
            </button>
          )}
          {tab === "users" && (
            <button className="btn btn-secondary" onClick={handleExportUsers} disabled={exporting || users.length === 0}>
              {exporting ? <><span className="login-spinner" />Exporting...</> : <><Icon name="file-text" size={16} />Export Users</>}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="admin-stats-bar">
        <div className="admin-stat">
          <span className="admin-stat-val">{records.length}</span>
          <span className="admin-stat-label">Total Records</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-val">{users.length}</span>
          <span className="admin-stat-label">Registered Users</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-val" style={{ color: "#10b981" }}>{activeCt}</span>
          <span className="admin-stat-label">🟢 Active</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-val" style={{ color: "#f59e0b" }}>{idleCt}</span>
          <span className="admin-stat-label">🟡 Idle</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-val" style={{ color: "#6b7280" }}>{offlineCt}</span>
          <span className="admin-stat-label">⚫ Offline</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-val">
            {records.filter((r) => {
              const d = new Date(r.createdAt); const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </span>
          <span className="admin-stat-label">This Month</span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-toolbar">
        <div className="admin-tabs">
          <button className={`admin-tab${tab === "records" ? " active" : ""}`} onClick={() => { setTab("records"); setSearch(""); }}>
            <Icon name="clipboard-list" size={15} />Beneficiary Records
          </button>
          <button className={`admin-tab${tab === "users" ? " active" : ""}`} onClick={() => { setTab("users"); setSearch(""); }}>
            <Icon name="users" size={15} />Manage Users
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <div className="input-wrapper" style={{ maxWidth: 340, width: "100%" }}>
            <Icon name="search" size={16} className="input-icon" />
            <input type="text"
              placeholder={tab === "records" ? "Search by name, address, volunteer…" : "Search by name or email…"}
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", background: "var(--input)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--text)", fontSize: "0.875rem", fontFamily: "inherit" }}
            />
          </div>
          <button className="btn btn-secondary" onClick={loadData} style={{ flexShrink: 0 }}>
            <Icon name="refresh-cw" size={15} />Refresh
          </button>
        </div>
      </div>

      {error  && <div className="submit-error"><Icon name="x" size={14} />{error}</div>}
      {loading && <div className="admin-loading"><span className="login-spinner" style={{ width: 20, height: 20 }} />Loading...</div>}

      {/* ── Records table ── */}
      {!loading && tab === "records" && (
        <div className="admin-table-wrap">
          {filteredRecords.length === 0
            ? <div className="admin-loading"><Icon name="clipboard-list" size={32} />No records found</div>
            : (
              <table className="admin-table">
                <thead><tr>
                  <th>Name</th><th>Gender</th><th>Age</th><th>Phone</th><th>Address</th>
                  <th>BP</th><th>Blood Sugar</th><th>BMI</th><th>Conditions</th><th>Volunteer</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {filteredRecords.map((r) => (
                    <tr key={r._id}>
                      <td className="td-name">{r.firstName} {r.lastName}</td>
                      <td className="td-muted" style={{ textTransform: "capitalize" }}>{r.gender || "—"}</td>
                      <td className="td-muted">{r.age || "—"}</td>
                      <td className="td-muted">{r.phone || "—"}</td>
                      <td className="td-muted">{r.address?.full || r.address || "—"}</td>
                      <td className="td-muted">{r.bloodPressureSystolic && r.bloodPressureDiastolic ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}` : "—"}</td>
                      <td className="td-muted">{r.bloodSugar ? `${r.bloodSugar} mg/dL` : "—"}</td>
                      <td>{r.bmi ? <span style={{ color: bmiColor(r.bmi), fontWeight: 700 }}>{r.bmi}</span> : "—"}</td>
                      <td>{r.conditions?.length ? r.conditions.map((c) => <span key={c} className="tag" style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem", marginRight: 2 }}>{c}</span>) : "—"}</td>
                      <td className="td-muted">{r.submittedBy?.fullName || r.volunteerName || "—"}</td>
                      <td className="td-muted" style={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>{new Date(r.submittedAt || r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      )}

      {/* ── Users table ── */}
      {!loading && tab === "users" && (
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
          {/* Users table */}
          <div className="admin-table-wrap" style={{ flex: 1 }}>
            {filteredUsers.length === 0
              ? <div className="admin-loading"><Icon name="users" size={32} />No users found</div>
              : (
                <table className="admin-table">
                  <thead><tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Seen</th><th>Joined</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const st = statuses[u._id] || u.status || "offline";
                      const convo = convos.find((c) => c.user._id === u._id);
                      return (
                        <tr key={u._id} style={{ cursor: "pointer" }}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ position: "relative" }}>
                                <div className="user-chip-avatar" style={{ width: 28, height: 28, fontSize: "0.72rem" }}>
                                  {u.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[st], border: "1.5px solid var(--card)" }} />
                              </div>
                              <span className="td-name">{u.fullName}</span>
                              {convo?.unread > 0 && (
                                <span style={{ background: "#ef4444", color: "white", borderRadius: "999px", fontSize: "0.62rem", fontWeight: 800, padding: "0.1rem 0.4rem" }}>
                                  {convo.unread}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="td-muted">{u.email}</td>
                          <td>
                            <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="role-select" disabled={u._id === user._id}>
                              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: STATUS_COLOR[st], fontWeight: 600 }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLOR[st], display: "inline-block" }} />
                              {STATUS_LABEL[st]}
                            </span>
                          </td>
                          <td className="td-muted" style={{ fontSize: "0.75rem" }}>
                            {u.lastSeen ? new Date(u.lastSeen).toLocaleString() : "—"}
                          </td>
                          <td className="td-muted" style={{ fontSize: "0.78rem" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.35rem" }}>
                              <button className="icon-btn green" onClick={() => openChat(u)} title="Chat">
                                <Icon name="message-circle" size={14} />
                              </button>
                              <button className="icon-btn" onClick={() => handlePing(u)} title="Ping user"
                                style={{ color: "#f59e0b" }}>
                                <Icon name="bell" size={14} />
                              </button>
                              {u._id !== user._id && (
                                <button className="icon-btn red" onClick={() => handleDeleteUser(u._id)} title="Delete user">
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

          {/* Chat panel */}
          {chatOpen && chatUser && (
            <div className="admin-chat-panel">
              <div className="admin-chat-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div className="user-chip-avatar" style={{ width: 30, height: 30, fontSize: "0.75rem" }}>
                    {chatUser.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{chatUser.fullName}</div>
                    <div style={{ fontSize: "0.7rem", color: STATUS_COLOR[statuses[chatUser._id] || "offline"] }}>
                      {STATUS_LABEL[statuses[chatUser._id] || "offline"]}
                    </div>
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setChatOpen(false)}>
                  <Icon name="x" size={14} />
                </button>
              </div>

              <div className="admin-chat-messages">
                {messages.length === 0 && (
                  <div className="chat-empty">
                    <Icon name="message-circle" size={24} />
                    <p>No messages yet</p>
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
                <input className="chat-input" placeholder="Type a message..."
                  value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  maxLength={500} />
                <button className="chat-send" onClick={handleSend} disabled={sending || !chatInput.trim()}>
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