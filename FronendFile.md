 import { MapPin, ChevronDown, Navigation, Home, Building2, Hash, Globe, Landmark } from 'lucide-react';

export function AddressFields({ address, handlers, derived, errors = {}, disabled = false }) {
  const { states, lgas, cities } = derived;
  const {
    handleStateChange, handleLGAChange, handleCityChange,
    handleStreetChange, handleStreet2Change,
    handleLandmarkChange, handlePostcodeChange,
  } = handlers;

  return (
    <>
      {/* Country – fixed */}
      <div className="input-group">
        <label><Globe size={12} /> Country</label>
        <div className="input-wrapper">
          <Globe className="input-icon" size={16} />
          <input type="text" value="Nigeria" readOnly
            style={{ paddingLeft: "2.75rem", opacity: 0.7, cursor: "default" }} />
        </div>
      </div>

      {/* State */}
      <div className={`input-group ${errors.state ? "has-error" : ""}`}>
        <label htmlFor="addr-state">
          <MapPin size={12} /> State <span style={{ color:"var(--error)" }}>*</span>
        </label>
        <div className="input-wrapper">
          <MapPin className="input-icon" size={16} />
          <select id="addr-state" value={address.state} onChange={handleStateChange} disabled={disabled}>
            <option value="">— Select State —</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="select-arrow" />
        </div>
        {errors.state && <span className="field-error">{errors.state}</span>}
      </div>

      {/* LGA */}
      <div className={`input-group ${errors.lga ? "has-error" : ""}`}>
        <label htmlFor="addr-lga">
          <Navigation size={12} /> Local Government Area <span style={{ color:"var(--error)" }}>*</span>
        </label>
        <div className="input-wrapper">
          <Navigation className="input-icon" size={16} />
          <select id="addr-lga" value={address.lga} onChange={handleLGAChange}
            disabled={disabled || !address.state}>
            <option value="">{!address.state ? "— Select a state first —" : "— Select LGA —"}</option>
            {lgas.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown className="select-arrow" />
        </div>
        {!address.state && <span className="field-hint">Select a state to see its LGAs</span>}
        {errors.lga && <span className="field-error">{errors.lga}</span>}
      </div>

      {/* City / Town within LGA */}
      <div className={`input-group ${errors.city ? "has-error" : ""}`}>
        <label htmlFor="addr-city">
          <Home size={12} /> City / Town <span style={{ color:"var(--error)" }}>*</span>
        </label>
        <div className="input-wrapper">
          <Home className="input-icon" size={16} />
          <select id="addr-city" value={address.city} onChange={handleCityChange}
            disabled={disabled || !address.lga}>
            <option value="">{!address.lga ? "— Select LGA first —" : "— Select City/Town —"}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="select-arrow" />
        </div>
        {!address.lga && <span className="field-hint">Select an LGA to see its cities</span>}
        {errors.city && <span className="field-error">{errors.city}</span>}
      </div>

      {/* Street Address Line 1 */}
      <div className={`input-group full-width ${errors.street ? "has-error" : ""}`}>
        <label htmlFor="addr-street">
          <MapPin size={12} /> Address Line 1 <span style={{ color:"var(--error)" }}>*</span>
        </label>
        <div className="input-wrapper">
          <MapPin className="input-icon" size={16} />
          <input id="addr-street" type="text" value={address.street}
            onChange={handleStreetChange}
            placeholder="e.g. 12 Ahmadu Bello Way"
            disabled={disabled} maxLength={200} />
        </div>
        {errors.street && <span className="field-error">{errors.street}</span>}
      </div>

      {/* Street Address Line 2 */}
      <div className="input-group full-width">
        <label htmlFor="addr-street2">
          <Building2 size={12} /> Address Line 2
          <span style={{ color:"var(--text-3)", fontWeight:400, marginLeft:"0.25rem" }}>(optional)</span>
        </label>
        <div className="input-wrapper">
          <Building2 className="input-icon" size={16} />
          <input id="addr-street2" type="text" value={address.street2}
            onChange={handleStreet2Change}
            placeholder="e.g. Flat 3B, Unity Estate"
            disabled={disabled} maxLength={200} />
        </div>
      </div>

      {/* Postal Code */}
      <div className="input-group">
        <label htmlFor="addr-postcode">
          <Hash size={12} /> Postal Code
          <span style={{ color:"var(--text-3)", fontWeight:400, marginLeft:"0.25rem" }}>(optional)</span>
        </label>
        <div className="input-wrapper">
          <Hash className="input-icon" size={16} />
          <input id="addr-postcode" type="text" value={address.postcode}
            onChange={handlePostcodeChange}
            placeholder="e.g. 100001"
            disabled={disabled} maxLength={10} />
        </div>
      </div>

      {/* Nearest Landmark */}
      <div className="input-group">
        <label htmlFor="addr-landmark">
          <Landmark size={12} /> Nearest Landmark
          <span style={{ color:"var(--text-3)", fontWeight:400, marginLeft:"0.25rem" }}>(optional)</span>
        </label>
        <div className="input-wrapper">
          <Landmark className="input-icon" size={16} />
          <input id="addr-landmark" type="text" value={address.landmark}
            onChange={handleLandmarkChange}
            placeholder="e.g. Opposite Unity Bank"
            disabled={disabled} maxLength={200} />
        </div>
      </div>

      {/* Full Address Preview */}
      {derived.isAddressComplete && (
        <div className="input-group full-width">
          <label><MapPin size={12} /> Address Preview</label>
          <div className="address-preview">
            <MapPin size={14} style={{ flexShrink:0, color:"var(--success)" }} />
            <span>{derived.fullAddress}</span>
          </div>
        </div>
      )}
    </>
  );
}
import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import {
  getAdminRecords, getUsers, deleteUser, updateUserRole,
  exportRecordsExcel, exportUsersExcel,
  getAdminConversations, getMessages, sendMessage, clearChat,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

const ROLES = ["Field Volunteer","Health Worker","Program Manager","Data Analyst","Administrator"];
const SC = { active:"#10b981", idle:"#f59e0b", offline:"#6b7280" };
const SL = { active:"Active",  idle:"Idle",    offline:"Offline"  };

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [tab,       setTab]      = useState("records");
  const [records,   setRecords]  = useState([]);
  const [users,     setUsers]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState("");
  const [search,    setSearch]   = useState("");
  const [exporting, setExport]   = useState(false);
  const [statuses,  setStatuses] = useState({});

  // unreadMap: userId → count  (drives red dots)
  const [unreadMap, setUnread]   = useState({});
  const totalUnread = Object.values(unreadMap).reduce((a,b)=>a+b,0);

  // Chat
  const [chatUser,  setChatUser] = useState(null);
  const [messages,  setMessages] = useState([]);
  const [chatInput, setChatIn]   = useState("");
  const [sending,   setSending]  = useState(false);
  const [clearing,  setClearing] = useState(false);
  const bottomRef   = useRef(null);
  const sendingRef  = useRef(false);  // prevents double-send

  // Stable refs for socket callbacks
  const chatUserRef = useRef(null);
  const userIdRef   = useRef(null);
  useEffect(() => { chatUserRef.current = chatUser; }, [chatUser]);
  useEffect(() => { userIdRef.current   = user?._id; }, [user]);

  // ── Socket ────────────────────────────────────────────────
  const { pingUser } = useSocket(user?._id, {

    onMessage: (msg) => {
      const senderId   = String(msg.sender?._id   || msg.sender   || "");
      const receiverId = String(msg.receiver?._id || msg.receiver || "");
      const myId       = String(userIdRef.current || "");
      const peer       = String(chatUserRef.current?._id || "");

      console.log("[AdminDashboard] newMessage", { senderId, receiverId, myId, peer,
        isMine: senderId===myId, involvesMe: senderId===myId||receiverId===myId });

      if (senderId !== myId && receiverId !== myId) return;

      const otherId = senderId === myId ? receiverId : senderId;

      if (otherId === peer) {
        setMessages((prev) => {
          // Replace my own optimistic
          const optIdx = prev.findIndex(
            (m) => m._opt && String(m.sender?._id || m.sender) === myId && m.content === msg.content
          );
          if (optIdx !== -1) {
            const next = [...prev]; next[optIdx] = msg; return next;
          }
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      } else if (senderId !== myId) {
        console.log("[AdminDashboard] red dot for", otherId);
        setUnread((prev) => ({ ...prev, [otherId]: (prev[otherId] || 0) + 1 }));
      }
    },

    onStatus: ({ userId, status }) => {
      setStatuses((p) => ({ ...p, [String(userId)]: status }));
      setUsers((p) => p.map((u) => String(u._id) === String(userId) ? { ...u, status } : u));
    },
  });

  // ── Data loading ──────────────────────────────────────────
  useEffect(() => { loadData(); }, [tab]);

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
        const s = {}; userData.forEach((u) => { s[u._id] = u.status || "offline"; });
        setStatuses(s);
        const map = {}; convos.forEach((c) => { if (c.unread > 0) map[c.user._id] = c.unread; });
        setUnread(map);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Open chat ─────────────────────────────────────────────
  const openChat = async (u) => {
    // Update ref SYNCHRONOUSLY so socket messages arriving during the async fetch
    // are routed to this panel, not to the red-dot counter
    chatUserRef.current = u;
    setChatUser(u);
    setMessages([]);
    setUnread((p) => { const n = {...p}; delete n[String(u._id)]; return n; });
    try {
      const fetched = await getMessages(user.token, u._id);
      // Merge: fetched is ground truth, but keep any socket msgs that arrived during fetch
      setMessages((prev) => {
        const ids   = new Set(fetched.map((m) => m._id));
        const extra = prev.filter((m) => !m._opt && !ids.has(m._id));
        return [...fetched, ...extra].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    } catch {}
  };

  const closeChat = () => { chatUserRef.current = null; setChatUser(null); setMessages([]); };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────
  const handleSend = async () => {
    if (!chatInput.trim() || !chatUser || sendingRef.current) return;
    sendingRef.current = true;
    const content = chatInput.trim();
    setChatIn("");
    const opt = {
      _id: "opt-" + Date.now(),
      sender:   { _id: user._id },
      receiver: { _id: chatUser._id },
      content, read: false,
      createdAt: new Date().toISOString(),
      _opt: true,
    };
    setMessages((p) => [...p, opt]);
    try {
      const saved = await sendMessage(user.token, { receiverId: chatUser._id, content });
      setMessages((p) => p.map((m) => m._opt ? saved : m));
    } catch {
      setMessages((p) => p.filter((m) => !m._opt));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  // ── Ping ──────────────────────────────────────────────────
  const handlePing = (u) => {
    console.log("[AdminDashboard] pinging", u._id, u.fullName);
    pingUser(u._id, user.fullName);
  };

  // ── Clear chat ────────────────────────────────────────────
  const handleClear = async () => {
    if (!chatUser || !confirm(`Clear all messages with ${chatUser.fullName}?`)) return;
    setClearing(true);
    try {
      const result = await clearChat(user.token, chatUser._id);
      console.log("[admin] clearChat result:", result);
      setMessages([]);
      setUnread((p) => { const n = {...p}; delete n[String(chatUser._id)]; return n; });
    } catch (e) { alert(e.message); }
    setClearing(false);
  };

  // ── User management ───────────────────────────────────────
  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try { await deleteUser(user.token, id); setUsers((p) => p.filter((u)=>u._id!==id)); if(chatUser?._id===id) closeChat(); }
    catch (e) { alert(e.message); }
  };

  const handleRoleChange = async (id, role) => {
    try { await updateUserRole(user.token,id,role); setUsers((p)=>p.map((u)=>u._id===id?{...u,role}:u)); }
    catch (e) { alert(e.message); }
  };

  // ── Filters ───────────────────────────────────────────────
  const fRec = records.filter((r) => {
    const q=search.toLowerCase();
    return r.firstName?.toLowerCase().includes(q)||r.lastName?.toLowerCase().includes(q)
      ||(r.address?.full||"").toLowerCase().includes(q);
  });

  const STATUS_ORDER = { active: 0, idle: 1, offline: 2 };
  const fUsr = users
    .filter((u) => {
      const q = search.toLowerCase();
      return u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const sa = STATUS_ORDER[statuses[a._id] || a.status || "offline"] ?? 2;
      const sb = STATUS_ORDER[statuses[b._id] || b.status || "offline"] ?? 2;
      if (sa !== sb) return sa - sb;
      // Within same status: unread float to top
      return (unreadMap[b._id] || 0) - (unreadMap[a._id] || 0);
    });

  const bmiColor = (v) => {
    if(!v) return "var(--text-3)";
    const b=parseFloat(v);
    return b<18.5?"#f59e0b":b<25?"#10b981":b<30?"#f59e0b":"#ef4444";
  };

  const thisMo = records.filter((r)=>{
    const d=new Date(r.createdAt),n=new Date();
    return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();
  }).length;

  const actCt  = Object.values(statuses).filter(s=>s==="active").length;
  const idleCt = Object.values(statuses).filter(s=>s==="idle").length;
  const offCt  = Object.values(statuses).filter(s=>s==="offline").length;

  // ── JSX ───────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <div className="admin-bg-grid"/>

      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="landing-logo-icon"><Icon name="shield-plus" size={18}/></div>
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
            <button className="user-chip-logout" onClick={() => { logout(); window.location.href="/"; }} title="Logout">
              <Icon name="log-out" size={15}/>
            </button>
          </div>
          {tab==="records" && (
            <button className="btn btn-success" disabled={exporting||records.length===0}
              onClick={()=>{setExport(true);exportRecordsExcel(user.token).finally(()=>setExport(false));}}>
              {exporting?<><span className="login-spinner"/>Exporting...</>:<><Icon name="file-text" size={16}/>Export Records</>}
            </button>
          )}
          {tab==="users" && (
            <button className="btn btn-secondary" disabled={exporting||users.length===0}
              onClick={()=>{setExport(true);exportUsersExcel(user.token).finally(()=>setExport(false));}}>
              {exporting?<><span className="login-spinner"/>Exporting...</>:<><Icon name="file-text" size={16}/>Export Users</>}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-bar">
        {[
          {val:records.length,  label:"Total Records"},
          {val:users.length,    label:"Registered Users"},
          {val:actCt,           label:"🟢 Active",  color:"#10b981"},
          {val:idleCt,          label:"🟡 Idle",    color:"#f59e0b"},
          {val:offCt,           label:"⚫ Offline", color:"#6b7280"},
          {val:thisMo,          label:"This Month"},
        ].map(({val,label,color})=>(
          <div className="admin-stat" key={label}>
            <span className="admin-stat-val" style={color?{color}:{}}>{val}</span>
            <span className="admin-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-tabs">
          <button className={`admin-tab${tab==="records"?" active":""}`}
            onClick={()=>{setTab("records");setSearch("");}}>
            <Icon name="clipboard-list" size={15}/>Beneficiary Records
          </button>
          <button className={`admin-tab${tab==="users"?" active":""}`} style={{position:"relative"}}
            onClick={()=>{setTab("users");setSearch("");}}>
            <Icon name="users" size={15}/>Manage Users
            {totalUnread>0&&(
              <span style={{position:"absolute",top:-5,right:-5,background:"#ef4444",color:"white",
                borderRadius:"999px",fontSize:"0.6rem",fontWeight:800,padding:"0.1rem 0.35rem",
                border:"2px solid var(--bg)",minWidth:16,textAlign:"center"}}>
                {totalUnread}
              </span>
            )}
          </button>
        </div>
        <div style={{display:"flex",gap:"0.75rem",alignItems:"center",flex:1,justifyContent:"flex-end"}}>
          <div className="input-wrapper" style={{maxWidth:340,width:"100%"}}>
            <Icon name="search" size={16} className="input-icon"/>
            <input type="text"
              placeholder={tab==="records"?"Search records…":"Search users…"}
              value={search} onChange={(e)=>setSearch(e.target.value)}
              style={{width:"100%",padding:"0.6rem 1rem 0.6rem 2.5rem",background:"var(--input)",
                border:"1px solid var(--border)",borderRadius:"0.5rem",
                color:"var(--text)",fontSize:"0.875rem",fontFamily:"inherit"}}/>
          </div>
          <button className="btn btn-secondary" onClick={loadData} style={{flexShrink:0}}>
            <Icon name="refresh-cw" size={15}/>Refresh
          </button>
        </div>
      </div>

      {error   && <div className="submit-error"><Icon name="x" size={14}/>{error}</div>}
      {loading && <div className="admin-loading"><span className="login-spinner" style={{width:20,height:20}}/>Loading...</div>}

      {/* Records table */}
      {!loading&&tab==="records"&&(
        <div className="admin-table-wrap">
          {fRec.length===0
            ? <div className="admin-loading"><Icon name="clipboard-list" size={32}/>No records found</div>
            : <table className="admin-table">
                <thead><tr>
                  <th>Name</th><th>Gender</th><th>Age</th><th>Phone</th><th>Address</th>
                  <th>BP</th><th>Blood Sugar</th><th>BMI</th><th>Conditions</th><th>Volunteer</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {fRec.map((r)=>(
                    <tr key={r._id}>
                      <td className="td-name">{r.firstName} {r.lastName}</td>
                      <td className="td-muted" style={{textTransform:"capitalize"}}>{r.gender||"—"}</td>
                      <td className="td-muted">{r.age||"—"}</td>
                      <td className="td-muted">{r.phone||"—"}</td>
                      <td className="td-muted">{r.address?.full||r.address||"—"}</td>
                      <td className="td-muted">{r.bloodPressureSystolic&&r.bloodPressureDiastolic?`${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}`:"—"}</td>
                      <td className="td-muted">{r.bloodSugar?`${r.bloodSugar} mg/dL`:"—"}</td>
                      <td>{r.bmi?<span style={{color:bmiColor(r.bmi),fontWeight:700}}>{r.bmi}</span>:"—"}</td>
                      <td>{r.conditions?.length?r.conditions.map((c)=><span key={c} className="tag" style={{fontSize:"0.68rem",padding:"0.15rem 0.5rem",marginRight:2}}>{c}</span>):"—"}</td>
                      <td className="td-muted">{r.submittedBy?.fullName||r.volunteerName||"—"}</td>
                      <td className="td-muted" style={{whiteSpace:"nowrap",fontSize:"0.78rem"}}>{new Date(r.submittedAt||r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      )}

      {/* Users tab */}
      {!loading&&tab==="users"&&(
        <div style={{display:"flex",gap:"1.25rem",alignItems:"flex-start"}}>

          {/* Table */}
          <div className="admin-table-wrap" style={{flex:1,minWidth:0}}>
            {fUsr.length===0
              ? <div className="admin-loading"><Icon name="users" size={32}/>No users found</div>
              : <table className="admin-table">
                  <thead><tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Seen</th><th>Joined</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {fUsr.map((u)=>{
                      const st     = statuses[u._id]||u.status||"offline";
                      const unread = unreadMap[u._id]||0;
                      const active = chatUser?._id===u._id;
                      return (
                        <tr key={u._id}
                          style={{background:active?"rgba(37,99,235,0.08)":undefined}}>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                              <div style={{position:"relative",flexShrink:0}}>
                                <div className="user-chip-avatar" style={{width:28,height:28,fontSize:"0.72rem"}}>
                                  {u.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <span style={{position:"absolute",bottom:0,right:0,width:8,height:8,
                                  borderRadius:"50%",background:SC[st],border:"1.5px solid var(--card)"}}/>
                              </div>
                              <span className="td-name">{u.fullName}</span>
                              {/* RED DOT unread badge */}
                              {unread>0&&(
                                <span style={{background:"#ef4444",color:"white",borderRadius:"999px",
                                  fontSize:"0.62rem",fontWeight:800,padding:"0.1rem 0.45rem",
                                  animation:"pulse 1.4s ease-in-out infinite"}}>
                                  {unread} new
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="td-muted">{u.email}</td>
                          <td>
                            <select value={u.role}
                              onChange={(e)=>handleRoleChange(u._id,e.target.value)}
                              className="role-select" disabled={u._id===user._id}
                              onClick={(e)=>e.stopPropagation()}>
                              {ROLES.map((r)=><option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                          <td>
                            <span style={{display:"inline-flex",alignItems:"center",gap:"0.35rem",
                              fontSize:"0.78rem",color:SC[st],fontWeight:600}}>
                              <span style={{width:7,height:7,borderRadius:"50%",background:SC[st],display:"inline-block"}}/>
                              {SL[st]}
                            </span>
                          </td>
                          <td className="td-muted" style={{fontSize:"0.75rem"}}>
                            {u.lastSeen?new Date(u.lastSeen).toLocaleString():"—"}
                          </td>
                          <td className="td-muted" style={{fontSize:"0.78rem"}}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{display:"flex",gap:"0.35rem"}}>
                              {/* Chat icon — red when unread */}
                              <button className="icon-btn" title="Open chat"
                                onClick={()=>openChat(u)}
                                style={{color:unread>0?"#ef4444":"#10b981",position:"relative"}}>
                                <Icon name="message-circle" size={14}/>
                                {unread>0&&(
                                  <span style={{position:"absolute",top:-3,right:-3,width:7,height:7,
                                    borderRadius:"50%",background:"#ef4444",border:"1px solid var(--card)"}}/>
                                )}
                              </button>
                              {/* Ping */}
                              <button className="icon-btn" title="Ping user"
                                style={{color:"#f59e0b"}} onClick={()=>handlePing(u)}>
                                <Icon name="bell" size={14}/>
                              </button>
                              {u._id!==user._id&&(
                                <button className="icon-btn red" title="Delete user"
                                  onClick={()=>handleDeleteUser(u._id)}>
                                  <Icon name="trash-2" size={14}/>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>}
          </div>

          {/* Chat panel */}
          {chatUser&&(
            <div className="admin-chat-panel">
              {/* Header */}
              <div className="admin-chat-header">
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",flex:1,minWidth:0}}>
                  <div style={{position:"relative",flexShrink:0}}>
                    <div className="user-chip-avatar" style={{width:32,height:32,fontSize:"0.78rem"}}>
                      {chatUser.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{position:"absolute",bottom:0,right:0,width:9,height:9,
                      borderRadius:"50%",background:SC[statuses[chatUser._id]||"offline"],
                      border:"2px solid var(--card)"}}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:"0.875rem",
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {chatUser.fullName}
                    </div>
                    <div style={{fontSize:"0.7rem",color:SC[statuses[chatUser._id]||"offline"]}}>
                      {SL[statuses[chatUser._id]||"offline"]} · {chatUser.role}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:"0.35rem",flexShrink:0}}>
                  <button className="icon-btn" title="Ping user"
                    style={{color:"#f59e0b"}} onClick={()=>handlePing(chatUser)}>
                    <Icon name="bell" size={14}/>
                  </button>
                  <button className="icon-btn red" title="Clear all messages"
                    disabled={clearing||messages.length===0}
                    style={{opacity:messages.length===0?0.4:1}}
                    onClick={handleClear}>
                    {clearing
                      ? <span className="login-spinner" style={{width:12,height:12}}/>
                      : <Icon name="trash-2" size={14}/>}
                  </button>
                  <button className="icon-btn" title="Close" onClick={closeChat}>
                    <Icon name="x" size={14}/>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="admin-chat-messages">
                {messages.length===0&&(
                  <div className="chat-empty">
                    <Icon name="message-circle" size={24}/>
                    <p>No messages yet</p>
                  </div>
                )}
                {messages.map((m)=>{
                  const mine = String(m.sender?._id || m.sender) === String(user._id);
                  return (
                    <div key={m._id} className={`chat-msg ${mine?"mine":"theirs"}`}>
                      <div className="chat-bubble">{m.content}</div>
                      <div className="chat-time">
                        {new Date(m.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                        {mine&&<span className="chat-read">{m.read?" ✓✓":" ✓"}</span>}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div className="chat-input-row">
                <input className="chat-input"
                  placeholder={`Message ${chatUser.fullName}…`}
                  value={chatInput}
                  onChange={(e)=>setChatIn(e.target.value)}
                  onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
                  maxLength={500} autoFocus/>
                <button className="chat-send" onClick={handleSend}
                  disabled={sending||!chatInput.trim()}>
                  <Icon name="send" size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import Icon from "./Icon";
import { saveCookieConsent } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CookieBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("bhf_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const handle = async (accepted) => {
    localStorage.setItem("bhf_cookie_consent", accepted ? "accepted" : "declined");
    setVisible(false);
    if (user) {
      try { await saveCookieConsent(user.token, accepted); } catch {}
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-inner">
        <div className="cookie-icon">
          <Icon name="shield-check" size={18} color="#10b981" />
        </div>
        <p className="cookie-text">
          We use cookies for site functionality and to improve your experience.
          See our <a href="#" className="cookie-link">Privacy Policy</a>.
        </p>
        <div className="cookie-actions">
          <button className="cookie-btn cookie-decline" onClick={() => handle(false)}>
            Decline
          </button>
          <button className="cookie-btn cookie-accept" onClick={() => handle(true)}>
            Accept
          </button>
        </div>
        <button className="cookie-dismiss" onClick={() => handle(false)}>
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}
import Icon from "./Icon";

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "ha", label: "Hausa" },
  { code: "yo", label: "Yoruba" },  { code: "ig", label: "Igbo" },
  { code: "fr", label: "Français" },{ code: "ar", label: "العربية" },
];

const stepLabels = {
  en: [{ title: "Beneficiary Profile", desc: "Personal & contact details" }, { title: "Health Screening", desc: "BP, blood sugar & BMI" }],
  ha: [{ title: "Bayanan Amfani", desc: "Sunan mutum da lambar wayar" }, { title: "Gwajin Lafiya", desc: "BP, sukari da BMI" }],
  yo: [{ title: "Alaye Oluranlọwọ", desc: "Ẹsẹ ati alaye ibasọrọ" }, { title: "Ayẹwo Ilera", desc: "BP, suga ẹjẹ & BMI" }],
  ig: [{ title: "Ozi Onye Ọrụ", desc: "Nkọwa onwe & nọmba ekwentị" }, { title: "Nlele Ahụike", desc: "BP, shuga ọbara & BMI" }],
  fr: [{ title: "Profil Bénéficiaire", desc: "Informations personnelles" }, { title: "Bilan de Santé", desc: "TA, glycémie & IMC" }],
  ar: [{ title: "ملف المستفيد", desc: "التفاصيل الشخصية والتواصل" }, { title: "الفحص الصحي", desc: "ضغط الدم، السكر، ومؤشر كتلة الجسم" }],
};

const langLabels   = { en: "Language", ha: "Harshe", yo: "Èdè", ig: "Asụsụ", fr: "Langue", ar: "اللغة" };
const secureLabels = { en: "Secure & encrypted", ha: "Tsaro & sirri", yo: "Aabo & fifi pamọ", ig: "Nchekwa & ezipụta", fr: "Sécurisé & chiffré", ar: "آمن ومشفر" };
const homeLabels   = { en: "Back to Home", ha: "Gida", yo: "Ile", ig: "Ulo", fr: "Accueil", ar: "الرئيسية" };

function Dashboard({ currentStep, setCurrentStep, lang, setLang, dashboardOpen, setDashboardOpen, onBackToHome }) {
  const steps = stepLabels[lang] || stepLabels.en;
  const isRTL = lang === "ar";

  return (
    <aside className={`dashboard${dashboardOpen ? " open" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <button className="dashboard-close" onClick={() => setDashboardOpen(false)}>
        <Icon name="x" size={18} />
      </button>

      <div className="logo">
        <Icon name="shield-plus" size={22} className="logo-icon" />
        <span>BHF</span>
      </div>
      <div className="logo-sub">
        <p>Beyond Health Foundation</p>
        <span className="app-name">DataGuardian</span>
      </div>

      <div className="progress-steps">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          return (
            <div
              key={stepNumber}
              className={`step${currentStep === stepNumber ? " active" : ""}${currentStep > stepNumber ? " completed" : ""}`}
              onClick={() => setCurrentStep(stepNumber)}
            >
              <div className="step-number">
                {currentStep > stepNumber ? <Icon name="check" size={14} /> : stepNumber}
              </div>
              <div className="step-info">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lang-toggle">
        <p className="lang-label">
          <Icon name="globe" size={12} style={{ display: "inline", marginRight: 4 }} />
          {langLabels[lang] || "Language"}
        </p>
        <div className="input-wrapper" style={{ marginTop: "0.4rem" }}>
          <Icon name="chevron-down" size={14} className="select-arrow" />
          <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <button className="dashboard-home-btn" onClick={onBackToHome}>
        <Icon name="house" size={15} />
        {homeLabels[lang] || homeLabels.en}
      </button>

      <div className="dashboard-footer">
        <p>{secureLabels[lang] || secureLabels.en}</p>
        <div className="security-badges">
          <Icon name="shield-check" size={16} className="badge-icon" />
          <Icon name="lock" size={16} className="badge-icon" />
        </div>
      </div>
    </aside>
  );
}

export default Dashboard;
import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import { getMessages, sendMessage, getAdminId } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

// ── Inner component — only mounts for non-admin users ────────
function UserChat({ user }) {
  const [open,     setOpen]    = useState(false);
  const [messages, setMsgs]    = useState([]);
  const [input,    setInput]   = useState("");
  const [adminId,  setAdminId] = useState(null);
  const [unread,   setUnread]  = useState(0);
  const [ping,     setPing]    = useState(null);
  const [cleared,  setCleared] = useState(false);

  const sendingRef  = useRef(false);
  const bottomRef   = useRef(null);
  const openRef     = useRef(false);
  const myIdRef     = useRef(String(user._id));
  const adminIdRef  = useRef(null);

  useEffect(() => { openRef.current   = open;             }, [open]);
  useEffect(() => { myIdRef.current   = String(user._id); }, [user._id]);
  useEffect(() => { adminIdRef.current = adminId;         }, [adminId]);

  // ── Socket ────────────────────────────────────────────────
  useSocket(user._id, {
    onMessage: (msg) => {
      const sid = String(msg.sender?._id   || msg.sender   || "");
      const rid = String(msg.receiver?._id || msg.receiver || "");
      const me  = myIdRef.current;

      console.log("[FloatingChat] newMessage", { sid, rid, me, match: sid===me||rid===me });

      if (sid !== me && rid !== me) return;

      setMsgs((prev) => {
        // Replace my own optimistic with real saved record
        const optIdx = prev.findIndex(
          (m) => m._opt && String(m.sender?._id || m.sender) === me && m.content === msg.content
        );
        if (optIdx !== -1) {
          const next = [...prev]; next[optIdx] = msg; return next;
        }
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      if (!openRef.current && sid !== me) setUnread((u) => u + 1);
    },

    onPinged: (data) => {
      setPing(data);
      setTimeout(() => setPing(null), 6000);
    },

    onChatCleared: () => {
      console.log("[FloatingChat] chatCleared — wipe only, no re-fetch");
      setMsgs([]);
      setUnread(0);
      setCleared(true);
    },
  });

  // ── Load admin ID once ────────────────────────────────────
  useEffect(() => {
    getAdminId(user.token).then((a) => setAdminId(a._id)).catch(() => {});
  }, [user._id]);

  // ── Load / merge history when chat opens ─────────────────
  useEffect(() => {
    if (!open || !adminId) return;
    if (cleared) { setUnread(0); return; } // admin just cleared — DB is empty, skip fetch
    setUnread(0);
    getMessages(user.token, adminId).then((fetched) => {
      setMsgs((prev) => {
        const ids   = new Set(fetched.map((m) => m._id));
        const extra = prev.filter((m) => !m._opt && !ids.has(m._id));
        return [...fetched, ...extra].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    }).catch(() => {});
  }, [open, adminId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !adminId || sendingRef.current) return;
    sendingRef.current = true;
    setCleared(false);
    const content = input.trim();
    setInput("");

    const opt = {
      _id: "opt-" + Date.now(),
      sender:   { _id: user._id },
      receiver: { _id: adminId },
      content, read: false,
      createdAt: new Date().toISOString(),
      _opt: true,
    };
    setMsgs((p) => [...p, opt]);

    try {
      const saved = await sendMessage(user.token, { receiverId: adminId, content });
      setMsgs((p) => p.map((m) => m._opt ? saved : m));
    } catch {
      setMsgs((p) => p.filter((m) => !m._opt));
    } finally {
      sendingRef.current = false;
    }
  };

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
              const mine = String(m.sender?._id || m.sender) === String(user._id);
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

// ── Outer wrapper — returns null for admins without running hooks
export default function FloatingChat() {
  const { user } = useAuth();
  if (!user || user.role === "Administrator") return null;
  return <UserChat user={user} />;
}
import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";

function useCountUp(end, duration = 1800, decimals = 0) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStarted(true); }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration, decimals]);
  return { ref, count };
}

function useInView(threshold = 0.2) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function StatItem({ value, label, delay = 0 }) {
  const match = value.match(/^(\d+\.?\d*)(.*)$/);
  const numericEnd = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const decimals = (match && match[1].includes(".")) ? 1 : 0;
  const { ref, count } = useCountUp(numericEnd, 1800, decimals);
  const { ref: wrapRef, inView } = useInView(0.3);
  const setRefs = useCallback((el) => { ref.current = el; wrapRef.current = el; }, []);
  return (
    <div className="stat-item" ref={setRefs} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      <span className="stat-value">{numericEnd > 0 ? count : value}{suffix && numericEnd > 0 ? suffix : ""}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function HowStep({ num, title, desc, delay, isLast }) {
  const { ref, inView } = useInView(0.2);
  return (
    <div className="how-step" ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      <div className={`how-step-num${inView ? " how-step-pop" : ""}`}>{num}</div>
      <div className="how-step-content"><h3>{title}</h3><p>{desc}</p></div>
      {!isLast && <div className="how-connector"></div>}
    </div>
  );
}

const CARD_METRICS = [
  { label: "Blood Pressure", value: 120, color: "good", display: (v) => `${v}/80 mmHg` },
  { label: "Blood Sugar",    value: 105, color: "warn", display: (v) => `${v} mg/dL` },
  { label: "BMI",            value: 22,  color: "good", display: (v) => `${v}.4 — Normal` },
  { label: "Weight",         value: 68,  color: "good", display: (v) => `${v} kg` },
];

function AnimatedHeroCard() {
  const [activeRow, setActiveRow] = useState(0);
  const [counts, setCounts] = useState(CARD_METRICS.map(() => 0));
  const [pulse, setPulse] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const runCount = (rowIdx) => {
      const target = CARD_METRICS[rowIdx].value;
      const duration = 900;
      let start = null;
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
      const step = (ts) => {
        if (cancelled) return;
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounts((prev) => { const next = [...prev]; next[rowIdx] = Math.round(eased * target); return next; });
        if (progress < 1) requestAnimationFrame(step);
        else if (rowIdx === CARD_METRICS.length - 1) {
          setSynced(true);
          setTimeout(() => { if (!cancelled) { setSynced(false); setCounts(CARD_METRICS.map(() => 0)); setActiveRow(0); } }, 2200);
        }
      };
      requestAnimationFrame(step);
    };
    const timer = setTimeout(() => runCount(activeRow), activeRow === 0 ? 600 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [activeRow]);

  useEffect(() => {
    if (counts[activeRow] === CARD_METRICS[activeRow].value && activeRow < CARD_METRICS.length - 1) {
      const t = setTimeout(() => setActiveRow((p) => p + 1), 300);
      return () => clearTimeout(t);
    }
  }, [counts, activeRow]);

  return (
    <div className="hero-card">
      <div className="hero-card-header">
        <div className="hero-card-dot green"></div>
        <div className="hero-card-dot yellow"></div>
        <div className="hero-card-dot red"></div>
        <span className="hero-card-title">Health Screening</span>
        {pulse && <span className="card-pulse-dot"></span>}
      </div>
      <div className="hero-card-rows">
        {CARD_METRICS.map((m, i) => (
          <div className={`hero-card-row${i === activeRow ? " row-active" : ""}${i < activeRow ? " row-done" : ""}`} key={i}>
            <span className="hcr-label">{i < activeRow && <span className="row-check">✓ </span>}{m.label}</span>
            <span className={`hcr-value ${i <= activeRow ? m.color : "hcr-empty"}`}>{i <= activeRow ? m.display(counts[i]) : "—"}</span>
          </div>
        ))}
        <div className="hero-card-row">
          <span className="hcr-label">Volunteer</span>
          <span className="hcr-value muted">Aisha Musa</span>
        </div>
      </div>
      <div className="hero-card-footer">
        <Icon name="shield-check" size={13} color="#10b981" />
        <span className={synced ? "footer-synced" : ""}>{synced ? "✓ Record Synced!" : "Encrypted · Syncing..."}</span>
        {synced && <span className="footer-sync-badge">LIVE</span>}
      </div>
      <div className="card-progress-bar">
        <div className="card-progress-fill" style={{ width: `${((activeRow + (counts[activeRow] / CARD_METRICS[activeRow].value)) / CARD_METRICS.length) * 100}%` }}></div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  const { ref, inView } = useInView(0.15);
  return (
    <div className="feature-card" ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)", transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms` }}>
      <div className="feature-icon"><Icon name={icon} size={22} /></div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}

function HeroContent({ t, onStart }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const delays = [100, 350, 600, 900, 1200];
    const timers = delays.map((d, i) => setTimeout(() => setPhase(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, []);
  const vis = (minPhase) => ({
    opacity: phase >= minPhase ? 1 : 0,
    transform: phase >= minPhase ? "translateY(0)" : "translateY(22px)",
    transition: "opacity 0.65s ease, transform 0.65s ease",
  });
  return (
    <div className="hero-content">
      <div className="hero-badge" style={vis(1)}>
        <Icon name="shield-check" size={13} />
        {t.hero.badge}
      </div>
      <h1 className="hero-title">
        <span className="hero-title-line1" style={vis(2)}>{t.hero.title1}</span>
        <span className="hero-title-line2" style={vis(3)}>{t.hero.title2}</span>
      </h1>
      <p className="hero-sub" style={vis(4)}>{t.hero.sub}</p>
      <div className="hero-actions" style={vis(5)}>
        <button className="btn-hero-primary" onClick={onStart}>
          {t.hero.cta}
          <Icon name="arrow-right" size={18} />
        </button>
        <a href="#features" className="btn-hero-secondary">
          {t.hero.secondary}
          <Icon name="chevron-down" size={16} />
        </a>
      </div>
    </div>
  );
}

const LANGUAGES = [
  { code: "en", label: "EN" }, { code: "ha", label: "HA" },
  { code: "yo", label: "YO" }, { code: "ig", label: "IG" },
  { code: "fr", label: "FR" }, { code: "ar", label: "AR" },
];

const langText = {
  en: {
    nav: { features: "Features", about: "About", security: "Security", cta: "Start Recording" },
    hero: { badge: "Beyond Health Foundation", title1: "Community Health", title2: "Data, Dignified.", sub: "DataGuardian empowers field volunteers to capture beneficiary profiles, health screenings, and program feedback — securely, accurately, and in your language.", cta: "Begin Intake Form", secondary: "Learn More" },
    stats: [{ value: "100%", label: "Encrypted Storage" }, { value: "6+", label: "Languages Supported" }, { value: "3", label: "Min. Avg Entry Time" }, { value: "0", label: "Data Breaches" }],
    featuresTitle: "Built for the Field",
    featuresSub: "Every feature designed around real volunteer needs.",
    features: [
      { icon: "shield-check",   title: "End-to-End Encryption",    desc: "All beneficiary data is encrypted at rest and in transit. Role-based access ensures only authorized staff can view records." },
      { icon: "heart-pulse",    title: "Health Screening Metrics", desc: "Capture blood pressure, blood sugar, weight, height and auto-calculated BMI with built-in clinical reference ranges." },
      { icon: "globe",          title: "Multilingual Interface",   desc: "Full support for English, Hausa, Yoruba, Igbo, French and Arabic — switch instantly without losing form progress." },
      { icon: "check-circle-2", title: "Smart Validation",         desc: "Real-time field validation minimizes data entry errors before submission, reducing the need for corrections later." },
      { icon: "bar-chart-2",    title: "Analytics Ready",          desc: "Structured data exports feed directly into your reporting dashboards for program adjustments and donor reports." },
      { icon: "smartphone",     title: "Mobile Optimized",         desc: "Designed first for Android field workers — fast, offline-capable, and easy to use in low-connectivity environments." },
    ],
    howTitle: "How It Works",
    howSteps: [
      { num: "01", title: "Volunteer Logs In",           desc: "Role-based access grants volunteers access only to the intake form — no sensitive data exposed." },
      { num: "02", title: "Capture Beneficiary Profile", desc: "Enter personal details, contact information and community location in Step 1." },
      { num: "03", title: "Record Health Metrics",       desc: "Input screening results — BP, blood sugar, weight and height. BMI is calculated automatically." },
      { num: "04", title: "Submit & Sync",               desc: "Record is encrypted, timestamped and synced to the BHF central database instantly." },
    ],
    footer: { tagline: "Protecting community health data with dignity.", rights: "© 2025 Beyond Health Foundation. All rights reserved." },
  },
  ha: {
    nav: { features: "Fasali", about: "Game da mu", security: "Tsaro", cta: "Fara Rikodin" },
    hero: { badge: "Gidauniyar Lafiya ta BHF", title1: "Bayanin Lafiya", title2: "Na Al'umma, Da Daraja.", sub: "DataGuardian yana taimaka wa masu sa kai wajen tattara bayanai, gwajin lafiya, da ra'ayoyin shiri — cikin tsaro, daidaito, da harshenku.", cta: "Fara Fom", secondary: "Ƙara Sani" },
    stats: [{ value: "100%", label: "Adana Sirri" }, { value: "6+", label: "Harsuna" }, { value: "3", label: "Lokacin Shigarwa" }, { value: "0", label: "Lalacewar Bayanai" }],
    featuresTitle: "An Gina Don Filin Aiki",
    featuresSub: "Kowace fasali an tsara ta don bukatar masu sa kai.",
    features: [
      { icon: "shield-check",   title: "Ɓoye Bayanai",        desc: "Duk bayanin amfani an ɓoye shi. Samun dama bisa matsayi yana tabbatar da kawai ma'aikata ne ke iya ganin rikodin." },
      { icon: "heart-pulse",    title: "Gwajin Lafiya",        desc: "Rikodin BP, sukari, nauyi, tsawo da BMI da aka lissafa kai tsaye tare da ma'auni na likitanci." },
      { icon: "globe",          title: "Harsuna Da Yawa",      desc: "Cikakken tallafi don Turanci, Hausa, Yoruba, Igbo, Faransanci da Larabci." },
      { icon: "check-circle-2", title: "Tabbatarwa Mai Wayo",  desc: "Tabbatar da filin a lokaci na gaske yana rage kuskuren shigarwa kafin a aika." },
      { icon: "bar-chart-2",    title: "Shirye don Bincike",   desc: "Fitar da bayanan tsari kai tsaye zuwa kallo don gyara shirin da rahotanni." },
      { icon: "smartphone",     title: "An Inganta don Wayar", desc: "An tsara farko don ma'aikatan Android — sauƙi da amfani a wuraren da babu intanet." },
    ],
    howTitle: "Yadda Yake Aiki",
    howSteps: [
      { num: "01", title: "Mai Sa Kai Ya Shiga",       desc: "Samun dama bisa matsayi yana ba masu sa kai damar shiga fom kawai." },
      { num: "02", title: "Rikodin Bayanan Amfani",    desc: "Shigar da cikakken sunan, lambar wayar da wurin al'umma a mataki na 1." },
      { num: "03", title: "Rikodin Gwajin Lafiya",     desc: "Shigar da sakamakon gwajin — BP, sukari, nauyi da tsawo. BMI yana lissafawa kai tsaye." },
      { num: "04", title: "Aika & Haɗa",               desc: "Rikodin an ɓoye shi, an saka lokaci kuma an haɗa shi da bayanan BHF nan take." },
    ],
    footer: { tagline: "Kare bayanin lafiya na al'umma da daraja.", rights: "© 2025 Gidauniyar Lafiya ta BHF. Duk haƙƙoƙi an kiyaye su." },
  },
};

const getText = (lang) => langText[lang] || langText.en;

function LandingPage({ onStart, lang, setLang }) {
  const t = getText(lang);
  const isRTL = lang === "ar";

  return (
    <div className="landing" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── NAV ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon"><Icon name="shield-plus" size={20} /></div>
            <div className="landing-logo-text">
              <span className="landing-logo-main">BHF</span>
              <span className="landing-logo-sub">DataGuardian</span>
            </div>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="nav-link">{t.nav.features}</a>
            <a href="#how"      className="nav-link">{t.nav.about}</a>
            <a href="#security" className="nav-link">{t.nav.security}</a>
          </div>
          <div className="landing-nav-right">
            <div className="lang-pills">
              {LANGUAGES.map((l) => (
                <button key={l.code} className={`lang-pill${lang === l.code ? " active" : ""}`} onClick={() => setLang(l.code)}>{l.label}</button>
              ))}
            </div>
            <button className="btn-nav-cta" onClick={onStart}>
              {t.nav.cta}
              <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>
      </nav>


      <section className="landing-hero">
        <div className="hero-bg-grid"></div>
        <div className="hero-bg-glow"></div>
        <div className="hero-bg-glow hero-bg-glow-2"></div>
        <HeroContent t={t} onStart={onStart} />
        <div className="hero-visual"><AnimatedHeroCard /></div>
      </section>

    
      <section className="landing-stats">
        {t.stats.map((s, i) => <StatItem key={i} value={s.value} label={s.label} delay={i * 120} />)}
      </section>

      
      <section className="landing-features" id="features">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2 className="section-title-lg">{t.featuresTitle}</h2>
          <p className="section-sub">{t.featuresSub}</p>
        </div>
        <div className="features-grid">
          {t.features.map((f, i) => <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 80} />)}
        </div>
      </section>


      <section className="landing-how" id="how">
        <div className="section-header">
          <div className="section-tag">Process</div>
          <h2 className="section-title-lg">{t.howTitle}</h2>
        </div>
        <div className="how-steps">
          {t.howSteps.map((s, i) => (
            <HowStep key={i} num={s.num} title={s.title} desc={s.desc} delay={i * 180} isLast={i === t.howSteps.length - 1} />
          ))}
        </div>
      </section>

      <section className="landing-cta-banner" id="security">
        <div className="cta-banner-inner">
          <div className="cta-banner-icons">
            <Icon name="shield-check" size={32} color="#10b981" />
          </div>
          <h2>Ready to start capturing data?</h2>
          <p>Secure, validated, and field-tested. Begin a new beneficiary intake record now.</p>
          <button className="btn-hero-primary" onClick={onStart}>
            {t.hero.cta}
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </section>

   
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon"><Icon name="shield-plus" size={20} /></div>
            <div className="landing-logo-text">
              <span className="landing-logo-main">BHF</span>
              <span className="landing-logo-sub">DataGuardian</span>
            </div>
          </div>
          <p className="footer-tagline">{t.footer.tagline}</p>
          <p className="footer-rights">{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, BarChart2,
  Bell, Briefcase, Building2, Calculator, Calendar, Check,
  CheckCircle2, ChevronDown, ClipboardList, Droplets,
  Eye, EyeOff, FileSpreadsheet, FileText, Globe, Hash,
  HeartPulse, House, Landmark, Lock, LogOut, Mail, MapPin,
  Menu, MessageCircle, Navigation, Phone, RefreshCw,
  Ruler, Scale, Send, Server, ShieldCheck, ShieldPlus,
  Smartphone, TrendingUp, Trash2, User, UserRound, Users, X,
} from "lucide-react";

const MAP = {
  "activity":        Activity,
  "arrow-left":      ArrowLeft,
  "arrow-right":     ArrowRight,
  "badge-check":     BadgeCheck,
  "bar-chart-2":     BarChart2,
  "bell":            Bell,
  "briefcase":       Briefcase,
  "building-2":      Building2,
  "calculator":      Calculator,
  "calendar":        Calendar,
  "check":           Check,
  "check-circle-2":  CheckCircle2,
  "chevron-down":    ChevronDown,
  "clipboard-list":  ClipboardList,
  "droplets":        Droplets,
  "eye":             Eye,
  "eye-off":         EyeOff,
  "file-spreadsheet":FileSpreadsheet,
  "file-text":       FileText,
  "globe":           Globe,
  "hash":            Hash,
  "heart-pulse":     HeartPulse,
  "house":           House,
  "landmark":        Landmark,
  "lock":            Lock,
  "log-out":         LogOut,
  "mail":            Mail,
  "map-pin":         MapPin,
  "menu":            Menu,
  "message-circle":  MessageCircle,
  "navigation":      Navigation,
  "phone":           Phone,
  "refresh-cw":      RefreshCw,
  "ruler":           Ruler,
  "scale":           Scale,
  "send":            Send,
  "server":          Server,
  "shield-check":    ShieldCheck,
  "shield-plus":     ShieldPlus,
  "smartphone":      Smartphone,
  "search":          ({ size, color, className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || "currentColor"} strokeWidth={1.75} strokeLinecap="round"
      strokeLinejoin="round" className={className} style={style}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  "trending-up":     TrendingUp,
  "trash-2":         Trash2,
  "user":            User,
  "user-round":      UserRound,
  "users":           Users,
  "x":               X,
};

export default function Icon({ name, size = 18, color, className, style }) {
  const C = MAP[name];
  if (!C) return <span style={{ display: "inline-block", width: size, height: size }} />;
  return <C size={size} color={color} className={className} style={style} strokeWidth={1.75} />;
}
import { useState } from "react";
import Icon from "./Icon";
import { loginUser, registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Field Volunteer", "Health Worker", "Program Manager", "Data Analyst", "Administrator"];

export default function LoginPage({ onSuccess, onBack, lang = "en" }) {
  const { login } = useAuth();
  const [mode,     setMode]     = useState("login");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [form,     setForm]     = useState({ fullName: "", email: "", password: "", role: "Field Volunteer" });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser({ fullName: form.fullName, email: form.email, password: form.password, role: form.role });
      login(data);
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setMode((m) => m === "login" ? "register" : "login"); setError(""); };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-bg-grid" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="landing-logo-icon"><Icon name="shield-plus" size={20} /></div>
          <div className="landing-logo-text">
            <span className="landing-logo-main">BHF</span>
            <span className="landing-logo-sub">DataGuardian</span>
          </div>
        </div>

      
        <div className="auth-mode-tabs">
          <button className={`auth-mode-tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>
            <Icon name="lock" size={13} /> Sign In
          </button>
          <button className={`auth-mode-tab${mode === "register" ? " active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>
            <Icon name="user-round" size={13} /> Register
          </button>
        </div>

        <h2 className="login-title">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="login-sub">
          {mode === "login"
            ? "Sign in to access BHF DataGuardian"
            : "Register to join BHF DataGuardian"}
        </p>

        {error && (
          <div className="login-error">
            <Icon name="x" size={13} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "register" && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <Icon name="user" size={16} className="input-icon" />
                <input type="text" placeholder="e.g. Amina Musa" value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)} required />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Icon name="mail" size={16} className="input-icon" />
              <input type="email" placeholder="you@bhf.org" value={form.email}
                onChange={(e) => set("email", e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Icon name="lock" size={16} className="input-icon" />
              <input type={showPw ? "text" : "password"} placeholder="••••••••"
                value={form.password} onChange={(e) => set("password", e.target.value)}
                style={{ paddingRight: "3rem" }} required />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((p) => !p)}>
                <Icon name={showPw ? "eye-off" : "eye"} size={15} />
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="input-group">
              <label>Role</label>
              <div className="input-wrapper">
                <Icon name="badge-check" size={16} className="input-icon" />
                <select value={form.role} onChange={(e) => set("role", e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <Icon name="chevron-down" size={14} className="select-arrow" />
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="login-role-hint">
              <Icon name="shield-check" size={13} color="#10b981" />
              Role-based access — permissions are set by your account.
            </div>
          )}

          <button type="submit" className="btn btn-success login-btn" disabled={loading}>
            {loading
              ? <><span className="login-spinner" />{mode === "login" ? "Signing in..." : "Creating..."}</>
              : <>{mode === "login" ? "Sign In" : "Create Account"} <Icon name="arrow-right" size={15} /></>
            }
          </button>
        </form>

        <button className="back-to-home" style={{ margin: "1rem auto 0", display: "flex" }} onClick={onBack}>
          <Icon name="arrow-left" size={13} /> Back to Home
        </button>
      </div>
    </div>
  );
}

// src/components/ServerWake.jsx
import { useEffect, useState } from "react";
import Icon from "./Icon";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function ServerWake({ children }) {
  const [status, setStatus] = useState("waking");
  const [dots,   setDots]   = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);

    // Elapsed timer
    const elapsedInterval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    // Ping backend
    const ping = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/`, { method: "GET" });
        if (res.ok) {
          setStatus("ready");
        } else {
          retry();
        }
      } catch {
        retry();
      }
    };

    // Retry every 4 seconds until alive
    let retryTimer;
    const retry = () => {
      retryTimer = setTimeout(ping, 4000);
    };

    // Timeout after 60 seconds — show app anyway
    const timeoutTimer = setTimeout(() => {
      setStatus("timeout");
    }, 60000);

    ping(); // first ping immediately

    return () => {
      clearInterval(dotsInterval);
      clearInterval(elapsedInterval);
      clearTimeout(retryTimer);
      clearTimeout(timeoutTimer);
    };
  }, []);

  // Server is up or timed out — show the app
  if (status === "ready" || status === "timeout") {
    return children;
  }

  // Waking screen
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg, #0a0a0a)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute", top: "-150px", left: "50%",
        transform: "translateX(-50%)", width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", position: "relative", zIndex: 2, maxWidth: 420,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "2.5rem" }}>
          <div className="landing-logo-icon">
            <Icon name="shield-plus" size={18} />
          </div>
          <div className="landing-logo-text">
            <span className="landing-logo-main">BHF</span>
            <span className="landing-logo-sub">DataGuardian</span>
          </div>
        </div>

        {/* Pulse ring */}
        <div style={{ position: "relative", width: 80, height: 80, marginBottom: "2rem" }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(16,185,129,0.15)",
            animation: "pingRing 1.8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: 8, borderRadius: "50%",
            border: "2px solid rgba(16,185,129,0.25)",
            animation: "pingRing 1.8s ease-in-out infinite 0.3s",
          }} />
          <div style={{
            position: "absolute", inset: 16, borderRadius: "50%",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="server" size={20} color="#10b981" />
          </div>
        </div>

        {/* Text */}
        <h2 style={{
          fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 800,
          color: "var(--text, #fff)", letterSpacing: "-0.02em", marginBottom: "0.5rem",
        }}>
          Starting up{dots}
        </h2>
        <p style={{
          fontSize: "0.9rem", color: "var(--text-2, #9ca3af)",
          lineHeight: 1.6, marginBottom: "1.75rem", maxWidth: 320,
        }}>
          The server is waking up from sleep. This usually takes <strong style={{ color: "var(--text, #fff)" }}>15–30 seconds</strong> on the free tier.
        </p>

        {/* Progress bar */}
        <div style={{
          width: "100%", maxWidth: 280, height: 4,
          background: "rgba(255,255,255,0.06)", borderRadius: 999,
          overflow: "hidden", marginBottom: "1rem",
        }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg, #10b981, #2563eb)",
            width: `${Math.min((elapsed / 30) * 100, 95)}%`,
            transition: "width 1s ease",
          }} />
        </div>

        {/* Timer */}
        <p style={{ fontSize: "0.78rem", color: "var(--text-3, #6b7280)" }}>
          {elapsed}s elapsed
        </p>

        {/* Keyframes injected inline */}
        <style>{`
          @keyframes pingRing {
            0%   { transform: scale(1);    opacity: 0.6; }
            50%  { transform: scale(1.15); opacity: 0.2; }
            100% { transform: scale(1);    opacity: 0.6; }
          }
        `}</style>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import Icon from "./Icon";
import { useNigeriaAddress } from "../hooks/useNigeriaAddress";
import { AddressFields } from "./address/AddressFields";

const t = {
  en: {
    title: "Beneficiary Profile",
    firstName: "First Name", lastName: "Last Name", gender: "Gender",
    genderOptions: ["Select gender", "Male", "Female", "Prefer not to say"],
    age: "Age", phone: "Phone Number",
    volunteerName: "Volunteer / Recorder Name",
    placeholders: {
      firstName: "e.g. Amina", lastName: "e.g. Musa",
      age: "e.g. 34", phone: "+234 800 000 0000",
      volunteerName: "Full name of recorder",
    },
  },
  ha: {
    title: "Bayanan Amfani",
    firstName: "Suna", lastName: "Sunan Iyali", gender: "Jinsi",
    genderOptions: ["Zaɓi jinsi", "Namiji", "Mace", "Ba zan bayyana ba"],
    age: "Shekaru", phone: "Lambar Waya",
    volunteerName: "Sunan Mai Yin Rikodin",
    placeholders: {
      firstName: "misali: Amina", lastName: "misali: Musa",
      age: "misali: 34", phone: "+234 800 000 0000",
      volunteerName: "Cikakken suna",
    },
  },
};

function Step1({ formData, setFormData, lang }) {
  const i18n = t[lang] || t.en;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const { address, handlers, derived } = useNigeriaAddress(formData.address || {});

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      address: {
        street:   address.street,
        street2:  address.street2,
        landmark: address.landmark,
        city:     address.city,
        lga:      address.lga,
        state:    address.state,
        postcode: address.postcode,
        country:  "Nigeria",
        full:     derived.fullAddress,
      },
    }));
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="form-section active" id="step1">
      <h2 className="section-title">
        <Icon name="user-round" size={20} />
        {i18n.title}
      </h2>

      <div className="form-grid">
        {/* First Name */}
        <div className="input-group">
          <label htmlFor="firstName">{i18n.firstName}</label>
          <div className="input-wrapper">
            <Icon name="user" size={16} className="input-icon" />
            <input type="text" id="firstName" name="firstName"
              placeholder={i18n.placeholders.firstName}
              value={formData.firstName} onChange={handleChange} required />
          </div>
        </div>

        {/* Last Name */}
        <div className="input-group">
          <label htmlFor="lastName">{i18n.lastName}</label>
          <div className="input-wrapper">
            <Icon name="user" size={16} className="input-icon" />
            <input type="text" id="lastName" name="lastName"
              placeholder={i18n.placeholders.lastName}
              value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>

        {/* Gender */}
        <div className="input-group">
          <label htmlFor="gender">{i18n.gender}</label>
          <div className="input-wrapper">
            <Icon name="users" size={16} className="input-icon" />
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
              {i18n.genderOptions.map((opt, i) => (
                <option key={i} value={i === 0 ? "" : opt.toLowerCase()} disabled={i === 0}>{opt}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={14} className="select-arrow" />
          </div>
        </div>

        {/* Age */}
        <div className="input-group">
          <label htmlFor="age">{i18n.age}</label>
          <div className="input-wrapper">
            <Icon name="calendar" size={16} className="input-icon" />
            <input type="number" id="age" name="age"
              placeholder={i18n.placeholders.age} min="1" max="120"
              value={formData.age} onChange={handleChange} required />
          </div>
        </div>

        {/* Phone */}
        <div className="input-group">
          <label htmlFor="phone">{i18n.phone}</label>
          <div className="input-wrapper">
            <Icon name="phone" size={16} className="input-icon" />
            <input type="tel" id="phone" name="phone"
              placeholder={i18n.placeholders.phone}
              value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        {/* Address fields */}
        <AddressFields address={address} handlers={handlers} derived={derived} />

        {/* Volunteer Name */}
        <div className="input-group full-width">
          <label htmlFor="volunteerName">{i18n.volunteerName}</label>
          <div className="input-wrapper">
            <Icon name="badge-check" size={16} className="input-icon" />
            <input type="text" id="volunteerName" name="volunteerName"
              placeholder={i18n.placeholders.volunteerName}
              value={formData.volunteerName} onChange={handleChange} required />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Step1;
import { useState } from "react";
import Icon from "./Icon";

const t = {
  en: {
    title: "Health Screening Metrics",
    bp: "Blood Pressure (mmHg)", bpSystolic: "Systolic", bpDiastolic: "Diastolic",
    bloodSugar: "Blood Sugar (mg/dL)", weight: "Weight (kg)", height: "Height (cm)",
    bmi: "BMI (auto-calculated)", conditions: "Known Conditions (add & press Enter)",
    conditionPlaceholder: "e.g. Hypertension, Diabetes...",
    bmiNote: "BMI is calculated automatically from weight and height.",
  },
  ha: {
    title: "Bayanan Gwajin Lafiya",
    bp: "Matsayin Jini (mmHg)", bpSystolic: "Sama", bpDiastolic: "Kasa",
    bloodSugar: "Sukari a Jini (mg/dL)", weight: "Nauyi (kg)", height: "Tsawo (cm)",
    bmi: "BMI (an lissafa kai tsaye)", conditions: "Cututtuka da aka sani (Rubuta & danna Enter)",
    conditionPlaceholder: "misali: Hauwa'u Jini, Ciwon Sukari...",
    bmiNote: "BMI yana lissafawa ta atomatik daga nauyi da tsawo.",
  },
};

function Step2({ formData, setFormData, conditions, setConditions, lang }) {
  const i18n = t[lang] || t.en;
  const [condInput, setCondInput] = useState("");

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    const w = parseFloat(e.target.name === "weight" ? e.target.value : updated.weight);
    const h = parseFloat(e.target.name === "height" ? e.target.value : updated.height) / 100;
    updated.bmi = (w && h) ? (w / (h * h)).toFixed(1) : "";
    setFormData(updated);
  };

  const handleCondKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = condInput.trim();
      if (val && !conditions.includes(val)) setConditions([...conditions, val]);
      setCondInput("");
    }
  };

  const removeCondition = (c) => setConditions(conditions.filter((x) => x !== c));

  const getBmiCategory = (bmi) => {
    if (!bmi) return "";
    const b = parseFloat(bmi);
    if (b < 18.5) return lang === "ha" ? "Ƙarancin Nauyi" : "Underweight";
    if (b < 25)   return lang === "ha" ? "Al'ada" : "Normal";
    if (b < 30)   return lang === "ha" ? "Yawan Nauyi" : "Overweight";
    return lang === "ha" ? "Kiba" : "Obese";
  };

  const bmiCategory = getBmiCategory(formData.bmi);
  const bmiColor = !formData.bmi ? "" : parseFloat(formData.bmi) < 18.5 ? "#f59e0b" : parseFloat(formData.bmi) < 25 ? "#10b981" : parseFloat(formData.bmi) < 30 ? "#f59e0b" : "#ef4444";

  return (
    <section className="form-section active" id="step2">
      <h2 className="section-title">
        <Icon name="heart-pulse" size={20} />
        {i18n.title}
      </h2>
      <div className="form-grid">
        <div className="input-group">
          <label>{i18n.bp}</label>
          <div className="bp-row">
            <div className="input-wrapper">
              <Icon name="activity" size={16} className="input-icon" />
              <input type="number" id="bloodPressureSystolic" name="bloodPressureSystolic" placeholder={i18n.bpSystolic} value={formData.bloodPressureSystolic} onChange={handleChange} min="60" max="250" />
            </div>
            <span className="bp-slash">/</span>
            <div className="input-wrapper">
              <input type="number" id="bloodPressureDiastolic" name="bloodPressureDiastolic" placeholder={i18n.bpDiastolic} value={formData.bloodPressureDiastolic} onChange={handleChange} min="40" max="150" />
            </div>
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="bloodSugar">{i18n.bloodSugar}</label>
          <div className="input-wrapper">
            <Icon name="droplets" size={16} className="input-icon" />
            <input type="number" id="bloodSugar" name="bloodSugar" placeholder="e.g. 95" value={formData.bloodSugar} onChange={handleChange} min="0" />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="weight">{i18n.weight}</label>
          <div className="input-wrapper">
            <Icon name="scale" size={16} className="input-icon" />
            <input type="number" id="weight" name="weight" placeholder="e.g. 70" value={formData.weight} onChange={handleChange} min="1" />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="height">{i18n.height}</label>
          <div className="input-wrapper">
            <Icon name="ruler" size={16} className="input-icon" />
            <input type="number" id="height" name="height" placeholder="e.g. 165" value={formData.height} onChange={handleChange} min="1" />
          </div>
        </div>
        <div className="input-group full-width">
          <label htmlFor="bmi">{i18n.bmi}</label>
          <div className="bmi-display">
            <div className="input-wrapper">
              <Icon name="calculator" size={16} className="input-icon" />
              <input type="text" id="bmi" name="bmi" value={formData.bmi} readOnly placeholder="—" style={{ color: bmiColor || "inherit" }} />
            </div>
            {bmiCategory && <span className="bmi-badge" style={{ background: bmiColor }}>{bmiCategory}</span>}
          </div>
          <p className="field-hint">{i18n.bmiNote}</p>
        </div>
        <div className="input-group full-width">
          <label>{i18n.conditions}</label>
          <div className="tags-input-container" id="skillsContainer">
            <div className="tags-list" id="tagsList">
              {conditions.map((c) => (
                <span key={c} className="tag">
                  {c}
                  <button type="button" className="tag-remove" onClick={() => removeCondition(c)}>&times;</button>
                </span>
              ))}
            </div>
            <input type="text" id="skillInput" placeholder={i18n.conditionPlaceholder} className="tags-input" value={condInput} onChange={(e) => setCondInput(e.target.value)} onKeyDown={handleCondKey} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Step2;
import Icon from "./Icon";

const text = {
  en: { heading: "Record Submitted Successfully!", body: "The beneficiary's data has been securely encrypted and stored.", btn: "Add New Beneficiary" },
  ha: { heading: "An Aika Bayani Cikin Nasara!", body: "An adana bayanin amfani cikin tsaro da sirri.", btn: "Ƙara Sabon Amfani" },
  yo: { heading: "Igbasilẹ Ti Firanṣẹ!", body: "Data oluranlọwọ ti wa ni fipamọ ni aabo.", btn: "Ṣafikun Oluranlọwọ Tuntun" },
  ig: { heading: "Ezipụtara Ndekọ Nke Ọma!", body: "Edeturu data onye ọrụ nchekwa.", btn: "Tinye Onye Ọrụ Ọhụrụ" },
  fr: { heading: "Dossier Soumis avec Succès !", body: "Les données du bénéficiaire ont été chiffrées et enregistrées.", btn: "Ajouter un Nouveau Bénéficiaire" },
  ar: { heading: "تم إرسال السجل بنجاح!", body: "تم تشفير بيانات المستفيد وتخزينها بأمان.", btn: "إضافة مستفيد جديد" },
};

function Success({ setSubmitted, lang }) {
  const t = text[lang] || text.en;
  const isRTL = lang === "ar";

  return (
    <div className="success-message" id="successMessage" dir={isRTL ? "rtl" : "ltr"}>
      <div className="success-icon">
        <Icon name="check-circle-2" size={48} className="check-icon" />
      </div>
      <div className="success-brand">
        <Icon name="shield-plus" size={18} color="#10b981" />
        <span>BHF DataGuardian</span>
      </div>
      <h2>{t.heading}</h2>
      <p>{t.body}</p>
      <button type="button" className="btn btn-primary" onClick={() => setSubmitted(false)}>
        {t.btn}
      </button>
    </div>
  );
}

export default Success;
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("bhf_user");
      if (s) setUser(JSON.parse(s));
    } catch (_) {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user) localStorage.setItem("bhf_user", JSON.stringify(user));
    else localStorage.removeItem("bhf_user");
  }, [user, ready]);

  const login  = (u) => setUser(u);
  const logout = ()  => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
};

export const NIGERIA_ADDRESS_DATA = {

  "Abia": {
    "Aba North":        ["Aba"],
    "Aba South":        ["Aba", "Opobo"],
    "Arochukwu":        ["Arochukwu", "Ohafia"],
    "Bende":            ["Bende", "Uzuakoli"],
    "Ikwuano":          ["Ikwuano", "Oloko"],
    "Isiala Ngwa North":["Isiala Ngwa"],
    "Isiala Ngwa South":["Isiala Ngwa"],
    "Isuikwuato":       ["Isuikwuato"],
    "Obi Ngwa":         ["Obi Ngwa"],
    "Ohafia":           ["Ohafia", "Abiriba"],
    "Osisioma":         ["Osisioma"],
    "Ugwunagbo":        ["Ugwunagbo"],
    "Ukwa East":        ["Ukwa"],
    "Ukwa West":        ["Ukwa"],
    "Umuahia North":    ["Umuahia"],
    "Umuahia South":    ["Umuahia", "Ibeku"],
    "Umu Nneochi":      ["Umu Nneochi"],
  },

  "Adamawa": {
    "Demsa":            ["Demsa"],
    "Fufure":           ["Fufure"],
    "Ganye":            ["Ganye"],
    "Gayuk":            ["Gayuk"],
    "Gombi":            ["Gombi"],
    "Grie":             ["Grie"],
    "Hong":             ["Hong"],
    "Jada":             ["Jada"],
    "Lamurde":          ["Lamurde"],
    "Madagali":         ["Madagali"],
    "Maiha":            ["Maiha"],
    "Mayo Belwa":       ["Mayo Belwa"],
    "Michika":          ["Michika"],
    "Mubi North":       ["Mubi"],
    "Mubi South":       ["Mubi"],
    "Numan":            ["Numan"],
    "Shelleng":         ["Shelleng"],
    "Song":             ["Song"],
    "Toungo":           ["Toungo"],
    "Yola North":       ["Yola", "Jimeta"],
    "Yola South":       ["Yola"],
  },

  "Akwa Ibom": {
    "Abak":             ["Abak"],
    "Eastern Obolo":    ["Eastern Obolo"],
    "Eket":             ["Eket"],
    "Esit Eket":        ["Esit Eket"],
    "Essien Udim":      ["Essien Udim"],
    "Etim Ekpo":        ["Etim Ekpo"],
    "Etinan":           ["Etinan"],
    "Ibeno":            ["Ibeno"],
    "Ibesikpo Asutan":  ["Ibesikpo"],
    "Ibiono Ibom":      ["Ibiono"],
    "Ika":              ["Ika"],
    "Ikono":            ["Ikono"],
    "Ikot Abasi":       ["Ikot Abasi"],
    "Ikot Ekpene":      ["Ikot Ekpene"],
    "Ini":              ["Ini"],
    "Itu":              ["Itu"],
    "Mbo":              ["Mbo"],
    "Mkpat Enin":       ["Mkpat Enin"],
    "Nsit Atai":        ["Nsit Atai"],
    "Nsit Ibom":        ["Nsit Ibom"],
    "Nsit Ubium":       ["Nsit Ubium"],
    "Obot Akara":       ["Obot Akara"],
    "Okobo":            ["Okobo"],
    "Onna":             ["Onna"],
    "Oron":             ["Oron"],
    "Oruk Anam":        ["Oruk Anam"],
    "Udung Uko":        ["Udung Uko"],
    "Ukanafun":         ["Ukanafun"],
    "Uruan":            ["Uruan"],
    "Urue Offong/Oruko":["Urue Offong"],
    "Uyo":              ["Uyo", "Ewet", "Shelter Afrique"],
  },

  "Anambra": {
    "Aguata":           ["Aguata", "Ekwulobia"],
    "Anambra East":     ["Anambra East"],
    "Anambra West":     ["Anambra West"],
    "Anaocha":          ["Anaocha", "Nnewi"],
    "Awka North":       ["Awka"],
    "Awka South":       ["Awka", "Amawbia"],
    "Ayamelum":         ["Ayamelum"],
    "Dunukofia":        ["Dunukofia"],
    "Ekwusigo":         ["Ekwusigo", "Ozubulu"],
    "Idemili North":    ["Onitsha", "Ogidi"],
    "Idemili South":    ["Ojoto"],
    "Ihiala":           ["Ihiala", "Nnewi"],
    "Njikoka":          ["Njikoka", "Enugwu-Ukwu"],
    "Nnewi North":      ["Nnewi"],
    "Nnewi South":      ["Nnewi"],
    "Ogbaru":           ["Ogbaru", "Atani"],
    "Onitsha North":    ["Onitsha"],
    "Onitsha South":    ["Onitsha"],
    "Orumba North":     ["Orumba"],
    "Orumba South":     ["Orumba"],
    "Oyi":              ["Oyi", "Nteje"],
  },

  "Bauchi": {
    "Alkaleri":         ["Alkaleri"],
    "Bauchi":           ["Bauchi"],
    "Bogoro":           ["Bogoro"],
    "Damban":           ["Damban"],
    "Darazo":           ["Darazo"],
    "Dass":             ["Dass"],
    "Gamawa":           ["Gamawa"],
    "Ganjuwa":          ["Ganjuwa"],
    "Giade":            ["Giade"],
    "Itas/Gadau":       ["Itas", "Gadau"],
    "Jama'are":         ["Jama'are"],
    "Katagum":          ["Azare"],
    "Kirfi":            ["Kirfi"],
    "Misau":            ["Misau"],
    "Ningi":            ["Ningi"],
    "Shira":            ["Shira"],
    "Tafawa Balewa":    ["Tafawa Balewa", "Bauchi"],
    "Toro":             ["Toro"],
    "Warji":            ["Warji"],
    "Zaki":             ["Zaki"],
  },

  "Bayelsa": {
    "Brass":            ["Brass", "Twon-Brass"],
    "Ekeremor":         ["Ekeremor"],
    "Kolokuma/Opokuma": ["Kolokuma"],
    "Nembe":            ["Nembe"],
    "Ogbia":            ["Ogbia"],
    "Sagbama":          ["Sagbama"],
    "Southern Ijaw":    ["Southern Ijaw"],
    "Yenagoa":          ["Yenagoa", "Amarata", "Opolo", "Kpansia"],
  },

  "Benue": {
    "Agatu":            ["Agatu"],
    "Apa":              ["Apa"],
    "Ado":              ["Ado"],
    "Buruku":           ["Buruku"],
    "Gboko":            ["Gboko"],
    "Guma":             ["Guma"],
    "Gwer East":        ["Gwer East"],
    "Gwer West":        ["Gwer West"],
    "Katsina-Ala":      ["Katsina-Ala"],
    "Konshisha":        ["Konshisha"],
    "Kwande":           ["Kwande"],
    "Logo":             ["Logo"],
    "Makurdi":          ["Makurdi", "North Bank", "Wadata"],
    "Obi":              ["Obi"],
    "Ogbadibo":         ["Ogbadibo"],
    "Oju":              ["Oju"],
    "Okpokwu":          ["Okpokwu"],
    "Ohimini":          ["Ohimini"],
    "Oturkpo":          ["Oturkpo"],
    "Tarka":            ["Tarka"],
    "Ukum":             ["Ukum"],
    "Ushongo":          ["Ushongo"],
    "Vandeikya":        ["Vandeikya"],
  },

  "Borno": {
    "Abadam":           ["Abadam"],
    "Askira/Uba":       ["Askira", "Uba"],
    "Bama":             ["Bama"],
    "Bayo":             ["Bayo"],
    "Biu":              ["Biu"],
    "Chibok":           ["Chibok"],
    "Damboa":           ["Damboa"],
    "Dikwa":            ["Dikwa"],
    "Gubio":            ["Gubio"],
    "Guzamala":         ["Guzamala"],
    "Gwoza":            ["Gwoza"],
    "Hawul":            ["Hawul"],
    "Jere":             ["Bama Road", "Gamboru"],
    "Kaga":             ["Kaga"],
    "Kala/Balge":       ["Kala"],
    "Konduga":          ["Konduga"],
    "Kukawa":           ["Kukawa"],
    "Kwaya Kusar":      ["Kwaya Kusar"],
    "Mafa":             ["Mafa"],
    "Magumeri":         ["Magumeri"],
    "Maiduguri":        ["Maiduguri", "Bolori", "Gwange", "GRA", "Wulari"],
    "Marte":            ["Marte"],
    "Mobbar":           ["Mobbar"],
    "Monguno":          ["Monguno"],
    "Ngala":            ["Ngala"],
    "Nganzai":          ["Nganzai"],
    "Shani":            ["Shani"],
  },

  "Cross River": {
    "Abi":              ["Abi"],
    "Akamkpa":          ["Akamkpa"],
    "Akpabuyo":         ["Akpabuyo"],
    "Bakassi":          ["Bakassi"],
    "Bekwarra":         ["Bekwarra"],
    "Biase":            ["Biase"],
    "Boki":             ["Boki"],
    "Calabar Municipal":["Calabar", "Marian", "Nassarawa", "Diamond Hill"],
    "Calabar South":    ["Calabar", "Henshaw Town", "Ikot Ansa"],
    "Etung":            ["Etung"],
    "Ikom":             ["Ikom"],
    "Obanliku":         ["Obanliku"],
    "Obubra":           ["Obubra"],
    "Obudu":            ["Obudu"],
    "Odukpani":         ["Odukpani"],
    "Ogoja":            ["Ogoja"],
    "Yakurr":           ["Ugep"],
    "Yala":             ["Yala"],
  },

  "Delta": {
    "Aniocha North":    ["Aniocha", "Issele-Uku"],
    "Aniocha South":    ["Aniocha", "Ogwashi-Uku"],
    "Bomadi":           ["Bomadi"],
    "Burutu":           ["Burutu"],
    "Ethiope East":     ["Ethiope", "Ughelli"],
    "Ethiope West":     ["Oghara"],
    "Ika North East":   ["Agbor"],
    "Ika South":        ["Agbor"],
    "Isoko North":      ["Isoko"],
    "Isoko South":      ["Oleh"],
    "Ndokwa East":      ["Ndokwa"],
    "Ndokwa West":      ["Kwale"],
    "Okpe":             ["Okpe", "Sapele"],
    "Oshimili North":   ["Asaba"],
    "Oshimili South":   ["Asaba", "GRA", "Cable Point"],
    "Patani":           ["Patani"],
    "Sapele":           ["Sapele", "Ogorode", "Amukpe"],
    "Udu":              ["Udu", "Effurun"],
    "Ughelli North":    ["Ughelli"],
    "Ughelli South":    ["Ughelli"],
    "Ukwuani":          ["Ukwuani", "Aboh"],
    "Uvwie":            ["Uvwie", "Effurun"],
    "Warri Central":    ["Warri", "Okumagba"],
    "Warri North":      ["Warri"],
    "Warri South":      ["Warri", "GRA", "Igbudu", "Pessu"],
    "Warri South West": ["Warri"],
  },

  "Ebonyi": {
    "Abakaliki":        ["Abakaliki", "GRA", "Kpirikpiri"],
    "Afikpo North":     ["Afikpo"],
    "Afikpo South":     ["Afikpo"],
    "Ebonyi":           ["Ebonyi"],
    "Ezza North":       ["Ezza"],
    "Ezza South":       ["Ezza"],
    "Ikwo":             ["Ikwo"],
    "Ishielu":          ["Ishielu"],
    "Ivo":              ["Ivo"],
    "Izzi":             ["Izzi"],
    "Ohaozara":         ["Ohaozara"],
    "Ohaukwu":          ["Ohaukwu"],
    "Onicha":           ["Onicha"],
  },

  "Edo": {
    "Akoko-Edo":        ["Akoko-Edo", "Igarra"],
    "Egor":             ["Benin City", "Uselu", "Ugbowo"],
    "Esan Central":     ["Ekpoma"],
    "Esan North East":  ["Uromi"],
    "Esan South East":  ["Ubiaja"],
    "Esan West":        ["Ekpoma"],
    "Etsako Central":   ["Fugar"],
    "Etsako East":      ["Auchi"],
    "Etsako West":      ["Auchi"],
    "Igueben":          ["Igueben"],
    "Ikpoba Okha":      ["Benin City", "Aduwawa", "Ikpoba Hill"],
    "Oredo":            ["Benin City", "GRA", "Ring Road", "New Benin"],
    "Orhionmwon":       ["Orhionmwon"],
    "Ovia North East":  ["Ovia", "Sapele Road"],
    "Ovia South West":  ["Ovia"],
    "Owan East":        ["Owan"],
    "Owan West":        ["Owan"],
    "Uhunmwonde":       ["Uhunmwonde"],
  },

  "Ekiti": {
    "Ado Ekiti":        ["Ado Ekiti", "Basiri", "GRA", "Ijigbo"],
    "Efon":             ["Efon-Alaaye"],
    "Ekiti East":       ["Omuo Ekiti"],
    "Ekiti South West": ["Ilawe Ekiti"],
    "Ekiti West":       ["Aramoko Ekiti"],
    "Emure":            ["Emure Ekiti"],
    "Gbonyin":          ["Ise Ekiti"],
    "Ido/Osi":          ["Osi"],
    "Ijero":            ["Ijero Ekiti"],
    "Ikere":            ["Ikere Ekiti"],
    "Ikole":            ["Ikole Ekiti"],
    "Ilejemeje":        ["Ilejemeje"],
    "Irepodun/Ifelodun":["Irepodun"],
    "Ise/Orun":         ["Ise Ekiti"],
    "Moba":             ["Otun Ekiti"],
    "Oye":              ["Oye Ekiti"],
  },

  "Enugu": {
    "Aninri":           ["Aninri", "Nkerefi"],
    "Awgu":             ["Awgu"],
    "Enugu East":       ["Enugu", "Trans-Ekulu", "Abakpa"],
    "Enugu North":      ["Enugu", "Coal Camp", "Ogui", "Achara Layout"],
    "Enugu South":      ["Enugu", "New Haven", "GRA", "Asata"],
    "Ezeagu":           ["Ezeagu"],
    "Igbo Etiti":       ["Igbo Etiti", "Ogbede"],
    "Igbo Eze North":   ["Igbo Eze", "Obollo-Afor"],
    "Igbo Eze South":   ["Igbo Eze"],
    "Isi Uzo":          ["Isi Uzo"],
    "Nkanu East":       ["Nkanu", "Mbeeli"],
    "Nkanu West":       ["Nkanu"],
    "Nsukka":           ["Nsukka"],
    "Oji River":        ["Oji River"],
    "Udenu":            ["Udenu", "Obollo-Afor"],
    "Udi":              ["Udi"],
    "Uzo Uwani":        ["Uzo Uwani"],
  },

  "FCT": {
    "Abaji":            ["Abaji", "Yaba", "Nuku"],
    "Bwari":            ["Bwari", "Ushafa", "Dutse", "Kawu"],
    "Gwagwalada":       ["Gwagwalada", "Dobi", "Gwako"],
    "Kuje":             ["Kuje", "Chibiri", "Rubochi"],
    "Kwali":            ["Kwali", "Pai", "Yangoji"],
    "Municipal Area Council": [
      "Abuja CBD", "Garki", "Wuse", "Wuse 2", "Maitama",
      "Asokoro", "Gwarinpa", "Kubwa", "Nyanya", "Karu",
      "Lugbe", "Galadimawa", "Lokogoma", "Apo", "Gudu",
      "Jabi", "Wuye", "Utako", "Katampe", "Deidei",
    ],
  },

  "Gombe": {
    "Akko":             ["Gombe", "Kumo"],
    "Balanga":          ["Balanga"],
    "Billiri":          ["Billiri"],
    "Dukku":            ["Dukku"],
    "Funakaye":         ["Funakaye", "Bajoga"],
    "Gombe":            ["Gombe", "Pantami", "Tumfure", "GRA"],
    "Kaltungo":         ["Kaltungo"],
    "Kwami":            ["Kwami"],
    "Nafada":           ["Nafada"],
    "Shongom":          ["Shongom"],
    "Yamaltu/Deba":     ["Yamaltu"],
  },

  "Imo": {
    "Aboh Mbaise":      ["Aboh Mbaise"],
    "Ahiazu Mbaise":    ["Ahiazu Mbaise"],
    "Ehime Mbano":      ["Ehime Mbano"],
    "Ezinihitte":       ["Ezinihitte"],
    "Ideato North":     ["Ideato"],
    "Ideato South":     ["Ideato"],
    "Ihitte/Uboma":     ["Ihitte"],
    "Ikeduru":          ["Ikeduru", "Iho"],
    "Isiala Mbano":     ["Isiala Mbano"],
    "Isu":              ["Isu"],
    "Mbaitoli":         ["Mbaitoli", "Nwaorieubi"],
    "Ngor Okpala":      ["Ngor Okpala"],
    "Njaba":            ["Njaba"],
    "Nkwerre":          ["Nkwerre"],
    "Nwangele":         ["Nwangele"],
    "Obowo":            ["Obowo"],
    "Oguta":            ["Oguta"],
    "Ohaji/Egbema":     ["Ohaji"],
    "Okigwe":           ["Okigwe"],
    "Onuimo":           ["Onuimo"],
    "Orlu":             ["Orlu"],
    "Orsu":             ["Orsu"],
    "Oru East":         ["Oru East"],
    "Oru West":         ["Mgbidi"],
    "Owerri Municipal": ["Owerri", "Aladinma", "GRA", "World Bank"],
    "Owerri North":     ["Owerri", "Avu"],
    "Owerri West":      ["Owerri", "Oguta Road"],
  },

  "Jigawa": {
    "Auyo":             ["Auyo"],
    "Babura":           ["Babura"],
    "Biriniwa":         ["Biriniwa"],
    "Birnin Kudu":      ["Birnin Kudu"],
    "Buji":             ["Buji"],
    "Dutse":            ["Dutse", "GRA", "New Layout"],
    "Gagarawa":         ["Gagarawa"],
    "Garki":            ["Garki"],
    "Gumel":            ["Gumel"],
    "Guri":             ["Guri"],
    "Gwaram":           ["Gwaram"],
    "Gwiwa":            ["Gwiwa"],
    "Hadejia":          ["Hadejia"],
    "Jahun":            ["Jahun"],
    "Kafin Hausa":      ["Kafin Hausa"],
    "Kaugama":          ["Kaugama"],
    "Kazaure":          ["Kazaure"],
    "Kiri Kasama":      ["Kiri Kasama"],
    "Kiyawa":           ["Kiyawa"],
    "Maigatari":        ["Maigatari"],
    "Malam Madori":     ["Malam Madori"],
    "Miga":             ["Miga"],
    "Ringim":           ["Ringim"],
    "Roni":             ["Roni"],
    "Sule Tankarkar":   ["Sule Tankarkar"],
    "Taura":            ["Taura"],
    "Yankwashi":        ["Yankwashi"],
  },

  "Kaduna": {
    "Birnin Gwari":     ["Birnin Gwari"],
    "Chikun":           ["Chikun", "Kakuri"],
    "Giwa":             ["Giwa"],
    "Igabi":            ["Igabi", "Rigasa"],
    "Ikara":            ["Ikara"],
    "Jaba":             ["Jaba", "Kwoi"],
    "Jema'a":           ["Kafanchan"],
    "Kachia":           ["Kachia"],
    "Kaduna North":     ["Kaduna", "Rigasa", "Kawo", "Malali", "Ungwan Rimi"],
    "Kaduna South":     ["Kaduna", "Barnawa", "Television", "Tudun Wada", "Gonin Gora"],
    "Kagarko":          ["Kagarko"],
    "Kajuru":           ["Kajuru"],
    "Kaura":            ["Kaura", "Kagoro"],
    "Kauru":            ["Kauru"],
    "Kubau":            ["Kubau"],
    "Kudan":            ["Kudan"],
    "Lere":             ["Lere"],
    "Makarfi":          ["Makarfi"],
    "Sabon Gari":       ["Sabon Gari", "Zaria Road"],
    "Sanga":            ["Sanga"],
    "Soba":             ["Soba"],
    "Zangon Kataf":     ["Zangon Kataf", "Zonkwa"],
    "Zaria":            ["Zaria", "Sabon Gari", "Samaru", "Kwarbai", "Tudun Wada"],
  },

  "Kano": {
    "Ajingi":           ["Ajingi"],
    "Albasu":           ["Albasu"],
    "Bagwai":           ["Bagwai"],
    "Bebeji":           ["Bebeji"],
    "Bichi":            ["Bichi"],
    "Bunkure":          ["Bunkure"],
    "Dala":             ["Kano", "Dala", "Gyadi-Gyadi"],
    "Dambatta":         ["Dambatta"],
    "Dawakin Kudu":     ["Dawakin Kudu"],
    "Dawakin Tofa":     ["Dawakin Tofa"],
    "Doguwa":           ["Doguwa"],
    "Fagge":            ["Kano", "Fagge"],
    "Gabasawa":         ["Gabasawa"],
    "Garko":            ["Garko"],
    "Garun Mallam":     ["Garun Mallam"],
    "Gaya":             ["Gaya"],
    "Gezawa":           ["Gezawa"],
    "Gwale":            ["Kano", "Gwale"],
    "Gwarzo":           ["Gwarzo"],
    "Kabo":             ["Kabo"],
    "Kano Municipal":   ["Kano", "Sabon Gari", "Bompai", "Zoo Road", "Nasarawa"],
    "Karaye":           ["Karaye"],
    "Kibiya":           ["Kibiya"],
    "Kiru":             ["Kiru"],
    "Kumbotso":         ["Kumbotso"],
    "Kunchi":           ["Kunchi"],
    "Kura":             ["Kura"],
    "Madobi":           ["Madobi"],
    "Makoda":           ["Makoda"],
    "Minjibir":         ["Minjibir"],
    "Nasarawa":         ["Kano", "Nasarawa"],
    "Rano":             ["Rano"],
    "Rimin Gado":       ["Rimin Gado"],
    "Rogo":             ["Rogo"],
    "Shanono":          ["Shanono"],
    "Sumaila":          ["Sumaila"],
    "Takai":            ["Takai"],
    "Tarauni":          ["Kano", "Tarauni"],
    "Tofa":             ["Tofa"],
    "Tsanyawa":         ["Tsanyawa"],
    "Tudun Wada":       ["Tudun Wada"],
    "Ungogo":           ["Ungogo"],
    "Warawa":           ["Warawa"],
    "Wudil":            ["Wudil"],
  },

  "Katsina": {
    "Bakori":           ["Bakori"],
    "Batagarawa":       ["Batagarawa"],
    "Batsari":          ["Batsari"],
    "Baure":            ["Baure"],
    "Bindawa":          ["Bindawa"],
    "Charanchi":        ["Charanchi"],
    "Dan Musa":         ["Dan Musa"],
    "Dandume":          ["Dandume"],
    "Danja":            ["Danja"],
    "Daura":            ["Daura"],
    "Dutsi":            ["Dutsi"],
    "Dutsin Ma":        ["Dutsin Ma"],
    "Faskari":          ["Faskari"],
    "Funtua":           ["Funtua", "Sabon Gari"],
    "Ingawa":           ["Ingawa"],
    "Jibia":            ["Jibia"],
    "Kafur":            ["Kafur"],
    "Kaita":            ["Kaita"],
    "Kankara":          ["Kankara"],
    "Kankia":           ["Kankia"],
    "Katsina":          ["Katsina", "GRA", "Kofar Kaura", "Housing Estate"],
    "Kurfi":            ["Kurfi"],
    "Kusada":           ["Kusada"],
    "Mai'Adua":         ["Mai'Adua"],
    "Malumfashi":       ["Malumfashi"],
    "Mani":             ["Mani"],
    "Mashi":            ["Mashi"],
    "Matazu":           ["Matazu"],
    "Musawa":           ["Musawa"],
    "Rimi":             ["Rimi"],
    "Sabuwa":           ["Sabuwa"],
    "Safana":           ["Safana"],
    "Sandamu":          ["Sandamu"],
    "Zango":            ["Zango"],
  },

  "Kebbi": {
    "Aleiro":           ["Aleiro"],
    "Arewa Dandi":      ["Arewa Dandi"],
    "Argungu":          ["Argungu"],
    "Augie":            ["Augie"],
    "Bagudo":           ["Bagudo"],
    "Birnin Kebbi":     ["Birnin Kebbi", "GRA", "Tudun Wada", "Nasarawa"],
    "Bunza":            ["Bunza"],
    "Dandi":            ["Dandi"],
    "Fakai":            ["Fakai"],
    "Gwandu":           ["Gwandu"],
    "Jega":             ["Jega"],
    "Kalgo":            ["Kalgo"],
    "Koko/Besse":       ["Koko"],
    "Maiyama":          ["Maiyama"],
    "Ngaski":           ["Ngaski"],
    "Sakaba":           ["Sakaba"],
    "Shanga":           ["Shanga"],
    "Suru":             ["Suru"],
    "Wasagu/Danko":     ["Wasagu"],
    "Yauri":            ["Yauri"],
    "Zuru":             ["Zuru"],
  },

  "Kogi": {
    "Adavi":            ["Adavi", "Okene"],
    "Ajaokuta":         ["Ajaokuta"],
    "Ankpa":            ["Ankpa"],
    "Bassa":            ["Bassa"],
    "Dekina":           ["Dekina"],
    "Ibaji":            ["Ibaji"],
    "Idah":             ["Idah"],
    "Igalamela Odolu":  ["Igalamela"],
    "Ijumu":            ["Ijumu"],
    "Kabba/Bunu":       ["Kabba"],
    "Kogi":             ["Kogi"],
    "Lokoja":           ["Lokoja", "Adankolo", "Gangare", "New Layout", "Felele"],
    "Mopa Muro":        ["Mopa"],
    "Ofu":              ["Ofu"],
    "Ogori/Magongo":    ["Ogori"],
    "Okehi":            ["Okehi"],
    "Okene":            ["Okene"],
    "Olamaboro":        ["Olamaboro"],
    "Omala":            ["Omala"],
    "Yagba East":       ["Yagba", "Isanlu"],
    "Yagba West":       ["Yagba", "Ogbe"],
  },

  "Kwara": {
    "Asa":              ["Asa"],
    "Baruten":          ["Baruten", "Kaiama"],
    "Edu":              ["Edu", "Lafiagi"],
    "Ifelodun":         ["Ifelodun", "Share"],
    "Ilorin East":      ["Ilorin", "Oke-Oyi", "Offa Garage"],
    "Ilorin South":     ["Ilorin", "Agbeyangi", "Muritala"],
    "Ilorin West":      ["Ilorin", "GRA", "Fate", "Tanke", "Surulere"],
    "Irepodun":         ["Irepodun", "Omu Aran"],
    "Isin":             ["Isin", "Owu"],
    "Kaiama":           ["Kaiama"],
    "Moro":             ["Moro", "Shao"],
    "Offa":             ["Offa"],
    "Oke Ero":          ["Oke Ero", "Ijan"],
    "Oyun":             ["Oyun", "Offa"],
    "Pategi":           ["Pategi"],
    "Ilorin":           ["Ilorin", "GRA", "Tanke", "Fate", "Adewole"],
  },

  "Lagos": {
    "Agege":            ["Agege", "Orile-Agege", "Ifako"],
    "Ajeromi/Ifelodun": ["Ajegunle", "Kirikiri"],
    "Alimosho":         ["Egbeda", "Ikotun", "Ijegun", "Igando", "Ayobo", "Ipaja"],
    "Amuwo-Odofin":     ["Festac Town", "Mile 2", "Ago Palace", "Apple Junction"],
    "Apapa":            ["Apapa", "GRA", "Olodi", "Iganmu"],
    "Badagry":          ["Badagry", "Ajara", "Topo"],
    "Epe":              ["Epe", "Itoikin"],
    "Eti-Osa":          ["Victoria Island", "Lekki Phase 1", "Lekki Phase 2", "Ajah", "Chevron"],
    "Ibeju-Lekki":      ["Ibeju", "Lekki", "Epe Road"],
    "Ifako-Ijaiye":     ["Ifako", "Ijaiye", "Agbado"],
    "Ikeja":            ["Ikeja", "Allen Avenue", "GRA", "Maryland", "Oregun", "Alausa"],
    "Ikorodu":          ["Ikorodu", "Imota", "Ijede", "Igbogbo", "Bayeku"],
    "Kosofe":           ["Ketu", "Ojota", "Ikosi", "Mile 12", "Oworo"],
    "Lagos Island":     ["Lagos Island", "Isale-Eko", "Marina", "Idumota"],
    "Lagos Mainland":   ["Yaba", "Ebute Meta", "Oyingbo", "Sabo", "Iwaya"],
    "Mushin":           ["Mushin", "Idi-Araba", "Papa Ajao", "New Garage"],
    "Ojo":              ["Ojo", "Iba", "Ijanikin"],
    "Oshodi/Isolo":     ["Oshodi", "Isolo", "Ejigbo", "Ilasamaja"],
    "Shomolu":          ["Shomolu", "Bariga", "Gbagada"],
    "Surulere":         ["Surulere", "Bode Thomas", "Ojuelegba", "Aguda", "Eric Moore"],
  },

  "Nasarawa": {
    "Akwanga":          ["Akwanga"],
    "Awe":              ["Awe"],
    "Doma":             ["Doma"],
    "Karu":             ["Karu", "Mararaba", "Nyanya"],
    "Keana":            ["Keana"],
    "Keffi":            ["Keffi", "Sabon Gari", "New Layout"],
    "Kokona":           ["Kokona"],
    "Lafia":            ["Lafia", "GRA", "New Market"],
    "Nasarawa":         ["Nasarawa"],
    "Nasarawa Egon":    ["Nasarawa Egon"],
    "Obi":              ["Obi"],
    "Toto":             ["Toto"],
    "Wamba":            ["Wamba"],
  },

  "Niger": {
    "Agaie":            ["Agaie"],
    "Agwara":           ["Agwara"],
    "Bida":             ["Bida"],
    "Borgu":            ["Borgu", "New Bussa"],
    "Bosso":            ["Minna", "Bosso Estate"],
    "Chanchaga":        ["Minna", "GRA", "Kpakungu", "Maitumbi", "Tunga"],
    "Edati":            ["Edati"],
    "Gbako":            ["Gbako"],
    "Gurara":           ["Gurara"],
    "Katcha":           ["Katcha"],
    "Kontagora":        ["Kontagora"],
    "Lapai":            ["Lapai"],
    "Lavun":            ["Lavun"],
    "Magama":           ["Magama"],
    "Mariga":           ["Mariga"],
    "Mashegu":          ["Mashegu"],
    "Mokwa":            ["Mokwa"],
    "Moya":             ["Moya"],
    "Paikoro":          ["Paikoro"],
    "Rafi":             ["Rafi"],
    "Rijau":            ["Rijau"],
    "Shiroro":          ["Shiroro"],
    "Suleja":           ["Suleja", "Madala"],
    "Tafa":             ["Tafa"],
    "Wushishi":         ["Wushishi"],
  },

  "Ogun": {
    "Abeokuta North":   ["Abeokuta", "Lafenwa", "Panseke", "Iberekodo"],
    "Abeokuta South":   ["Abeokuta", "Oke-Ilewo", "Adatan", "Asero"],
    "Ado-Odo/Ota":      ["Ota", "Sango-Ota", "Agbara", "Ado-Odo"],
    "Egbado North":     ["Ilaro"],
    "Egbado South":     ["Ilaro", "Idiroko"],
    "Ewekoro":          ["Ewekoro"],
    "Ifo":              ["Ifo", "Sango-Ota"],
    "Ijebu East":       ["Ijebu East", "Epe"],
    "Ijebu North":      ["Ijebu North", "Ijebu Igbo"],
    "Ijebu North East": ["Ijebu North East"],
    "Ijebu Ode":        ["Ijebu Ode"],
    "Ikenne":           ["Ikenne", "Sagamu", "Remo North"],
    "Imeko Afon":       ["Imeko"],
    "Ipokia":           ["Ipokia"],
    "Obafemi Owode":    ["Owode", "Sagamu Road"],
    "Odeda":            ["Odeda"],
    "Odogbolu":         ["Odogbolu"],
    "Ogun Waterside":   ["Ogun Waterside"],
    "Remo North":       ["Remo North", "Sagamu"],
    "Shagamu":          ["Sagamu", "Makun"],
  },

  "Ondo": {
    "Akoko North East": ["Ikare"],
    "Akoko North West": ["Okeagbe"],
    "Akoko South East": ["Isua Akoko"],
    "Akoko South West": ["Oka Akoko"],
    "Akure North":      ["Akure", "Oba-Ile", "Igoba"],
    "Akure South":      ["Akure", "GRA", "Alagbaka", "FUTA Road"],
    "Ese Odo":          ["Ese Odo"],
    "Idanre":           ["Idanre"],
    "Ifedore":          ["Ifedore", "Igbara-Oke"],
    "Ilaje":            ["Ilaje", "Igbokoda"],
    "Ile Oluji/Okeigbo":["Ile Oluji"],
    "Irele":            ["Irele"],
    "Odigbo":           ["Ore"],
    "Okitipupa":        ["Okitipupa"],
    "Ondo East":        ["Ondo"],
    "Ondo West":        ["Ondo"],
    "Ose":              ["Ose"],
    "Owo":              ["Owo"],
  },

  "Osun": {
    "Aiyedade":         ["Aiyedade"],
    "Aiyedire":         ["Aiyedire"],
    "Atakumosa East":   ["Atakumosa"],
    "Atakumosa West":   ["Atakumosa"],
    "Boluwaduro":       ["Boluwaduro"],
    "Boripe":           ["Boripe", "Ikirun"],
    "Ede North":        ["Ede"],
    "Ede South":        ["Ede"],
    "Egbedore":         ["Egbedore"],
    "Ejigbo":           ["Ejigbo"],
    "Ife Central":      ["Ile-Ife", "Lagere", "Mayfair"],
    "Ife East":         ["Ile-Ife"],
    "Ife North":        ["Ile-Ife"],
    "Ife South":        ["Ile-Ife"],
    "Ifedayo":          ["Ifedayo"],
    "Ifelodun":         ["Ifelodun", "Ikirun"],
    "Ila":              ["Ila Orangun"],
    "Ilesa East":       ["Ilesa"],
    "Ilesa West":       ["Ilesa"],
    "Irepodun":         ["Irepodun"],
    "Irewole":          ["Ikire"],
    "Isokan":           ["Isokan"],
    "Iwo":              ["Iwo"],
    "Obokun":           ["Obokun"],
    "Odo Otin":         ["Odo Otin"],
    "Ola Oluwa":        ["Ola Oluwa"],
    "Olorunda":         ["Osogbo", "Oke-Baale", "GRA", "Station Road"],
    "Oriade":           ["Oriade"],
    "Orolu":            ["Orolu"],
    "Osogbo":           ["Osogbo", "Alekuwodo", "Ogo-Oluwa"],
  },

  "Oyo": {
    "Afijio":           ["Afijio"],
    "Akinyele":         ["Moniya", "Akinyele"],
    "Atiba":            ["Oyo", "New Oyo"],
    "Atisbo":           ["Atisbo"],
    "Egbeda":           ["Egbeda", "Akobo", "Basorun"],
    "Ibadan North":     ["Ibadan", "Agodi", "Mokola", "Bodija", "Oke-Ado"],
    "Ibadan North East":["Ibadan", "Challenge", "New Ife Road", "Ring Road"],
    "Ibadan North West":["Ibadan", "Oke-Are", "Gbaremu"],
    "Ibadan South East":["Ibadan", "Iyaganku GRA", "Agodi GRA", "Gbagi"],
    "Ibadan South West":["Ibadan", "Iyaganku", "Ring Road", "Bashorun"],
    "Ibarapa Central":  ["Igbo-Ora"],
    "Ibarapa East":     ["Lanlate"],
    "Ibarapa North":    ["Ibarapa North"],
    "Ido":              ["Ido"],
    "Irepo":            ["Kishi"],
    "Iseyin":           ["Iseyin"],
    "Itesiwaju":        ["Itesiwaju"],
    "Iwajowa":          ["Iwere-Ile"],
    "Kajola":           ["Okeho"],
    "Lagelu":           ["Lagelu", "Iyana-Church"],
    "Ogbomosho North":  ["Ogbomoso"],
    "Ogbomosho South":  ["Ogbomoso"],
    "Ogo Oluwa":        ["Ogo Oluwa"],
    "Olorunsogo":       ["Olorunsogo"],
    "Oluyole":          ["Ibadan", "Oluyole Estate", "Idi-Ayunre"],
    "Ona Ara":          ["Ona Ara", "Akanran"],
    "Orelope":          ["Orelope"],
    "Ori Ire":          ["Ori Ire"],
    "Oyo East":         ["Oyo"],
    "Oyo West":         ["Oyo", "Owode"],
    "Saki East":        ["Saki"],
    "Saki West":        ["Saki"],
    "Surulere":         ["Surulere (Oyo)"],
  },

  "Plateau": {
    "Barikin Ladi":     ["Barikin Ladi"],
    "Bassa":            ["Bassa"],
    "Bokkos":           ["Bokkos"],
    "Jos East":         ["Jos", "Barkin Ladi Road"],
    "Jos North":        ["Jos", "Bauchi Road", "Terminus", "Farin Gada", "GRA"],
    "Jos South":        ["Bukuru", "Rantya", "Gyel", "Kuru"],
    "Kanam":            ["Kanam", "Shendam"],
    "Kanke":            ["Kanke"],
    "Langtang North":   ["Langtang"],
    "Langtang South":   ["Langtang"],
    "Mangu":            ["Mangu"],
    "Mikang":           ["Mikang"],
    "Pankshin":         ["Pankshin"],
    "Qua'an Pan":       ["Shendam"],
    "Riyom":            ["Riyom"],
    "Shendam":          ["Shendam"],
    "Wase":             ["Wase"],
  },

  "Rivers": {
    "Abua/Odual":       ["Abua"],
    "Ahoada East":      ["Ahoada"],
    "Ahoada West":      ["Ahoada"],
    "Akuku-Toru":       ["Abonnema"],
    "Andoni":           ["Andoni"],
    "Asari-Toru":       ["Buguma"],
    "Bonny":            ["Bonny"],
    "Degema":           ["Degema"],
    "Eleme":            ["Eleme", "Ogale", "Aleto"],
    "Emuoha":           ["Emuoha"],
    "Etche":            ["Etche", "Okehi"],
    "Gokana":           ["Kpor"],
    "Ikwerre":          ["Ikwerre", "Rumuola"],
    "Khana":            ["Bori"],
    "Obio/Akpor":       ["Rumuola", "Rumuokoro", "Rukpokwu", "Eliozu", "Rumuibekwe"],
    "Ogba/Egbema/Ndoni":["Omoku"],
    "Ogu/Bolo":         ["Ogu"],
    "Okrika":           ["Okrika"],
    "Omuma":            ["Omuma"],
    "Opobo/Nkoro":      ["Opobo"],
    "Oyigbo":           ["Oyigbo"],
    "Port Harcourt":    ["Port Harcourt", "GRA", "Old GRA", "Mile 3", "Trans-Amadi", "Diobu", "Creek Road"],
    "Tai":              ["Tai"],
  },

  "Sokoto": {
    "Binji":            ["Binji"],
    "Bodinga":          ["Bodinga"],
    "Dange Shuni":      ["Dange Shuni"],
    "Gada":             ["Gada"],
    "Goronyo":          ["Goronyo"],
    "Gudu":             ["Gudu"],
    "Gwadabawa":        ["Gwadabawa"],
    "Illela":           ["Illela"],
    "Isa":              ["Isa"],
    "Kebbe":            ["Kebbe"],
    "Kware":            ["Kware"],
    "Rabah":            ["Rabah"],
    "Sabon Birni":      ["Sabon Birni"],
    "Shagari":          ["Shagari"],
    "Silame":           ["Silame"],
    "Sokoto North":     ["Sokoto", "Gawon Nama", "Mabera", "GRA"],
    "Sokoto South":     ["Sokoto", "Arkilla", "Dundaye"],
    "Tambuwal":         ["Tambuwal"],
    "Tangaza":          ["Tangaza"],
    "Tureta":           ["Tureta"],
    "Wamako":           ["Wamako"],
    "Wurno":            ["Wurno"],
    "Yabo":             ["Yabo"],
  },

  "Taraba": {
    "Ardo Kola":        ["Ardo Kola"],
    "Bali":             ["Bali"],
    "Donga":            ["Donga"],
    "Gashaka":          ["Gashaka"],
    "Gassol":           ["Gassol"],
    "Ibi":              ["Ibi"],
    "Jalingo":          ["Jalingo", "GRA", "New Layout", "Barade"],
    "Karim Lamido":     ["Karim Lamido"],
    "Kumi":             ["Kumi"],
    "Lau":              ["Lau"],
    "Sardauna":         ["Sardauna", "Gembu"],
    "Takum":            ["Takum"],
    "Ussa":             ["Ussa"],
    "Wukari":           ["Wukari"],
    "Yorro":            ["Yorro"],
    "Zing":             ["Zing"],
  },

  "Yobe": {
    "Bade":             ["Bade", "Gashua"],
    "Bursari":          ["Bursari"],
    "Damaturu":         ["Damaturu", "GRA", "Pompomari"],
    "Fika":             ["Fika"],
    "Fune":             ["Fune"],
    "Geidam":           ["Geidam"],
    "Gujba":            ["Gujba"],
    "Gulani":           ["Gulani"],
    "Jakusko":          ["Jakusko"],
    "Karasuwa":         ["Karasuwa"],
    "Machina":          ["Machina"],
    "Nangere":          ["Nangere"],
    "Nguru":            ["Nguru"],
    "Potiskum":         ["Potiskum"],
    "Tarmuwa":          ["Tarmuwa"],
    "Yunusari":         ["Yunusari"],
    "Yusufari":         ["Yusufari"],
  },

  "Zamfara": {
    "Anka":             ["Anka"],
    "Bakura":           ["Bakura"],
    "Birnin Magaji/Kiyaw":["Birnin Magaji"],
    "Bukkuyum":         ["Bukkuyum"],
    "Bungudu":          ["Bungudu"],
    "Gummi":            ["Gummi"],
    "Gusau":            ["Gusau", "GRA", "Sabon Gari", "Tudun Wada"],
    "Kaura Namoda":     ["Kaura Namoda"],
    "Maradun":          ["Maradun"],
    "Maru":             ["Maru"],
    "Shinkafi":         ["Shinkafi"],
    "Talata Mafara":    ["Talata Mafara"],
    "Tsafe":            ["Tsafe"],
    "Wurno":            ["Wurno"],
    "Zurmi":            ["Zurmi"],
  },
};

// ── Exports ──────────────────────────────────────────────────

export const STATES = Object.keys(NIGERIA_ADDRESS_DATA).sort();

export function getLGAs(state) {
  if (!state || !NIGERIA_ADDRESS_DATA[state]) return [];
  return Object.keys(NIGERIA_ADDRESS_DATA[state]).sort();
}

export function getCities(state, lga) {
  if (!state || !lga) return [];
  return NIGERIA_ADDRESS_DATA[state]?.[lga] || [];
}

// Towns are same as cities in this structure (cities ARE the towns within the LGA)
// For street-level granularity the user types it in manually
export function getTowns(state, lga, city) {
  // Return empty — towns are already the leaf level (cities within LGAs)
  return [];
}
import { useState, useCallback } from 'react';
import { STATES, getLGAs, getCities } from '../data/nigeriaAddressData';

export function useNigeriaAddress(initial = {}) {
  const [address, setAddress] = useState({
    state:    initial.state    || '',
    lga:      initial.lga      || '',
    city:     initial.city     || '',
    street:   initial.street   || '',
    street2:  initial.street2  || '',
    landmark: initial.landmark || '',
    postcode: initial.postcode || '',
  });

  const handleStateChange = useCallback((e) => {
    setAddress((p) => ({ ...p, state: e.target.value, lga: '', city: '' }));
  }, []);

  const handleLGAChange = useCallback((e) => {
    setAddress((p) => ({ ...p, lga: e.target.value, city: '' }));
  }, []);

  const handleCityChange   = useCallback((e) => setAddress((p) => ({ ...p, city:     e.target.value })), []);
  const handleStreetChange = useCallback((e) => setAddress((p) => ({ ...p, street:   e.target.value })), []);
  const handleStreet2Change= useCallback((e) => setAddress((p) => ({ ...p, street2:  e.target.value })), []);
  const handleLandmarkChange=useCallback((e) => setAddress((p) => ({ ...p, landmark: e.target.value })), []);
  const handlePostcodeChange=useCallback((e) => setAddress((p) => ({ ...p, postcode: e.target.value })), []);
  const resetAddress       = useCallback(() =>
    setAddress({ state:'', lga:'', city:'', street:'', street2:'', landmark:'', postcode:'' }), []);
  const setAddressValues   = useCallback((v) => setAddress((p) => ({ ...p, ...v })), []);

  const lgas   = getLGAs(address.state);
  const cities = getCities(address.state, address.lga);

  const fullAddress = [
    address.street,
    address.street2,
    address.city,
    address.lga,
    address.state,
    address.postcode,
    'Nigeria',
  ].filter(Boolean).join(', ');

  const isAddressComplete = Boolean(
    address.state && address.lga && address.city && address.street.trim().length >= 3
  );

  return {
    address,
    handlers: {
      handleStateChange, handleLGAChange, handleCityChange,
      handleStreetChange, handleStreet2Change, handleLandmarkChange,
      handlePostcodeChange, resetAddress, setAddressValues,
    },
    derived: {
      states: STATES,
      lgas,
      cities,
      fullAddress,
      isAddressComplete,
    },
  };
}
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;
let _socket = null;

function getSocket() {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 20,
      reconnectionDelay: 1500,
      timeout: 10000,
    });
    _socket.on("connect",       () => console.log("[socket] connected:", _socket.id));
    _socket.on("disconnect",    (r) => console.log("[socket] disconnected:", r));
    _socket.on("connect_error", (e) => console.warn("[socket] connect_error:", e.message));
  }
  return _socket;
}

export function useSocket(userId, callbacks = {}) {
  const cbRef     = useRef(callbacks);
  const idleTimer = useRef(null);

  // Always keep latest callbacks — no stale closures ever
  useEffect(() => { cbRef.current = callbacks; });

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    // ── Join room exactly once per mount ────────────────────
    // "connect" fires once on first connection.
    // "reconnect" (manager event) fires on subsequent reconnections.
    const doJoin = () => {
      socket.emit("join", userId);
      console.log("[socket] join →", userId);
    };

    if (socket.connected) {
      doJoin();                          // already connected — join immediately
    } else {
      socket.once("connect", doJoin);    // wait for first connection
    }

    // Re-join only on REconnects (not the first connect — handled above)
    const onReconnect = () => {
      console.log("[socket] reconnect — re-joining:", userId);
      doJoin();
    };
    socket.io.on("reconnect", onReconnect);   // manager-level event, fires only on re-connects

    // ── Event handlers ──────────────────────────────────────
    const onMessage   = (msg)  => cbRef.current.onMessage?.(msg);
    const onStatus    = (data) => cbRef.current.onStatus?.(data);
    const onPinged    = (data) => { console.log("[socket] pinged:", data); cbRef.current.onPinged?.(data); };
    const onCleared   = ()     => cbRef.current.onChatCleared?.();

    socket.on("newMessage",  onMessage);
    socket.on("userStatus",  onStatus);
    socket.on("pinged",      onPinged);
    socket.on("chatCleared", onCleared);

    // ── Idle detection ──────────────────────────────────────
    const resetIdle = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => socket.emit("idle", userId), 3 * 60 * 1000);
    };
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown",   resetIdle);
    resetIdle();

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      socket.off("connect",     doJoin);
      socket.io.off("reconnect", onReconnect);
      socket.off("newMessage",  onMessage);
      socket.off("userStatus",  onStatus);
      socket.off("pinged",      onPinged);
      socket.off("chatCleared", onCleared);
      clearTimeout(idleTimer.current);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown",   resetIdle);
    };
  }, [userId]);

  const pingUser = useCallback((targetId, adminName) => {
    console.log("[socket] ping_user → targetId:", targetId);
    getSocket().emit("ping_user", { targetId, adminName });
  }, []);

  return { pingUser };
}
const BASE_URL = import.meta.env.VITE_API_URL;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

// ── Auth ─────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const registerUser = async ({ fullName, email, password, role }) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password, role }),
  });
  return handleResponse(res);
};

// ── Records ──────────────────────────────────────────────────
export const submitRecord = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/api/records`, {
    method: "POST", headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// ── Admin ────────────────────────────────────────────────────
export const getAdminRecords = async (token) =>
  handleResponse(await fetch(`${BASE_URL}/api/admin/records`, { headers: authHeaders(token) }));

export const getUsers = async (token) =>
  handleResponse(await fetch(`${BASE_URL}/api/admin/users`, { headers: authHeaders(token) }));

export const deleteUser = async (token, userId) =>
  handleResponse(await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
    method: "DELETE", headers: authHeaders(token),
  }));

export const updateUserRole = async (token, userId, role) =>
  handleResponse(await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
    method: "PUT", headers: authHeaders(token),
    body: JSON.stringify({ role }),
  }));

export const exportRecordsExcel = (token) => {
  fetch(`${BASE_URL}/api/admin/records/export`, { headers: authHeaders(token) })
    .then((res) => res.blob())
    .then((blob) => {
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BHF_Records_${Date.now()}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    });
};

export const exportUsersExcel = (token) => {
  fetch(`${BASE_URL}/api/admin/users/export`, { headers: authHeaders(token) })
    .then((res) => res.blob())
    .then((blob) => {
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BHF_Users_${Date.now()}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    });
};

// ── Chat ─────────────────────────────────────────────────────
export const getMessages = async (token, userId) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/messages/${userId}`, { headers: authHeaders(token) }));

export const sendMessage = async (token, { receiverId, content, type = "message" }) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/messages`, {
    method: "POST", headers: authHeaders(token),
    body: JSON.stringify({ receiverId, content, type }),
  }));

export const getUnreadCount = async (token) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/messages/unread/count`, { headers: authHeaders(token) }));

export const getAdminConversations = async (token) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/admin/conversations`, { headers: authHeaders(token) }));

export const getAdminId = async (token) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/admin/id`, { headers: authHeaders(token) }));

export const clearChat = async (token, userId) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/messages/clear/${userId}`, {
    method: "DELETE", headers: authHeaders(token),
  }));

export const updateStatus = async (token, status) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/status`, {
    method: "PUT", headers: authHeaders(token),
    body: JSON.stringify({ status }),
  }));

export const saveCookieConsent = async (token, accepted) =>
  handleResponse(await fetch(`${BASE_URL}/api/chat/cookie-consent`, {
    method: "PUT", headers: authHeaders(token),
    body: JSON.stringify({ accepted }),
  }));
  import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LandingPage    from "./components/Home";
import LoginPage      from "./components/LoginPage";
import Dashboard      from "./components/Dashboard";
import Step1          from "./components/Step1";
import Step2          from "./components/Step2";
import Success        from "./components/Success";
import AdminDashboard from "./components/AdminDashboard";
import NotFound       from "./pages/NotFound";
import Icon           from "./components/Icon";
import { useAuth }    from "./context/AuthContext";
import { submitRecord } from "./services/api";
import "./App.css";

// ── Protected route wrappers ──────────────────────────────────
function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user || user.role !== "Administrator") return <NotFound />;
  return children;
}

// ── i18n ──────────────────────────────────────────────────────
const headerText = {
  en: { badge: "DataGuardian", title: "Beneficiary Intake Form", sub: "Beyond Health Foundation — Secure, encrypted data collection for community health programs." },
  ha: { badge: "DataGuardian", title: "Fom na Amfanin Masu Amfani", sub: "Gidauniyar Lafiya ta BHF — Tattara bayanai lafiya da sirri." },
  yo: { badge: "DataGuardian", title: "Fọọmu Gbigba Oluranlọwọ", sub: "BHF — Gbigba data ti o ni aabo fun awọn eto ilera agbegbe." },
  ig: { badge: "DataGuardian", title: "Ụdị Natarị Onye Ọrụ", sub: "BHF — Nchịkọta data nchekwa maka mmemme ahụike obodo." },
  fr: { badge: "DataGuardian", title: "Formulaire d'Admission", sub: "BHF — Collecte de données sécurisée pour les programmes de santé communautaire." },
  ar: { badge: "DataGuardian", title: "استمارة قبول المستفيد", sub: "مؤسسة BHF — جمع بيانات آمن ومشفر لبرامج الصحة المجتمعية." },
};

const navText = {
  en: { next: "Next Step",        prev: "Previous",    submit: "Submit Record",    home: "Home",      logout: "Logout" },
  ha: { next: "Mataki na Gaba",   prev: "Baya",         submit: "Aika Bayani",      home: "Gida",      logout: "Fita" },
  yo: { next: "Igbesẹ Ti o Tẹle", prev: "Iṣaaju",      submit: "Firanṣẹ Igbasilẹ", home: "Ile",       logout: "Jade" },
  ig: { next: "Nzọụkwụ Ọzọ",      prev: "Nazaghachi",   submit: "Zipu Ndekọ",       home: "Ulo",       logout: "Pụọ" },
  fr: { next: "Étape Suivante",    prev: "Précédent",    submit: "Soumettre",        home: "Accueil",   logout: "Déconnexion" },
  ar: { next: "الخطوة التالية",    prev: "السابق",       submit: "إرسال السجل",      home: "الرئيسية",  logout: "خروج" },
};

const emptyForm = {
  firstName: "", lastName: "", gender: "", age: "",
  phone: "", address: "", volunteerName: "",
  bloodPressureSystolic: "", bloodPressureDiastolic: "",
  bloodSugar: "", weight: "", height: "", bmi: "",
};

// ── Form page (Step 1 + 2) ────────────────────────────────────
function FormPage({ lang, setLang }) {
  const { user, logout } = useAuth();
  const [currentStep,   setCurrentStep]   = useState(1);
  const [conditions,    setConditions]    = useState([]);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [formData,      setFormData]      = useState(emptyForm);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState("");
  const [done,          setDone]          = useState(false);

  const h     = headerText[lang] || headerText.en;
  const n     = navText[lang]    || navText.en;
  const isRTL = lang === "ar";

  const handleLogout = () => { logout(); window.location.href = "/"; };
  const nextStep     = () => { setCurrentStep(2); setDashboardOpen(false); };
  const prevStep     = () => { setCurrentStep(1); setDashboardOpen(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      await submitRecord(user?.token, {
        ...formData, conditions, lang,
        submittedAt: new Date().toISOString(),
      });
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Success
        setSubmitted={() => {
          setDone(false);
          setFormData(emptyForm);
          setConditions([]);
          setCurrentStep(1);
        }}
        lang={lang}
      />
    );
  }

  return (
    <div className="container" dir={isRTL ? "rtl" : "ltr"}>
      {dashboardOpen && (
        <div className="dashboard-overlay" onClick={() => setDashboardOpen(false)} />
      )}

      <Dashboard
        currentStep={currentStep}
        setCurrentStep={(s) => { setCurrentStep(s); setDashboardOpen(false); }}
        lang={lang}
        setLang={setLang}
        dashboardOpen={dashboardOpen}
        setDashboardOpen={setDashboardOpen}
        onBackToHome={() => { window.location.href = "/"; }}
      />

      <main className="main-content">
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setDashboardOpen(true)}>
            <Icon name="menu" size={20} />
          </button>
          <span className="mobile-brand">
            <Icon name="shield-plus" size={16} />
            BHF DataGuardian
          </span>
          <span className="mobile-step">{currentStep}/2</span>
        </div>

        <div className="form-top-row">
          <button className="back-to-home" onClick={() => { window.location.href = "/"; }}>
            <Icon name="arrow-left" size={15} />
            {n.home}
          </button>

          {user && (
            <div className="user-chip">
              <div className="user-chip-avatar">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="user-chip-info">
                <span className="user-chip-name">{user.fullName}</span>
                <span className="user-chip-role">{user.role}</span>
              </div>
              <button className="user-chip-logout" onClick={handleLogout} title={n.logout}>
                <Icon name="log-out" size={15} />
              </button>
            </div>
          )}
        </div>

        <header className="form-header">
          <div className="header-badge">{h.badge}</div>
          <h1>{h.title}</h1>
          <p className="subtitle">{h.sub}</p>
        </header>

        <form className="form-container" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <Step1 formData={formData} setFormData={setFormData} lang={lang} />
          )}
          {currentStep === 2 && (
            <Step2
              formData={formData}
              setFormData={setFormData}
              conditions={conditions}
              setConditions={setConditions}
              lang={lang}
            />
          )}

          {submitError && (
            <div className="submit-error">
              <Icon name="x" size={14} />
              {submitError}
            </div>
          )}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                <Icon name="arrow-left" size={18} className="btn-icon" />
                {n.prev}
              </button>
            )}
            {currentStep === 1 && (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                {n.next}
                <Icon name="arrow-right" size={18} className="btn-icon" />
              </button>
            )}
            {currentStep === 2 && (
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting
                  ? <><span className="login-spinner" />Saving...</>
                  : <>{n.submit} <Icon name="check" size={18} className="btn-icon" /></>
                }
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

// ── Root App with Routes ──────────────────────────────────────
export default function App() {
  const { user, ready } = useAuth();
  const [lang, setLang] = useState("en");

  if (!ready) return null;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={
        <LandingPage
          onStart={() => {
            if (!user) window.location.href = "/login";
            else if (user.role === "Administrator") window.location.href = "/admin";
            else window.location.href = "/dashboard";
          }}
          lang={lang}
          setLang={setLang}
        />
      } />

      <Route path="/login" element={
        user
          ? <Navigate to={user.role === "Administrator" ? "/admin" : "/dashboard"} replace />
          : <LoginPage
              onSuccess={(data) => {
                window.location.href = data.role === "Administrator" ? "/admin" : "/dashboard";
              }}
              onBack={() => { window.location.href = "/"; }}
              lang={lang}
            />
      } />

      {/* Protected: logged-in users */}
      <Route path="/dashboard" element={
        <RequireAuth>
          <FormPage lang={lang} setLang={setLang} />
        </RequireAuth>
      } />

      {/* Protected: admins only */}
      <Route path="/admin" element={
        <RequireAdmin>
          <AdminDashboard onBack={() => { window.location.href = "/"; }} />
        </RequireAdmin>
      } />

      <Route path="*" element={
        <NotFound onBack={() => { window.location.href = "/"; }} />
      } />
    </Routes>
  );
}
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ServerWake from "./components/ServerWake";
import FloatingChat from "./components/FloatingChat";
import CookieBanner from "./components/CookieBanner";
import App from "./App";
import "./App.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ServerWake>
        <App />
        <FloatingChat />
        <CookieBanner />
      </ServerWake>
    </AuthProvider>
  </BrowserRouter>
);

@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --primary:       #2563eb;
  --primary-h:     #1d4ed8;
  --primary-l:     #3b82f6;
  --bg:            #0a0a0a;
  --card:          #111111;
  --card-2:        #1a1a1a;
  --border:        #1f2937;
  --input:         #1a1a1a;
  --text:          #ffffff;
  --text-2:        #9ca3af;
  --text-3:        #6b7280;
  --success:       #10b981;
  --success-h:     #059669;
  --error:         #ef4444;
  --ease:          cubic-bezier(0.4, 0, 0.2, 1);
  --t:             all 0.3s var(--ease);
}

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

/* ── 2. SHARED UTILITIES ─────────────────────────────────── */

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-3); }

/* Inputs */
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-size: 0.875rem; font-weight: 500; color: var(--text-2); display: flex; align-items: center; gap: 0.25rem; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 1rem; width: 20px; height: 20px; color: var(--text-3); pointer-events: none; z-index: 2; }
.select-arrow { position: absolute; right: 1rem; width: 16px; height: 16px; color: var(--text-3); pointer-events: none; }

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text);
  font-size: 0.9375rem;
  font-family: inherit;
  transition: var(--t);
}
.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.input-group input::placeholder,
.input-group textarea::placeholder { color: var(--text-3); }
.input-group select { appearance: none; cursor: pointer; padding-right: 2.5rem; }
.input-group select option { background: var(--card); color: var(--text); }
.textarea-wrapper textarea { padding-left: 1rem; padding-top: 0.75rem; min-height: 120px; resize: vertical; }
input[readonly] { opacity: 0.9; cursor: default; font-weight: 600; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.875rem 1.5rem; border-radius: 0.5rem; font-size: 0.9375rem;
  font-weight: 600; cursor: pointer; border: none; transition: var(--t); font-family: inherit;
}
.btn-icon { width: 18px; height: 18px; }
.btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2); }
.btn-primary:hover { background: var(--primary-h); transform: translateY(-1px); box-shadow: 0 6px 12px -2px rgba(37,99,235,0.3); }
.btn-secondary { background: transparent; color: var(--text-2); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--input); color: var(--text); border-color: var(--text-3); }
.btn-success { background: var(--success); color: white; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.2); }
.btn-success:hover { background: var(--success-h); transform: translateY(-1px); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

.btn-hero-primary {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.875rem 1.75rem; background: linear-gradient(135deg, #10b981, #059669);
  color: white; border: none; border-radius: 0.625rem; font-size: 1rem;
  font-weight: 700; cursor: pointer; transition: var(--t); font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 20px rgba(16,185,129,0.3); position: relative;
}
.btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,0.4); }
.btn-hero-primary::before {
  content: ''; position: absolute; inset: -2px; border-radius: 0.75rem;
  background: linear-gradient(135deg, #10b981, #059669);
  opacity: 0; z-index: -1; transition: opacity 0.3s ease; filter: blur(8px);
}
.btn-hero-primary:hover::before { opacity: 0.5; }

.btn-hero-secondary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.875rem 1.5rem; background: transparent; color: var(--text-2);
  border: 1px solid var(--border); border-radius: 0.625rem; font-size: 1rem;
  font-weight: 600; cursor: pointer; text-decoration: none; transition: var(--t);
  font-family: 'DM Sans', sans-serif;
}
.btn-hero-secondary:hover { background: var(--card); color: var(--text); border-color: var(--text-3); }

/* Spinner */
.login-spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 0.4rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Tags */
.tags-input-container {
  background: var(--input); border: 1px solid var(--border); border-radius: 0.5rem;
  padding: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;
  min-height: 50px; align-items: center; cursor: text; transition: var(--t);
}
.tags-input-container:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.tags-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag {
  background: var(--primary); color: white; padding: 0.25rem 0.75rem;
  border-radius: 0.25rem; font-size: 0.875rem; display: flex; align-items: center;
  gap: 0.5rem; animation: tagPop 0.2s ease;
}
@keyframes tagPop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.tag-remove { cursor: pointer; opacity: 0.8; transition: var(--t); background: none; border: none; color: white; line-height: 0; }
.tag-remove:hover { opacity: 1; }
.tags-input { background: transparent; border: none; color: var(--text); flex: 1; min-width: 120px; padding: 0.25rem; font-size: 0.9375rem; }
.tags-input:focus { outline: none; }

/* Focus ring */
input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible {
  outline: 2px solid var(--primary); outline-offset: 2px;
}

/* ── 3. LANDING PAGE ─────────────────────────────────────── */
.landing {
  min-height: 100vh;
  background: var(--bg);
  overflow-x: hidden;
}

/* Nav */
.landing-nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(10,10,10,0.85); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.landing-nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 2rem;
  height: 64px; display: flex; align-items: center; gap: 2rem;
}
.landing-logo { display: flex; align-items: center; gap: 0.625rem; text-decoration: none; flex-shrink: 0; }
.landing-logo-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #0d9488, #10b981);
  border-radius: 9px; display: flex; align-items: center; justify-content: center;
  color: white; box-shadow: 0 0 16px rgba(16,185,129,0.35);
}
.landing-logo-text { display: flex; flex-direction: column; line-height: 1; }
.landing-logo-main { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
.landing-logo-sub { font-size: 0.65rem; color: #10b981; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.landing-nav-links { display: flex; gap: 0.25rem; flex: 1; }
.nav-link { padding: 0.4rem 0.875rem; color: var(--text-2); text-decoration: none; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; transition: var(--t); }
.nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); }
.landing-nav-right { display: flex; align-items: center; gap: 1rem; margin-left: auto; }

.lang-pills { display: flex; gap: 0.25rem; background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.2rem; }
.lang-pill { padding: 0.25rem 0.5rem; border: none; background: transparent; color: var(--text-3); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; border-radius: 0.25rem; cursor: pointer; transition: var(--t); font-family: inherit; }
.lang-pill:hover { color: var(--text); }
.lang-pill.active { background: var(--primary); color: white; }

.btn-nav-cta {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.125rem; background: var(--success); color: white;
  border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: var(--t); font-family: inherit; white-space: nowrap;
  position: relative; overflow: hidden;
}
.btn-nav-cta:hover { background: var(--success-h); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
.btn-nav-cta::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.15); transform: translateX(-100%); transition: transform 0.4s ease; }
.btn-nav-cta:hover::after { transform: translateX(100%); }

/* Hero */
.landing-hero {
  position: relative; min-height: 92vh; display: flex; align-items: center;
  max-width: 1200px; margin: 0 auto; padding: 5rem 2rem 4rem; gap: 4rem; overflow: hidden;
}
.hero-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px);
  background-size: 48px 48px; pointer-events: none;
  animation: gridDrift 20s linear infinite;
}
.hero-bg-glow {
  position: absolute; top: -100px; right: -100px; width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-bg-glow-2 {
  position: absolute; bottom: -80px; left: -80px; width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%);
  pointer-events: none;
}
.hero-content { flex: 1; position: relative; z-index: 2; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
  color: #10b981; border-radius: 999px; padding: 0.35rem 0.875rem;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 1.75rem;
}
.hero-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800; line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 1.5rem;
}
.hero-title-line1 { display: block; color: var(--text); }
.hero-title-line2 {
  display: block;
  background: linear-gradient(135deg, #10b981 0%, #0d9488 50%, #2563eb 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 1.0625rem; color: var(--text-2); line-height: 1.7; max-width: 520px; margin-bottom: 2.5rem; }
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

/* Hero floating card */
.hero-visual {
  flex-shrink: 0; position: relative; z-index: 2;
  animation: heroFadeUp 0.7s 0.2s ease both, floatCard 4s ease-in-out infinite;
}
.hero-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 1rem;
  padding: 1.25rem; width: 300px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.08);
}
.hero-card-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1.25rem; }
.hero-card-dot { width: 10px; height: 10px; border-radius: 50%; }
.hero-card-dot.green  { background: #10b981; }
.hero-card-dot.yellow { background: #f59e0b; }
.hero-card-dot.red    { background: #ef4444; }
.hero-card-title { font-size: 0.75rem; font-weight: 600; color: var(--text-3); margin-left: 0.25rem; letter-spacing: 0.05em; text-transform: uppercase; }
.hero-card-live { margin-left: auto; display: flex; align-items: center; gap: 0.3rem; font-size: 0.62rem; font-weight: 700; color: #10b981; letter-spacing: 0.08em; }
.live-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: livePulse 1.4s ease-in-out infinite; }
.hero-card-rows { display: flex; flex-direction: column; gap: 0.875rem; }
.hero-card-row {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 0.875rem; border-bottom: 1px solid rgba(255,255,255,0.04);
  border-radius: 0.375rem; transition: background 0.3s ease;
}
.hero-card-row:last-child { border-bottom: none; padding-bottom: 0; }
.hero-card-row.row-active { background: rgba(16,185,129,0.06); }
.hcr-label { font-size: 0.8rem; color: var(--text-3); }
.hcr-value { font-size: 0.825rem; font-weight: 600; }
.hcr-value.good { color: #10b981; }
.hcr-value.warn { color: #f59e0b; }
.hcr-value.muted { color: var(--text-2); }
.hero-card-footer {
  display: flex; align-items: center; gap: 0.4rem; margin-top: 1.25rem;
  padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.72rem; color: var(--text-3);
}
.hcf-timestamp { margin-left: auto; font-size: 0.68rem; color: var(--text-3); font-variant-numeric: tabular-nums; }
.card-progress-bar { height: 3px; background: rgba(255,255,255,0.05); border-radius: 999px; margin-top: 1rem; overflow: hidden; }
.card-progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #2563eb); border-radius: 999px; transition: width 0.25s ease; }
.footer-sync-badge {
  background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.35);
  color: #10b981; border-radius: 999px; font-size: 0.6rem; font-weight: 800;
  padding: 0.1rem 0.45rem; letter-spacing: 0.1em; animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

/* Stats bar */
.landing-stats {
  display: flex; justify-content: center;
  background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.stat-item { flex: 1; max-width: 220px; padding: 2.5rem 1.5rem; text-align: center; border-right: 1px solid var(--border); }
.stat-item:last-child { border-right: none; }
.stat-value { display: block; font-family: 'Sora', sans-serif; font-size: 2.25rem; font-weight: 800; color: #10b981; letter-spacing: -0.03em; margin-bottom: 0.35rem; font-variant-numeric: tabular-nums; }
.stat-label { font-size: 0.8rem; color: var(--text-3); font-weight: 500; letter-spacing: 0.03em; }

/* Features */
.landing-features { max-width: 1200px; margin: 0 auto; padding: 6rem 2rem; }
.section-header { text-align: center; margin-bottom: 3.5rem; }
.section-tag {
  display: inline-block; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.2);
  color: var(--primary-l); border-radius: 999px; padding: 0.25rem 0.875rem;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem;
}
.section-title-lg { font-family: 'Sora', sans-serif; font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 800; color: var(--text); letter-spacing: -0.025em; margin-bottom: 0.75rem; }
.section-sub { color: var(--text-2); font-size: 1rem; max-width: 500px; margin: 0 auto; line-height: 1.6; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
.feature-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 0.875rem;
  padding: 1.75rem; transition: var(--t); position: relative; overflow: hidden;
}
.feature-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(16,185,129,0.04), transparent);
  opacity: 0; transition: var(--t);
}
.feature-card::after {
  content: ''; position: absolute; top: -50%; left: -60%; width: 40%; height: 200%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
  transform: skewX(-15deg); transition: left 0.6s ease; pointer-events: none;
}
.feature-card:hover { border-color: rgba(16,185,129,0.25); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
.feature-card:hover::before { opacity: 1; }
.feature-card:hover::after { left: 130%; }
.feature-icon { width: 44px; height: 44px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; color: #10b981; margin-bottom: 1rem; }
.feature-title { font-family: 'Sora', sans-serif; font-size: 0.9375rem; font-weight: 700; color: var(--text); margin-bottom: 0.6rem; }
.feature-desc { font-size: 0.875rem; color: var(--text-2); line-height: 1.65; }

/* How it works */
.landing-how { background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6rem 2rem; }
.how-steps { display: flex; max-width: 1000px; margin: 0 auto; position: relative; }
.how-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 1.5rem; position: relative; }
.how-connector {
  position: absolute; top: 28px; right: -50%; width: 100%; height: 1px;
  background: linear-gradient(90deg, var(--border), rgba(16,185,129,0.3), var(--border)); z-index: 0;
}
.how-step-num {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05));
  border: 1px solid rgba(16,185,129,0.3); color: #10b981;
  font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.25rem; position: relative; z-index: 1; letter-spacing: 0.05em;
}
.how-step-content h3 { font-family: 'Sora', sans-serif; font-size: 0.9375rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
.how-step-content p { font-size: 0.825rem; color: var(--text-2); line-height: 1.6; }

/* CTA Banner */
.landing-cta-banner { padding: 6rem 2rem; text-align: center; }
.cta-banner-inner { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
.cta-banner-icons {
  width: 72px; height: 72px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin-bottom: 0.5rem; position: relative;
}
.cta-banner-icons::before,
.cta-banner-icons::after { content: ''; position: absolute; inset: -8px; border-radius: 50%; border: 1px solid rgba(16,185,129,0.2); animation: ringPulse 2.5s ease-in-out infinite; }
.cta-banner-icons::after { inset: -16px; animation-delay: 0.5s; }
.landing-cta-banner h2 { font-family: 'Sora', sans-serif; font-size: 2rem; font-weight: 800; color: var(--text); letter-spacing: -0.025em; }
.landing-cta-banner p { color: var(--text-2); font-size: 1rem; line-height: 1.6; }

/* Footer */
.landing-footer { background: var(--card); border-top: 1px solid var(--border); padding: 3rem 2rem; }
.landing-footer-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.875rem; text-align: center; }
.footer-tagline { color: var(--text-2); font-size: 0.875rem; }
.footer-rights { color: var(--text-3); font-size: 0.75rem; }

/* ── 4. LOGIN PAGE ────────────────────────────────────────── */
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); padding: 2rem; position: relative; overflow: hidden;
}
.login-bg-glow {
  position: absolute; top: -150px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%);
  pointer-events: none;
}
.login-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
  background-size: 48px 48px; pointer-events: none;
}
.login-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 1.25rem;
  padding: 2.5rem 2rem; width: 100%; max-width: 420px; position: relative; z-index: 2;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4); animation: heroFadeUp 0.5s ease both;
}
.login-logo { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1.75rem; }
.login-title { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 0.35rem; }
.login-sub { font-size: 0.875rem; color: var(--text-2); margin-bottom: 1.75rem; line-height: 1.5; }
.login-form { display: flex; flex-direction: column; gap: 1.1rem; }
.login-btn { width: 100%; margin-top: 0.5rem; justify-content: center; }
.login-error {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
  color: var(--error); border-radius: 0.5rem; padding: 0.625rem 0.875rem;
  font-size: 0.825rem; margin-bottom: 0.5rem;
}
.login-role-hint {
  display: flex; align-items: center; gap: 0.4rem; font-size: 0.775rem; color: var(--text-3);
  background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.12);
  border-radius: 0.375rem; padding: 0.5rem 0.75rem;
}
.login-toggle { text-align: center; font-size: 0.825rem; color: var(--text-3); margin-top: 1.25rem; }
.login-toggle-btn { background: none; border: none; color: var(--primary-l); font-size: 0.825rem; font-weight: 600; cursor: pointer; padding: 0; font-family: inherit; transition: var(--t); }
.login-toggle-btn:hover { color: var(--primary); text-decoration: underline; }
.auth-mode-tabs { display: flex; background: var(--input); border: 1px solid var(--border); border-radius: 0.5rem; padding: 3px; gap: 3px; margin-bottom: 1.25rem; }
.auth-mode-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.45rem; border: none; background: transparent; color: var(--text-3); border-radius: 0.375rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: var(--t); font-family: inherit; }
.auth-mode-tab:hover { color: var(--text); }
.auth-mode-tab.active { background: var(--card-2); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.pw-toggle { position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-3); cursor: pointer; padding: 0; line-height: 0; z-index: 3; transition: var(--t); }
.pw-toggle:hover { color: var(--text); }

/* ── 5. FORM PAGE ────────────────────────────────────────── */
.container { display: flex; min-height: 100vh; background: var(--bg); }

/* Sidebar */
.dashboard {
  width: 300px; background: var(--card); border-right: 1px solid var(--border);
  padding: 2rem; display: flex; flex-direction: column;
  position: fixed; height: 100vh; left: 0; top: 0; z-index: 100;
}
.logo { display: flex; align-items: center; gap: 0.75rem; font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.25rem; }
.logo-icon { color: var(--success); width: 28px; height: 28px; }
.logo-sub { margin-bottom: 2rem; }
.logo-sub p { font-size: 0.65rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.15rem; }
.logo-sub .app-name { font-size: 0.75rem; color: var(--primary-l); font-weight: 600; letter-spacing: 0.05em; }
.progress-steps { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
.step { display: flex; align-items: flex-start; gap: 0.875rem; opacity: 0.5; transition: var(--t); cursor: pointer; }
.step.active, .step.completed { opacity: 1; }
.step-number { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; transition: var(--t); flex-shrink: 0; }
.step.active .step-number { border-color: var(--primary); background: var(--primary); color: white; }
.step.completed .step-number { background: var(--success); border-color: var(--success); color: white; }
.step-info h4 { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--text); }
.step-info p { font-size: 0.75rem; color: var(--text-2); }
.lang-toggle { margin-bottom: 1.25rem; padding: 0.875rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 0.5rem; }
.lang-label { font-size: 0.7rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem; }
.lang-select { width: 100%; padding: 0.5rem 2rem 0.5rem 0.75rem; background: var(--input); border: 1px solid var(--border); border-radius: 0.375rem; color: var(--text); font-size: 0.85rem; font-family: inherit; cursor: pointer; appearance: none; transition: var(--t); }
.lang-select:focus { outline: none; border-color: var(--primary); }
.lang-select option { background: var(--card); color: var(--text); }
.dashboard-home-btn { display: flex; align-items: center; gap: 0.5rem; background: transparent; border: 1px solid var(--border); color: var(--text-3); border-radius: 0.375rem; padding: 0.5rem 0.875rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; margin-bottom: 1rem; transition: var(--t); font-family: inherit; width: 100%; }
.dashboard-home-btn:hover { background: var(--input); color: var(--text); }
.dashboard-footer { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--border); text-align: center; }
.dashboard-footer p { font-size: 0.7rem; color: var(--text-3); margin-bottom: 0.5rem; }
.security-badges { display: flex; justify-content: center; gap: 0.5rem; }
.badge-icon { color: var(--text-3); }
.dashboard-close { display: none; position: absolute; top: 1rem; right: 1rem; background: transparent; border: 1px solid var(--border); border-radius: 0.375rem; color: var(--text-2); cursor: pointer; padding: 0.25rem; line-height: 0; transition: var(--t); }
.dashboard-close:hover { background: var(--input); color: var(--text); }
.dashboard-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 99; backdrop-filter: blur(2px); }

/* Main content */
.main-content { flex: 1; margin-left: 300px; padding: 2.5rem 3.5rem; max-width: 860px; }
.mobile-topbar { display: none; align-items: center; justify-content: space-between; padding: 0.875rem 1.25rem; background: var(--card); border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; border-radius: 0.75rem; gap: 0.75rem; }
.hamburger { background: transparent; border: 1px solid var(--border); border-radius: 0.375rem; color: var(--text-2); cursor: pointer; padding: 0.35rem; line-height: 0; transition: var(--t); flex-shrink: 0; }
.hamburger:hover { background: var(--input); color: var(--text); }
.mobile-brand { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 700; color: var(--text); flex: 1; }
.mobile-step { font-size: 0.75rem; font-weight: 600; color: var(--primary-l); background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 999px; padding: 0.2rem 0.6rem; flex-shrink: 0; }

/* Form top bar */
.form-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
.back-to-home { display: inline-flex; align-items: center; gap: 0.4rem; background: transparent; border: 1px solid var(--border); color: var(--text-3); border-radius: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: var(--t); font-family: inherit; }
.back-to-home:hover { background: var(--input); color: var(--text); border-color: var(--text-3); }
.user-chip { display: flex; align-items: center; gap: 0.6rem; background: var(--card); border: 1px solid var(--border); border-radius: 999px; padding: 0.35rem 0.75rem 0.35rem 0.35rem; }
.user-chip-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #2563eb); color: white; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-chip-info { display: flex; flex-direction: column; line-height: 1.2; }
.user-chip-name { font-size: 0.8rem; font-weight: 600; color: var(--text); }
.user-chip-role { font-size: 0.68rem; color: #10b981; font-weight: 500; }
.user-chip-logout { background: none; border: none; color: var(--text-3); cursor: pointer; padding: 0.2rem; line-height: 0; transition: var(--t); margin-left: 0.25rem; }
.user-chip-logout:hover { color: var(--error); }

/* Form header */
.form-header { margin-bottom: 2rem; }
.header-badge { display: inline-block; background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3); border-radius: 999px; padding: 0.2rem 0.8rem; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.75rem; }
.form-header h1 { font-family: 'Sora', sans-serif; font-size: 1.85rem; font-weight: 800; margin-bottom: 0.35rem; background: linear-gradient(135deg, var(--text) 0%, var(--primary-l) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.subtitle { color: var(--text-2); font-size: 0.9rem; }

/* Form container */
.form-container { background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; }
.form-section { display: none; animation: fadeUp 0.35s ease; }
.form-section.active { display: block; }
.section-title { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
.input-group.full-width { grid-column: 1 / -1; }

/* BP / BMI */
.bp-row { display: flex; align-items: center; gap: 0.5rem; }
.bp-row .input-wrapper { flex: 1; }
.bp-slash { font-size: 1.25rem; color: var(--text-3); font-weight: 300; flex-shrink: 0; }
.bmi-display { display: flex; align-items: center; gap: 0.75rem; }
.bmi-display .input-wrapper { flex: 1; }
.bmi-badge { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; color: white; white-space: nowrap; flex-shrink: 0; transition: var(--t); }
.field-hint { font-size: 0.72rem; color: var(--text-3); margin-top: 0.3rem; font-style: italic; }

/* Navigation / errors */
.form-navigation { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.75rem; border-top: 1px solid var(--border); }
.submit-error { display: flex; align-items: center; gap: 0.5rem; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: var(--error); border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.85rem; margin-top: 1rem; }

/* Success */
.success-message { text-align: center; padding: 4rem 2rem; background: var(--card); border: 1px solid var(--border); border-radius: 1rem; animation: fadeUp 0.5s ease; }
.success-icon { width: 76px; height: 76px; background: rgba(16,185,129,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; border: 2px solid var(--success); }
.check-icon { color: var(--success); }
.success-brand { display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700; color: var(--text-3); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; }
.success-message h2 { font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; }
.success-message p { color: var(--text-2); margin-bottom: 2rem; }

/* ── 6. ADMIN DASHBOARD ──────────────────────────────────── */
.admin-page { min-height: 100vh; background: var(--bg); padding: 1.5rem 2rem; position: relative; overflow-x: hidden; }
.admin-bg-grid { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px); background-size: 44px 44px; }
.admin-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.5rem; background: var(--card); border: 1px solid var(--border); border-radius: 0.875rem; margin-bottom: 1.25rem; position: relative; z-index: 1; flex-wrap: wrap; }
.admin-header-left { display: flex; align-items: center; gap: 1.5rem; }
.admin-header-right { display: flex; align-items: center; gap: 0.875rem; flex-wrap: wrap; }
.admin-title-block { border-left: 1px solid var(--border); padding-left: 1.5rem; }
.admin-title { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 800; margin-bottom: 0.15rem; }
.admin-sub { font-size: 0.78rem; color: var(--text-2); }
.admin-stats-bar { display: flex; gap: 1rem; margin-bottom: 1.25rem; position: relative; z-index: 1; flex-wrap: wrap; }
.admin-stat { flex: 1; min-width: 120px; background: var(--card); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem 1.25rem; text-align: center; }
.admin-stat-val { display: block; font-family: 'Sora', sans-serif; font-size: 1.75rem; font-weight: 800; color: var(--success); }
.admin-stat-label { font-size: 0.75rem; color: var(--text-2); font-weight: 500; }
.admin-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; position: relative; z-index: 1; flex-wrap: wrap; }
.admin-tabs { display: flex; gap: 0.35rem; background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 3px; }
.admin-tab { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.875rem; border: none; background: transparent; color: var(--text-3); border-radius: 0.375rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: var(--t); font-family: inherit; }
.admin-tab:hover { color: var(--text); }
.admin-tab.active { background: var(--card-2); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.admin-table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 0.875rem; overflow: hidden; position: relative; z-index: 1; }
.admin-loading { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 4rem; color: var(--text-2); font-size: 0.9rem; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table thead tr { background: var(--card-2); border-bottom: 1px solid var(--border); }
.admin-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
.admin-table tbody tr { border-bottom: 1px solid rgba(31,41,55,0.7); transition: background 0.15s; }
.admin-table tbody tr:last-child { border-bottom: none; }
.admin-table tbody tr:hover { background: rgba(255,255,255,0.02); }
.admin-table td { padding: 0.75rem 1rem; font-size: 0.85rem; }
.td-name { font-weight: 600; color: var(--text); }
.td-muted { color: var(--text-2); }
.role-select { padding: 0.3rem 0.6rem; background: var(--input); border: 1px solid var(--border); border-radius: 0.375rem; color: var(--text); font-size: 0.78rem; font-family: inherit; cursor: pointer; }
.role-select:focus { outline: none; border-color: var(--primary); }
.icon-btn { width: 28px; height: 28px; border-radius: 0.375rem; border: 1px solid var(--border); background: transparent; color: var(--text-2); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--t); padding: 0; }
.icon-btn:hover { background: var(--input); color: var(--text); border-color: var(--text-3); }
.icon-btn.red:hover { background: rgba(239,68,68,0.1); color: var(--error); border-color: rgba(239,68,68,0.3); }
.icon-btn.green:hover { background: rgba(16,185,129,0.1); color: var(--success); border-color: rgba(16,185,129,0.3); }
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── 7. 404 NOT FOUND ────────────────────────────────────── */
.notfound-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); position: relative; overflow: hidden; padding: 2rem; }
.notfound-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
.notfound-glow { position: absolute; top: -150px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 65%); pointer-events: none; }
.notfound-glow-2 { top: auto; bottom: -150px; background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 65%); }
.notfound-content { display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 2; max-width: 480px; width: 100%; }
.notfound-logo { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 3rem; }
.notfound-number { font-family: 'Sora', sans-serif; font-size: clamp(7rem, 20vw, 12rem); font-weight: 800; letter-spacing: -0.05em; line-height: 1; margin-bottom: 1.5rem; background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; position: relative; user-select: none; }
.notfound-glitch { animation: glitchShake 0.15s ease both; }
.notfound-glitch-copy { position: absolute; top: 0; left: 0; width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%); animation: glitchSlice 0.15s ease both; pointer-events: none; }
.notfound-icon-wrap { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.75rem; }
.notfound-icon-x { position: absolute; bottom: -4px; right: -4px; background: var(--bg); border-radius: 50%; padding: 2px; line-height: 0; }
.notfound-title { font-family: 'Sora', sans-serif; font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.025em; margin-bottom: 0.75rem; }
.notfound-sub { font-size: 0.9375rem; color: var(--text-2); line-height: 1.65; margin-bottom: 2.5rem; max-width: 360px; }
.notfound-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 3rem; }
.notfound-footer { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-3); }

/* ── 8. ANIMATIONS ───────────────────────────────────────── */
@keyframes fadeUp    { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes heroFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes gridDrift { 0% { background-position: 0 0; } 100% { background-position: 48px 48px; } }
@keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes livePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
@keyframes ringPulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.12); opacity: 0.2; } }
@keyframes badgePop  { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes glitchShake { 0% { transform: translateX(0); } 25% { transform: translateX(-4px); } 50% { transform: translateX(4px); } 75% { transform: translateX(-2px); } 100% { transform: translateX(0); } }
@keyframes glitchSlice { 0% { transform: translateX(0); opacity: 1; } 50% { transform: translateX(6px); opacity: 0.8; } 100% { transform: translateX(0); opacity: 0; } }
@keyframes stepNumPop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

/* Scroll-driven entrance classes */
.hero-anim { opacity: 0; transform: translateY(28px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
.hero-anim--in { opacity: 1; transform: translateY(0); }
.hero-visual.hero-anim { transform: translateX(32px); }
.hero-visual.hero-anim--in { transform: translateX(0); }
.hcr--anim { opacity: 0; transform: translateX(12px); transition: opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1); }
.hcr--show { opacity: 1; transform: translateX(0); }
.how-step--anim { opacity: 0; transform: translateY(20px); transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1); }
.how-step--visible { opacity: 1; transform: translateY(0); }
.how-step-num { transform: scale(0.6); opacity: 0; transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease, background 0.3s ease, border-color 0.3s ease; }
.how-step-num--visible, .how-step-num.how-step-pop { transform: scale(1); opacity: 1; animation: stepNumPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
.how-connector--anim { transform: scaleX(0); transform-origin: left center; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1); }
.how-connector--visible { transform: scaleX(1); }

/* ── 9. RESPONSIVE ───────────────────────────────────────── */
@media (max-width: 1024px) {
  .dashboard { transform: translateX(-100%); transition: transform 0.3s var(--ease); box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
  .dashboard.open { transform: translateX(0); }
  .dashboard-close { display: flex; }
  .dashboard-overlay { display: block; }
  .main-content { margin-left: 0; padding: 1.5rem; max-width: 100%; }
  .mobile-topbar { display: flex; }
  .form-grid { grid-template-columns: 1fr; }
  .input-group.full-width { grid-column: 1; }
  .landing-hero { flex-direction: column; min-height: auto; padding: 4rem 1.5rem 3rem; gap: 3rem; text-align: center; }
  .hero-sub { margin: 0 auto 2.5rem; }
  .hero-actions { justify-content: center; }
  .hero-visual { display: none; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .landing-nav-links { display: none; }
}

@media (max-width: 768px) {
  .admin-page { padding: 1rem; }
  .admin-header { flex-direction: column; align-items: flex-start; }
  .admin-title-block { border-left: none; padding-left: 0; border-top: 1px solid var(--border); padding-top: 0.75rem; width: 100%; }
  .admin-table-wrap { overflow-x: auto; }
  .admin-table { min-width: 700px; }
  .landing-stats { flex-wrap: wrap; }
  .stat-item { flex: 1 1 50%; max-width: 50%; border-right: none; border-bottom: 1px solid var(--border); }
  .stat-item:nth-child(odd) { border-right: 1px solid var(--border); }
  .stat-item:nth-last-child(-n+2) { border-bottom: none; }
  .features-grid { grid-template-columns: 1fr; }
  .how-steps { flex-direction: column; gap: 2rem; }
  .how-connector { display: none; }
  .lang-pills { display: none; }
  .landing-nav-inner { padding: 0 1rem; }
}

@media (max-width: 640px) {
  .main-content { padding: 1rem; }
  .form-container { padding: 1.25rem; }
  .form-header h1 { font-size: 1.4rem; }
  .subtitle { font-size: 0.85rem; }
  .btn { width: 100%; justify-content: center; }
  .form-navigation { flex-direction: column-reverse; gap: 0.75rem; }
  .bmi-display { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .mobile-topbar { border-radius: 0.5rem; margin-bottom: 1rem; }
}

@media (max-width: 480px) {
  .hero-title { font-size: 2rem; }
  .btn-hero-primary, .btn-hero-secondary { width: 100%; justify-content: center; }
  .hero-actions { flex-direction: column; }
  .btn-nav-cta span { display: none; }
}
/* ============================================================
   AddressFields — append these to App.css
   (under Section 2. Shared Utilities or Section 5. Form Page)
   ============================================================ */

/* Locked / disabled select visual feedback */
.input-group select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Field-level error state */
.input-group.has-error input,
.input-group.has-error select,
.input-group.has-error textarea {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-error {
  font-size: 0.72rem;
  color: var(--error);
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Address preview chip */
.address-preview {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-2);
  line-height: 1.5;
  animation: fadeUp 0.3s ease;
  word-break: break-word;
}

.address-preview span {
  color: var(--text);
  font-weight: 500;
}
/* ============================================================
   APPEND THIS ENTIRE BLOCK TO THE BOTTOM OF App.css
   ============================================================ */

/* ── FLOATING CHAT ──────────────────────────────────────────── */
.chat-fab {
  position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 200;
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none; color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 24px rgba(16,185,129,0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.chat-fab:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(16,185,129,0.5); }
.chat-fab-badge {
  position: absolute; top: -4px; right: -4px;
  background: #ef4444; color: white;
  border-radius: 999px; font-size: 0.62rem; font-weight: 800;
  padding: 0.1rem 0.35rem; border: 2px solid var(--bg);
  min-width: 18px; text-align: center;
}

.chat-window {
  position: fixed; bottom: 5.5rem; right: 1.75rem; z-index: 199;
  width: 320px; max-height: 480px;
  background: var(--card); border: 1px solid var(--border); border-radius: 1rem;
  display: flex; flex-direction: column;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  animation: fadeUp 0.25s ease;
}
.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 1rem; border-bottom: 1px solid var(--border);
  border-radius: 1rem 1rem 0 0; background: var(--card-2);
}
.chat-header-info { display: flex; align-items: center; gap: 0.6rem; }
.chat-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg,#10b981,#2563eb);
  color: white; font-weight: 800; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.chat-header-name  { font-size: 0.875rem; font-weight: 700; color: var(--text); }
.chat-header-status{ font-size: 0.68rem; color: #10b981; }
.chat-close { background: none; border: none; color: var(--text-3); cursor: pointer; padding: 0.2rem; line-height: 0; transition: var(--t); }
.chat-close:hover { color: var(--text); }

.chat-messages {
  flex: 1; overflow-y: auto; padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.5rem;
  scroll-behavior: smooth;
}
.chat-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.5rem; color: var(--text-3);
  font-size: 0.82rem; text-align: center; padding: 2rem 0;
}
.chat-msg { display: flex; flex-direction: column; max-width: 80%; }
.chat-msg.mine  { align-self: flex-end; align-items: flex-end; }
.chat-msg.theirs{ align-self: flex-start; align-items: flex-start; }
.chat-bubble {
  padding: 0.55rem 0.875rem; border-radius: 1rem; font-size: 0.875rem; line-height: 1.45;
  word-break: break-word;
}
.chat-msg.mine .chat-bubble  { background: var(--primary); color: white; border-bottom-right-radius: 0.25rem; }
.chat-msg.theirs .chat-bubble{ background: var(--card-2); color: var(--text); border-bottom-left-radius: 0.25rem; border: 1px solid var(--border); }
.chat-time  { font-size: 0.65rem; color: var(--text-3); margin-top: 0.2rem; padding: 0 0.25rem; }
.chat-read  { color: #10b981; font-weight: 700; }

.chat-input-row {
  display: flex; gap: 0.5rem; padding: 0.75rem;
  border-top: 1px solid var(--border); border-radius: 0 0 1rem 1rem;
}
.chat-input {
  flex: 1; padding: 0.6rem 0.875rem; background: var(--input);
  border: 1px solid var(--border); border-radius: 0.5rem;
  color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none;
  transition: var(--t);
}
.chat-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.chat-send {
  width: 36px; height: 36px; border-radius: 0.5rem; border: none;
  background: var(--primary); color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--t); flex-shrink: 0; align-self: center;
}
.chat-send:hover:not(:disabled) { background: var(--primary-h); }
.chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── ADMIN CHAT PANEL ───────────────────────────────────────── */
.admin-chat-panel {
  width: 340px; flex-shrink: 0;
  background: var(--card); border: 1px solid var(--border); border-radius: 0.875rem;
  display: flex; flex-direction: column; height: 560px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.admin-chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 1rem; border-bottom: 1px solid var(--border);
  background: var(--card-2); border-radius: 0.875rem 0.875rem 0 0;
}
.admin-chat-messages {
  flex: 1; overflow-y: auto; padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.ping-popup {
  position: fixed; top: 1.25rem; right: 1.25rem; z-index: 300;
  background: linear-gradient(135deg,#f59e0b,#d97706);
  color: white; border-radius: 0.625rem;
  padding: 0.75rem 1.125rem; font-size: 0.875rem; font-weight: 600;
  display: flex; align-items: center; gap: 0.5rem;
  box-shadow: 0 8px 24px rgba(245,158,11,0.4);
  animation: fadeUp 0.3s ease, fadeOut 0.3s ease 4.7s forwards;
}
@keyframes fadeOut { to { opacity: 0; transform: translateY(-8px); } }

/* ── COOKIE BANNER ──────────────────────────────────────────── */
.cookie-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 250;
  background: var(--card); border-top: 1px solid var(--border);
  padding: 0.875rem 1.5rem;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
  animation: slideUp 0.4s ease;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.cookie-banner-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
}
.cookie-icon { flex-shrink: 0; }
.cookie-text { flex: 1; font-size: 0.85rem; color: var(--text-2); line-height: 1.5; min-width: 200px; }
.cookie-link { color: var(--primary-l); text-decoration: underline; }
.cookie-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
.cookie-btn {
  padding: 0.45rem 1rem; border-radius: 0.375rem; font-size: 0.82rem;
  font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: var(--t);
}
.cookie-accept  { background: var(--success); color: white; }
.cookie-accept:hover  { background: var(--success-h); }
.cookie-decline { background: transparent; color: var(--text-3); border: 1px solid var(--border); }
.cookie-decline:hover { background: var(--input); color: var(--text); }
.cookie-dismiss {
  background: none; border: none; color: var(--text-3); cursor: pointer;
  padding: 0.25rem; line-height: 0; flex-shrink: 0; transition: var(--t);
}
.cookie-dismiss:hover { color: var(--text); }
 /* ============================================================
   APPEND THIS ENTIRE BLOCK TO THE BOTTOM OF App.css
   ============================================================ */

/* ── FLOATING CHAT ──────────────────────────────────────────── */
.chat-fab {
  position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 200;
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none; color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 24px rgba(16,185,129,0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.chat-fab:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(16,185,129,0.5); }
.chat-fab-badge {
  position: absolute; top: -4px; right: -4px;
  background: #ef4444; color: white;
  border-radius: 999px; font-size: 0.62rem; font-weight: 800;
  padding: 0.1rem 0.35rem; border: 2px solid var(--bg);
  min-width: 18px; text-align: center;
}

.chat-window {
  position: fixed; bottom: 5.5rem; right: 1.75rem; z-index: 199;
  width: 320px; max-height: 480px;
  background: var(--card); border: 1px solid var(--border); border-radius: 1rem;
  display: flex; flex-direction: column;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  animation: fadeUp 0.25s ease;
}
.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 1rem; border-bottom: 1px solid var(--border);
  border-radius: 1rem 1rem 0 0; background: var(--card-2);
}
.chat-header-info { display: flex; align-items: center; gap: 0.6rem; }
.chat-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg,#10b981,#2563eb);
  color: white; font-weight: 800; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.chat-header-name  { font-size: 0.875rem; font-weight: 700; color: var(--text); }
.chat-header-status{ font-size: 0.68rem; color: #10b981; }
.chat-close { background: none; border: none; color: var(--text-3); cursor: pointer; padding: 0.2rem; line-height: 0; transition: var(--t); }
.chat-close:hover { color: var(--text); }

.chat-messages {
  flex: 1; overflow-y: auto; padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.5rem;
  scroll-behavior: smooth;
}
.chat-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.5rem; color: var(--text-3);
  font-size: 0.82rem; text-align: center; padding: 2rem 0;
}
.chat-msg { display: flex; flex-direction: column; max-width: 80%; }
.chat-msg.mine  { align-self: flex-end; align-items: flex-end; }
.chat-msg.theirs{ align-self: flex-start; align-items: flex-start; }
.chat-bubble {
  padding: 0.55rem 0.875rem; border-radius: 1rem; font-size: 0.875rem; line-height: 1.45;
  word-break: break-word;
}
.chat-msg.mine .chat-bubble  { background: var(--primary); color: white; border-bottom-right-radius: 0.25rem; }
.chat-msg.theirs .chat-bubble{ background: var(--card-2); color: var(--text); border-bottom-left-radius: 0.25rem; border: 1px solid var(--border); }
.chat-time  { font-size: 0.65rem; color: var(--text-3); margin-top: 0.2rem; padding: 0 0.25rem; }
.chat-read  { color: #10b981; font-weight: 700; }

.chat-input-row {
  display: flex; gap: 0.5rem; padding: 0.75rem;
  border-top: 1px solid var(--border); border-radius: 0 0 1rem 1rem;
}
.chat-input {
  flex: 1; padding: 0.6rem 0.875rem; background: var(--input);
  border: 1px solid var(--border); border-radius: 0.5rem;
  color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none;
  transition: var(--t);
}
.chat-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.chat-send {
  width: 36px; height: 36px; border-radius: 0.5rem; border: none;
  background: var(--primary); color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--t); flex-shrink: 0; align-self: center;
}
.chat-send:hover:not(:disabled) { background: var(--primary-h); }
.chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── ADMIN CHAT PANEL ───────────────────────────────────────── */
.admin-chat-panel {
  width: 340px; flex-shrink: 0;
  background: var(--card); border: 1px solid var(--border); border-radius: 0.875rem;
  display: flex; flex-direction: column; height: 560px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.admin-chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 1rem; border-bottom: 1px solid var(--border);
  background: var(--card-2); border-radius: 0.875rem 0.875rem 0 0;
}
.admin-chat-messages {
  flex: 1; overflow-y: auto; padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}

/* ── PING POPUP ─────────────────────────────────────────────── */
.ping-popup {
  position: fixed; top: 1.25rem; right: 1.25rem; z-index: 300;
  background: linear-gradient(135deg,#f59e0b,#d97706);
  color: white; border-radius: 0.625rem;
  padding: 0.75rem 1.125rem; font-size: 0.875rem; font-weight: 600;
  display: flex; align-items: center; gap: 0.5rem;
  box-shadow: 0 8px 24px rgba(245,158,11,0.4);
  animation: fadeUp 0.3s ease, fadeOut 0.3s ease 4.7s forwards;
}
@keyframes fadeOut { to { opacity: 0; transform: translateY(-8px); } }

/* ── COOKIE BANNER ──────────────────────────────────────────── */
.cookie-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 250;
  background: var(--card); border-top: 1px solid var(--border);
  padding: 0.875rem 1.5rem;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
  animation: slideUp 0.4s ease;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.cookie-banner-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
}
.cookie-icon { flex-shrink: 0; }
.cookie-text { flex: 1; font-size: 0.85rem; color: var(--text-2); line-height: 1.5; min-width: 200px; }
.cookie-link { color: var(--primary-l); text-decoration: underline; }
.cookie-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
.cookie-btn {
  padding: 0.45rem 1rem; border-radius: 0.375rem; font-size: 0.82rem;
  font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: var(--t);
}
.cookie-accept  { background: var(--success); color: white; }
.cookie-accept:hover  { background: var(--success-h); }
.cookie-decline { background: transparent; color: var(--text-3); border: 1px solid var(--border); }
.cookie-decline:hover { background: var(--input); color: var(--text); }
.cookie-dismiss {
  background: none; border: none; color: var(--text-3); cursor: pointer;
  padding: 0.25rem; line-height: 0; flex-shrink: 0; transition: var(--t);
}
.cookie-dismiss:hover { color: var(--text); }
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.15); }
}