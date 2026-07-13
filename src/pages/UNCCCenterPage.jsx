import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, AlertCircle, Play, Check, X, Search, Activity, ShoppingCart, User, HelpCircle, AlertTriangle, Briefcase } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "var(--teal)",
  text: "var(--ink)",
  textMuted: "var(--slate)",
  border: "var(--card-border)",
  bg: "var(--bg)",
  card: "var(--card)",
  success: "var(--teal)",
  danger: "var(--coral)",
  warning: "var(--amber)",
  critical: "var(--coral)"
};

// Helper for relative time
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Icon mapper based on category
const getCategoryIcon = (category, priority) => {
  const props = { size: 18, color: priority === 'Critical' ? COLORS.danger : priority === 'High' ? COLORS.warning : COLORS.primary };
  switch(category) {
    case 'Sales': return <ShoppingCart {...props} />;
    case 'Customer': return <User {...props} />;
    case 'Support': return <HelpCircle {...props} />;
    case 'Operations': return <Activity {...props} />;
    case 'Performance': return <Briefcase {...props} />;
    default: return <AlertTriangle {...props} />;
  }
};

export default function UNCCCenterPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('unread');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  const fetchNotifications = () => {
    setLoading(true);
    api.uncc.getNotifications().then(res => {
      setNotifications(res.notifications || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAction = async (id, actionType) => {
    try {
      await api.uncc.executeQuickAction(id, {});
      alert("Action executed successfully.");
      fetchNotifications();
    } catch (err) {
      alert("Failed to execute action.");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.uncc.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter(n => {
    let match = true;
    if (filterStatus !== 'all') {
      if (filterStatus === 'unread' && n.status !== 'unread') match = false;
      if (filterStatus === 'read' && n.status !== 'read') match = false;
      if (filterStatus === 'completed' && n.status !== 'completed') match = false;
    }
    if (filterPriority !== 'all' && n.priority !== filterPriority) match = false;
    if (filterCategory !== 'all' && n.category !== filterCategory) match = false;
    
    if (search && !n.message.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  });

  return (
    <div style={{ padding: "32px 40px", height: "100%", background: "var(--bg)", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "var(--teal-light)", padding: 8, borderRadius: 12, display: "flex" }}>
              <Bell size={24} color="var(--teal)" />
            </div>
            Notification Center
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "var(--slate)" }}>
            Manage alerts, approvals, and operational tasks.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, background: "var(--card)", padding: 16, borderRadius: "var(--radius)", border: "1px solid var(--card-border)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} color="var(--slate)" style={{ position: "absolute", left: 12, top: 10 }} />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: "1px solid var(--slate-border)", fontSize: 13, outline: "none" }}
          />
        </div>
        
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-border)", fontSize: 13, outline: "none", background: "#fff", cursor: "pointer" }}>
          <option value="all">All Statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="completed">Completed</option>
        </select>

        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-border)", fontSize: 13, outline: "none", background: "#fff", cursor: "pointer" }}>
          <option value="all">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-border)", fontSize: 13, outline: "none", background: "#fff", cursor: "pointer" }}>
          <option value="all">All Categories</option>
          <option value="Sales">Sales</option>
          <option value="Customer">Customer</option>
          <option value="Support">Support</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Loading inbox...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", background: COLORS.card, borderRadius: "var(--radius)", border: `1px solid ${COLORS.border}` }}>
            <CheckCircle size={48} color={COLORS.border} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.textMuted }}>Inbox Zero</div>
            <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 8 }}>You're all caught up on your alerts.</div>
          </div>
        ) : (
          filtered.map(n => {
            const isCritical = n.priority === 'Critical';
            const isUnread = n.status === 'unread';
            const contextData = n.context_data ? JSON.parse(n.context_data) : {};

            return (
              <div key={n.id} style={{ 
                background: isCritical && isUnread ? 'var(--coral-light)' : COLORS.card, 
                border: `1px solid ${isCritical && isUnread ? 'var(--coral-border)' : COLORS.border}`, 
                borderRadius: "var(--radius)", 
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: isUnread ? "0 4px 12px rgba(0, 0, 0, 0.04)" : "none",
                opacity: n.status === 'completed' ? 0.6 : 1,
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: isCritical ? "rgba(232, 96, 76, 0.1)" : n.priority === 'High' ? "rgba(217, 119, 6, 0.1)" : "rgba(15, 76, 74, 0.1)", padding: 8, borderRadius: 8, display: "flex" }}>
                      {getCategoryIcon(n.category, n.priority)}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{n.category}</span>
                        <span style={{ background: isCritical ? COLORS.danger : n.priority === 'High' ? COLORS.warning : n.priority === 'Medium' ? 'var(--yellow)' : COLORS.primary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>{n.priority}</span>
                        {n.brand_id && (
                          <span style={{ background: "var(--slate-light)", color: "var(--slate)", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                            {n.brand_id === 'brd_cureka' ? 'Cureka' : n.brand_id === 'brd_healthetc' ? 'Healthetc' : 'TGHC'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                        {timeAgo(n.created_at)} • {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isUnread && (
                      <button onClick={() => handleMarkRead(n.id)} style={{ background: "none", border: "none", fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <Check size={14} /> Mark Read
                      </button>
                    )}
                    <span style={{ background: n.status === 'completed' ? 'var(--teal-light)' : 'var(--slate-light)', color: n.status === 'completed' ? 'var(--teal)' : 'var(--slate)', fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 4, textTransform: "uppercase" }}>{n.status}</span>
                  </div>
                </div>

                <div style={{ marginLeft: 46 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: isCritical && isUnread ? COLORS.critical : COLORS.text, marginBottom: 8 }}>{n.message}</div>
                  
                  {/* Context Metadata */}
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: COLORS.textMuted, flexWrap: "wrap", background: "var(--slate-light)", padding: "8px 12px", borderRadius: 8, display: "inline-flex" }}>
                    {contextData.order_id && <span>Order: <strong>{contextData.order_id}</strong></span>}
                    {contextData.ticket_id && <span>Ticket: <strong>{contextData.ticket_id}</strong></span>}
                    {n.due_at && <span style={{ color: COLORS.danger, fontWeight: 600 }}><Clock size={12} style={{ display: "inline", marginBottom: -2 }} /> Due: {new Date(n.due_at).toLocaleString()}</span>}
                    {!contextData.order_id && !contextData.ticket_id && !n.due_at && <span>No context data</span>}
                  </div>
                </div>

                {/* Quick Actions Bar */}
                {n.status !== 'completed' && n.action_type && (
                  <div style={{ marginLeft: 46, display: "flex", gap: 12, marginTop: 8, paddingTop: 16, borderTop: `1px solid ${isCritical && isUnread ? 'var(--coral-border)' : COLORS.border}` }}>
                    
                    {n.action_type === 'APPROVE_REFUND' && (
                      <>
                        <button onClick={() => handleAction(n.id, 'APPROVE_REFUND')} style={{ background: "var(--teal)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity=0.9} onMouseLeave={e => e.currentTarget.style.opacity=1}>
                          <Check size={16} /> Approve Refund
                        </button>
                        <button onClick={() => handleAction(n.id, 'REJECT_REFUND')} style={{ background: "transparent", color: "var(--coral)", border: `1px solid var(--coral-border)`, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                          <X size={16} /> Reject
                        </button>
                      </>
                    )}

                    {n.action_type === 'VIEW_CARTS' && (
                      <button onClick={() => handleAction(n.id, 'VIEW_CARTS')} style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--slate-border)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        View Carts Segment &rarr;
                      </button>
                    )}

                    {n.action_type === 'CALL_CUSTOMER' && (
                      <button onClick={() => handleAction(n.id, 'CALL_CUSTOMER')} style={{ background: "var(--teal)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        <Play size={16} /> Schedule Follow-up
                      </button>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
