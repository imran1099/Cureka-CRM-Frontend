import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, ExternalLink, AlertCircle, TrendingUp, CheckCircle, Clock } from "lucide-react";
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

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const dropdownRef = useRef(null);

  const fetchNotifications = () => {
    api.uncc.getNotifications().then(res => {
      const newNotifs = res.notifications || [];
      const unread = newNotifs.filter(n => n.status === 'unread').length;
      
      setNotifications(newNotifs);
      setLoading(false);
      
      setPrevUnreadCount(prev => {
        if (unread > prev) {
          setAnimating(true);
          setTimeout(() => setAnimating(false), 2000);
        }
        return unread;
      });
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await api.uncc.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unread = notifications.filter(n => n.status === 'unread');
  const groupedUnread = [];
  
  // Basic Grouping Heuristic for V1 (Group unread by category & priority if count > 2)
  const categoryGroups = {};
  unread.forEach(n => {
    const key = `${n.category}-${n.priority}`;
    if (!categoryGroups[key]) categoryGroups[key] = [];
    categoryGroups[key].push(n);
  });
  
  Object.keys(categoryGroups).forEach(key => {
    const group = categoryGroups[key];
    if (group.length > 2) {
      // Create a meta-notification
      groupedUnread.push({
        id: `group_${key}`,
        isGroup: true,
        count: group.length,
        category: group[0].category,
        priority: group[0].priority,
        message: `${group.length} ${group[0].category} Notifications`
      });
    } else {
      groupedUnread.push(...group);
    }
  });

  const toggleGroup = (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", cursor: "pointer", position: "relative", color: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 8, borderRadius: "50%", transition: "background 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--slate-light)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <Bell size={20} />
        {unread.length > 0 && (
          <span style={{ 
            position: "absolute", top: 4, right: 4, background: COLORS.danger, color: "#fff", 
            fontSize: 10, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", 
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: animating ? "pulse-badge 1.5s infinite" : "none"
          }}>
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 380, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "var(--radius)", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", zIndex: 1000, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.card }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>Notifications</span>
            {unread.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: "pointer" }} onClick={() => {/* Mark all read logic */}}>Mark all read</span>
            )}
          </div>
          
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 30, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>Loading...</div>
            ) : groupedUnread.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
                <CheckCircle size={32} color={COLORS.border} style={{ marginBottom: 12 }} />
                <div>You're all caught up!</div>
              </div>
            ) : (
              groupedUnread.map((n, i) => {
                const isGroupExpanded = expandedGroups[n.id];
                return (
                  <div key={n.id}>
                    <Link to={n.isGroup ? "#" : "/notifications"} onClick={n.isGroup ? (e) => toggleGroup(e, n.id) : undefined} style={{ display: "block", padding: "16px 20px", borderBottom: i === groupedUnread.length - 1 && !isGroupExpanded ? "none" : `1px solid ${COLORS.border}`, textDecoration: "none", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = COLORS.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.priority === 'Critical' ? COLORS.danger : n.priority === 'High' ? COLORS.warning : n.priority === 'Medium' ? 'var(--yellow)' : COLORS.primary, marginTop: 6, flexShrink: 0 }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, lineHeight: 1.4 }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontWeight: 600 }}>{n.category}</span>
                            {!n.isGroup && n.created_at && <span>{timeAgo(n.created_at)}</span>}
                            {n.isGroup && <span>Click to {isGroupExpanded ? "collapse" : "expand"}</span>}
                          </div>
                        </div>
                        {!n.isGroup && (
                          <button onClick={(e) => handleMarkRead(e, n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 4, borderRadius: "50%" }} onMouseEnter={e => e.currentTarget.style.background = "var(--slate-light)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} title="Mark Read">
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </Link>
                    {/* Render Expanded Group Items */}
                    {n.isGroup && isGroupExpanded && categoryGroups[n.id.replace('group_', '')].map((subN, subIndex) => (
                      <Link to="/notifications" key={subN.id} style={{ display: "block", padding: "12px 20px 12px 40px", borderBottom: `1px solid var(--slate-light)`, textDecoration: "none", background: "var(--bg)" }}>
                         <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, lineHeight: 1.4 }}>
                              {subN.message}
                            </div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                              {timeAgo(subN.created_at)}
                            </div>
                          </div>
                          <button onClick={(e) => handleMarkRead(e, subN.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 4 }} title="Mark Read">
                            <Check size={14} />
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ padding: 12, borderTop: `1px solid ${COLORS.border}`, textAlign: "center", background: COLORS.card, borderBottomLeftRadius: "var(--radius)", borderBottomRightRadius: "var(--radius)" }}>
            <Link to="/notifications" onClick={() => setOpen(false)} style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, textDecoration: "none" }}>
              View Notification Center &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
