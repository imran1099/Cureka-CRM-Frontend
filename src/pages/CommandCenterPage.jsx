import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import {
  Layers, AlertTriangle, ShoppingCart, MessageSquare, Truck, RefreshCw,
  Star, Users, PhoneCall, User, TicketIcon, ChevronRight, CheckCircle2,
  Calendar, Clock, TrendingUp, RotateCcw, PackageX, Heart
} from "lucide-react";
import ContextualKnowledgeWidget from "../components/ContextualKnowledgeWidget.jsx";

const ICON_MAP = {
  MessageSquare: MessageSquare, ShoppingCart, Truck, AlertTriangle,
  RefreshCw, Star, Users, Heart, PackageX, RotateCcw,
  TrendingUp, Layers,
};

const STATUS_COLORS = {
  assigned: { bg: "#EFF6FF", color: "#1E40AF", label: "Assigned" },
  in_progress: { bg: "#FFF7ED", color: "#C2410C", label: "In Progress" },
  contacted: { bg: "#F0FDF4", color: "#15803D", label: "Contacted" },
  follow_up_required: { bg: "#F5F3FF", color: "#6D28D9", label: "Follow-up" },
  resolved: { bg: "#F0FDF4", color: "#166534", label: "Resolved" },
  completed: { bg: "#F9FAFB", color: "#6B7280", label: "Completed" },
};

export default function CommandCenterPage() {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState("urgent");
  const [showFollowup, setShowFollowup] = useState(false);
  const [followupDate, setFollowupDate] = useState("");
  const [followupReason, setFollowupReason] = useState("");
  const navigate = useNavigate();

  const loadWorkspace = useCallback(async () => {
    try {
      const data = await api.cscc.getMyWorkspace();
      setWorkspace(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.cscc.updateTask(taskId, { status });
      loadWorkspace();
      if (selectedTask?.id === taskId) setSelectedTask(prev => ({ ...prev, status }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowup = async () => {
    if (!followupDate || !selectedTask) return;
    try {
      await api.cscc.scheduleFollowup(selectedTask.id, { due_date: followupDate, reason: followupReason });
      setShowFollowup(false);
      setSelectedTask(null);
      loadWorkspace();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading Command Center…</div>;

  const stats = workspace?.stats || {};
  const tabs = [
    { key: "urgent",   label: "🔴 Urgent",        items: workspace?.urgent || [] },
    { key: "sales",    label: "💰 Sales Queue",    items: workspace?.sales || [] },
    { key: "support",  label: "🎫 Support Cases",  items: workspace?.support || [] },
    { key: "followups",label: "📅 Follow-ups",     items: workspace?.followups || [] },
    { key: "all",      label: "📋 All Tasks",      items: workspace?.all || [] },
  ];
  const activeItems = tabs.find(t => t.key === activeTab)?.items || [];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)", background: "var(--bg-wash)", overflow: "hidden" }}>
      
      {/* Left: Task List */}
      <div style={{ display: "flex", flexDirection: "column", width: selectedTask ? "55%" : "100%", transition: "width 0.2s ease" }}>

        {/* Header + KPI Bar */}
        <div style={{ padding: "20px 24px 0 24px", background: "#fff", borderBottom: "1px solid var(--card-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={22} color="var(--teal)" /> Command Center
            </h1>
            <div style={{ display: "flex", gap: 12 }}>
              <KPIChip label="Assigned" value={stats.total_assigned || 0} color="var(--slate)" />
              <KPIChip label="Completed" value={stats.completed || 0} color="#16A34A" />
              <KPIChip label="In Progress" value={stats.in_progress || 0} color="#F97316" />
              <KPIChip label="Today's Revenue" value={`₹${(stats.total_revenue || 0).toLocaleString()}`} color="var(--teal)" />
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: "8px 16px", background: "transparent", border: "none", borderBottom: activeTab === tab.key ? "2px solid var(--teal)" : "2px solid transparent", color: activeTab === tab.key ? "var(--teal)" : "var(--slate)", fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                {tab.label} {tab.items.length > 0 && <span style={{ marginLeft: 4, background: tab.key === "urgent" ? "#FEE2E2" : "var(--bg)", color: tab.key === "urgent" ? "#DC2626" : "var(--slate)", borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>{tab.items.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {activeItems.length === 0 && (
            <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              <CheckCircle2 size={48} color="#22C55E" style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
              <strong>All clear!</strong> No tasks in this queue.
            </div>
          )}
          {activeItems.map(task => (
            <TaskCard key={task.id} task={task} selected={selectedTask?.id === task.id}
              onClick={() => setSelectedTask(task)} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>

      {/* Right: Task Detail Sidebar */}
      {selectedTask && (
        <div style={{ width: "45%", background: "#fff", borderLeft: "1px solid var(--card-border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: selectedTask.color + "22", color: selectedTask.color, marginBottom: 8 }}>
                {selectedTask.queue_name}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--ink)" }}>{selectedTask.customer_name}</h2>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--slate)" }}>{selectedTask.phone}</p>
            </div>
            <button onClick={() => setSelectedTask(null)} style={{ background: "none", border: "none", color: "var(--slate)", fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
          </div>

          {/* Customer Snapshot */}
          <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
            <h3 style={sectionHeadStyle}>Customer Snapshot</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <SnapItem label="Segment" value={selectedTask.segment} />
              <SnapItem label="LTV" value={`₹${(parseFloat(selectedTask.ltv) || 0).toLocaleString()}`} />
              <SnapItem label="Health Score" value={selectedTask.health_score || "—"} valueColor={parseInt(selectedTask.health_score) < 50 ? "#EF4444" : "#16A34A"} />
              <SnapItem label="Last Order" value={selectedTask.last_order_date || "—"} />
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link to={`/customers/${selectedTask.customer_id}`}
                style={{ padding: "6px 12px", background: "var(--teal)", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <User size={13} /> Open 360°
              </Link>
              <Link to={`/calls/workspace/${selectedTask.customer_id}`}
                style={{ padding: "6px 12px", background: "#F97316", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <PhoneCall size={13} /> Call Now
              </Link>
              {selectedTask.ticket_id && (
                <Link to={`/tickets/${selectedTask.ticket_id}`}
                  style={{ padding: "6px 12px", background: "#6D28D9", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                  <TicketIcon size={13} /> View Ticket
                </Link>
              )}
            </div>
          </div>

          {/* Smart Recommendation */}
          <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)", background: "#FFFBEB" }}>
            <h3 style={{ ...sectionHeadStyle, color: "#92400E" }}>🎯 Smart Recommendation</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div><span style={{ fontSize: 12, color: "#78350F", fontWeight: 600 }}>Queue Reason</span><p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#92400E" }}>{selectedTask.reason}</p></div>
              <div><span style={{ fontSize: 12, color: "#78350F", fontWeight: 600 }}>Recommended Action</span><p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#92400E" }}>{selectedTask.recommended_action || "Review customer profile and engage proactively."}</p></div>
              {selectedTask.sla_deadline && (
                <div>
                  <span style={{ fontSize: 12, color: "#78350F", fontWeight: 600 }}>SLA Deadline</span>
                  <SLACountdown deadline={selectedTask.sla_deadline} />
                </div>
              )}
            </div>
            
            <ContextualKnowledgeWidget intent={selectedTask.reason} />
          </div>

          {/* Quick Actions */}
          <div style={{ padding: 20 }}>
            <h3 style={sectionHeadStyle}>Update Status</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["in_progress", "contacted", "resolved", "completed"].map(s => (
                <button key={s} onClick={() => handleStatusChange(selectedTask.id, s)}
                  style={{ padding: "7px 14px", background: STATUS_COLORS[s]?.bg, color: STATUS_COLORS[s]?.color, border: `1px solid ${STATUS_COLORS[s]?.color}44`, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {STATUS_COLORS[s]?.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              {!showFollowup ? (
                <button onClick={() => setShowFollowup(true)}
                  style={{ padding: "8px 16px", background: "#F5F3FF", color: "#6D28D9", border: "1px solid #C4B5FD", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} /> Schedule Follow-up
                </button>
              ) : (
                <div style={{ background: "#F5F3FF", padding: 16, borderRadius: 8, border: "1px solid #C4B5FD" }}>
                  <label style={labelStyle}>Follow-up Date & Time</label>
                  <input type="datetime-local" value={followupDate} onChange={e => setFollowupDate(e.target.value)} style={inputStyle} />
                  <label style={{ ...labelStyle, marginTop: 10 }}>Reason</label>
                  <input type="text" placeholder="Follow-up reason…" value={followupReason} onChange={e => setFollowupReason(e.target.value)} style={inputStyle} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={handleFollowup} style={{ padding: "7px 14px", background: "#6D28D9", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Confirm</button>
                    <button onClick={() => setShowFollowup(false)} style={{ padding: "7px 14px", background: "none", color: "var(--slate)", border: "none", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, selected, onClick, onStatusChange }) {
  const sla = task.sla_deadline ? new Date(task.sla_deadline) : null;
  const minsLeft = sla ? Math.round((sla - Date.now()) / 60000) : null;
  const isBreached = minsLeft !== null && minsLeft < 0;
  const isUrgent = minsLeft !== null && minsLeft < 60 && minsLeft >= 0;
  const statusInfo = STATUS_COLORS[task.status] || STATUS_COLORS.assigned;

  return (
    <div onClick={onClick} style={{ padding: 16, borderRadius: 10, border: `1px solid ${selected ? "var(--teal)" : "var(--card-border)"}`, background: selected ? "#F0FDF4" : "#fff", marginBottom: 8, cursor: "pointer", transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ padding: "2px 8px", background: task.color + "22", color: task.color, borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{task.queue_name}</span>
            <span style={{ padding: "2px 8px", background: statusInfo.bg, color: statusInfo.color, borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{statusInfo.label}</span>
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{task.customer_name}</p>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "var(--slate)" }}>{task.reason}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          {sla && (
            <div style={{ fontSize: 11, fontWeight: 700, color: isBreached ? "#DC2626" : isUrgent ? "#D97706" : "var(--slate)" }}>
              {isBreached ? "⚠ SLA Breached" : isUrgent ? `⏱ ${minsLeft}m left` : <span style={{ color: "var(--slate)" }}>{sla.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
            </div>
          )}
          {task.ltv > 0 && <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 2 }}>LTV ₹{parseFloat(task.ltv).toLocaleString()}</div>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, "in_progress"); }}
          style={{ padding: "4px 10px", background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          Start
        </button>
        <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, "completed"); }}
          style={{ padding: "4px 10px", background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          Complete
        </button>
        <ChevronRight size={16} color="var(--muted)" style={{ marginLeft: "auto", alignSelf: "center" }} />
      </div>
    </div>
  );
}

function SLACountdown({ deadline }) {
  const d = new Date(deadline);
  const minsLeft = Math.round((d - Date.now()) / 60000);
  const color = minsLeft < 0 ? "#EF4444" : minsLeft < 30 ? "#F97316" : "#16A34A";
  const label = minsLeft < 0 ? `Breached ${Math.abs(minsLeft)}m ago` : `${minsLeft}m remaining`;
  return <p style={{ margin: "2px 0 0 0", fontSize: 13, color, fontWeight: 700 }}><Clock size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />{label}</p>;
}

function KPIChip({ label, value, color }) {
  return (
    <div style={{ textAlign: "center", padding: "6px 14px", background: "var(--bg-wash)", borderRadius: 8, border: "1px solid var(--card-border)" }}>
      <p style={{ margin: 0, fontSize: 11, color: "var(--slate)", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

function SnapItem({ label, value, valueColor }) {
  return (
    <div style={{ background: "var(--bg-wash)", padding: 10, borderRadius: 6 }}>
      <p style={{ margin: 0, fontSize: 11, color: "var(--slate)", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "2px 0 0 0", fontSize: 14, fontWeight: 700, color: valueColor || "var(--ink)" }}>{value}</p>
    </div>
  );
}

const sectionHeadStyle = { fontSize: 11, textTransform: "uppercase", fontWeight: 800, color: "var(--slate)", letterSpacing: "0.06em", margin: "0 0 12px 0" };
const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--card-border)", fontSize: 13, outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 6 };
