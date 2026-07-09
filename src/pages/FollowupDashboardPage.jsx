import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  CheckCircle, Clock, AlertTriangle, Phone, Calendar, ChevronRight,
  User, TrendingUp, Search, Filter, X, RefreshCw, ChevronDown,
  Zap, Target, ArrowUpRight, BarChart2, ListChecks, Flag
} from "lucide-react";

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#DC2626", bg: "#FEF2F2", icon: "🔴", border: "#FECACA" },
  high:     { label: "High",     color: "#EA580C", bg: "#FFF7ED", icon: "🟠", border: "#FED7AA" },
  medium:   { label: "Medium",   color: "#CA8A04", bg: "#FEFCE8", icon: "🟡", border: "#FEF08A" },
  low:      { label: "Low",      color: "#16A34A", bg: "#F0FDF4", icon: "🟢", border: "#BBF7D0" },
};

const STATUS_CONFIG = {
  scheduled:   { label: "Scheduled",   color: "#2563EB", bg: "#EFF6FF" },
  pending:     { label: "Pending",      color: "#7C3AED", bg: "#F5F3FF" },
  in_progress: { label: "In Progress", color: "#D97706", bg: "#FFFBEB" },
  overdue:     { label: "Overdue",     color: "#DC2626", bg: "#FEF2F2" },
  completed:   { label: "Completed",   color: "#16A34A", bg: "#F0FDF4" },
  cancelled:   { label: "Cancelled",   color: "#6B7280", bg: "#F9FAFB" },
};

const OUTCOMES = [
  "Contacted - Interested", "Contacted - Not Interested", "Order Placed", "Payment Received",
  "Cart Recovered", "Refund Processed", "Issue Resolved", "Will Call Back",
  "Wrong Number", "Voicemail Left", "No Answer", "Follow-up Rescheduled",
];

export default function FollowupDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("due_today");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Modals
  const [completeModal, setCompleteModal] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [completeForm, setCompleteForm] = useState({ outcome: "", notes: "" });
  const [rescheduleForm, setRescheduleForm] = useState({ due_at: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, cats] = await Promise.all([
        api.followups.getDashboardToday(),
        api.followups.getCategories(),
      ]);
      setDashboard(dash);
      setCategories(cats.categories || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeItems = dashboard ? (
    activeTab === "overdue"    ? dashboard.overdue :
    activeTab === "due_today"  ? dashboard.due_today :
    activeTab === "upcoming"   ? dashboard.upcoming :
    dashboard.completed_today
  ) : [];

  const filtered = (activeItems || []).filter(f => {
    if (search && !f.customer_name?.toLowerCase().includes(search.toLowerCase()) && !f.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && f.category_id !== filterCategory) return false;
    if (filterPriority && f.priority !== filterPriority) return false;
    return true;
  });

  const handleComplete = async () => {
    if (!completeForm.outcome) return alert("Please select an outcome");
    setSubmitting(true);
    try {
      await api.followups.update(completeModal.id, { action: "complete", ...completeForm });
      setCompleteModal(null);
      setSelected(null);
      setCompleteForm({ outcome: "", notes: "" });
      load();
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleReschedule = async () => {
    if (!rescheduleForm.due_at || !rescheduleForm.reason) return alert("Date and reason are required");
    setSubmitting(true);
    try {
      await api.followups.update(rescheduleModal.id, { action: "reschedule", ...rescheduleForm });
      setRescheduleModal(null);
      setSelected(null);
      setRescheduleForm({ due_at: "", reason: "" });
      load();
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleEscalate = async (fup) => {
    if (!window.confirm(`Escalate "${fup.title}" to the next level?`)) return;
    await api.followups.update(fup.id, { action: "escalate", reason: "Manually escalated by agent" });
    load();
  };

  const isOverdue = (f) => new Date(f.due_at) < new Date() && f.status !== "completed";

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F8FAFC", overflow: "hidden" }}>

      {/* ── Main List ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                <ListChecks size={20} color="#6D28D9" /> Follow-up Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 12.5, color: "#64748B", marginTop: 2 }}>
                Today's AI-prioritised work plan
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={load} style={ghostBtn}><RefreshCw size={13} /> Refresh</button>
              <button onClick={() => setFiltersOpen(v => !v)} style={{ ...ghostBtn, background: filtersOpen ? "#6D28D9" : "#F1F5F9", color: filtersOpen ? "#fff" : "#374151" }}>
                <Filter size={13} /> Filters
              </button>
              <Link to="/followups/new" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "linear-gradient(135deg, #6D28D9, #2563EB)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                + New Follow-up
              </Link>
              <Link to="/followups/analytics" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                <BarChart2 size={13} /> Analytics
              </Link>
            </div>
          </div>

          {/* KPI Strip */}
          {dashboard && (
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[
                { label: "🔴 Overdue", count: dashboard.overdue_count, tab: "overdue", color: "#DC2626", bg: "#FEF2F2" },
                { label: "🟠 Due Today", count: dashboard.due_today_count, tab: "due_today", color: "#EA580C", bg: "#FFF7ED" },
                { label: "📅 Upcoming", count: dashboard.upcoming_count, tab: "upcoming", color: "#2563EB", bg: "#EFF6FF" },
                { label: "✅ Done Today", count: dashboard.completed_today_count, tab: "completed", color: "#16A34A", bg: "#F0FDF4" },
              ].map(k => (
                <button key={k.tab} onClick={() => setActiveTab(k.tab)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${k.bg}`, background: activeTab === k.tab ? k.color : k.bg,
                    color: activeTab === k.tab ? "#fff" : k.color, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                  {k.label} <span style={{ fontSize: 16, marginLeft: 4 }}>{k.count}</span>
                </button>
              ))}
              {dashboard.summary && Object.keys(dashboard.summary).length > 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, overflow: "hidden", flexWrap: "wrap" }}>
                  {Object.entries(dashboard.summary).slice(0, 5).map(([cat, cnt]) => (
                    <span key={cat} style={{ fontSize: 11, padding: "3px 8px", background: "#F1F5F9", borderRadius: 20, color: "#475569", fontWeight: 700 }}>
                      {cat}: {cnt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search + Filters */}
          <div style={{ position: "relative", marginBottom: filtersOpen ? 10 : 0 }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customer or follow-up title…"
              style={{ width: "100%", padding: "8px 12px 8px 34px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          {filtersOpen && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={filterSel}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={filterSel}>
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <button onClick={() => { setFilterCategory(""); setFilterPriority(""); setSearch(""); }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <X size={11} /> Clear
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ height: 80, background: "#E2E8F0", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
              <CheckCircle size={48} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 16, fontWeight: 600 }}>
                {activeTab === "completed" ? "No completed follow-ups yet today" : "No follow-ups here"}
              </p>
              <p style={{ fontSize: 13 }}>Great work! You're all caught up. 🎉</p>
            </div>
          ) : (
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(fup => {
                const pri = PRIORITY_CONFIG[fup.priority] || PRIORITY_CONFIG.medium;
                const isSelected = selected?.id === fup.id;
                const overdue = isOverdue(fup);
                return (
                  <div key={fup.id}
                    onClick={() => setSelected(isSelected ? null : fup)}
                    style={{
                      background: "#fff", borderRadius: 10, padding: "14px 16px",
                      border: `1px solid ${isSelected ? pri.color : overdue ? "#FECACA" : "#E2E8F0"}`,
                      borderLeft: `3px solid ${pri.color}`,
                      cursor: "pointer", transition: "box-shadow 0.15s",
                      boxShadow: isSelected ? `0 0 0 2px ${pri.color}40` : "none",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13 }}>{pri.icon}</span>
                          {fup.category_icon && <span style={{ fontSize: 14 }}>{fup.category_icon}</span>}
                          <span style={{ fontSize: 11, fontWeight: 700, background: pri.bg, color: pri.color, padding: "2px 8px", borderRadius: 20 }}>{pri.label}</span>
                          {fup.category_name && (
                            <span style={{ fontSize: 11, fontWeight: 600, background: "#F1F5F9", color: "#475569", padding: "2px 8px", borderRadius: 20 }}>{fup.category_name}</span>
                          )}
                          {overdue && <span style={{ fontSize: 11, fontWeight: 800, background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 20 }}>⚠️ OVERDUE</span>}
                          {fup.escalation_level > 0 && <span style={{ fontSize: 11, fontWeight: 800, background: "#FFF7ED", color: "#EA580C", padding: "2px 8px", borderRadius: 20 }}>↑ L{fup.escalation_level} Escalation</span>}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{fup.title}</div>
                        <div style={{ fontSize: 12.5, color: "#64748B", display: "flex", gap: 12, flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <User size={11} /> {fup.customer_name} · {fup.customer_phone}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={11} /> {new Date(fup.due_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                          {fup.health_score && (
                            <span style={{ color: parseInt(fup.health_score) >= 70 ? "#16A34A" : parseInt(fup.health_score) >= 40 ? "#D97706" : "#DC2626" }}>
                              ❤️ {fup.health_score}
                            </span>
                          )}
                          {fup.ltv > 0 && <span style={{ color: "#059669" }}>💎 ₹{parseFloat(fup.ltv).toLocaleString()}</span>}
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }} onClick={e => e.stopPropagation()}>
                        <ActionBtn color="#059669" bg="#F0FDF4" onClick={() => setCompleteModal(fup)} title="Complete">
                          <CheckCircle size={14} />
                        </ActionBtn>
                        <ActionBtn color="#2563EB" bg="#EFF6FF" onClick={() => setRescheduleModal(fup)} title="Reschedule">
                          <Calendar size={14} />
                        </ActionBtn>
                        <ActionBtn color="#EA580C" bg="#FFF7ED" onClick={() => handleEscalate(fup)} title="Escalate">
                          <Flag size={14} />
                        </ActionBtn>
                        <Link to={`/customers/${fup.customer_id}`} style={{ ...iconBtn, color: "#6D28D9", background: "#F5F3FF" }} title="View Customer">
                          <ArrowUpRight size={14} />
                        </Link>
                        <a href={`tel:${fup.customer_phone}`} style={{ ...iconBtn, color: "#0891B2", background: "#ECFEFF" }} title="Call">
                          <Phone size={14} />
                        </a>
                      </div>
                    </div>

                    {/* Description preview */}
                    {fup.description && !isSelected && (
                      <div style={{ marginTop: 6, fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {fup.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Side Panel ─────────────────────────────────────────────────── */}
      {selected && (
        <aside style={{ width: 320, background: "#fff", borderLeft: "1px solid #E2E8F0", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          {/* Customer snapshot */}
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <PanelLabel>Customer Snapshot</PanelLabel>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={14} /></button>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#6D28D9,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {selected.customer_name?.[0] || "?"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>{selected.customer_name}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{selected.customer_phone}</div>
              </div>
            </div>
            <SnapRow label="Segment" value={selected.segment} />
            <SnapRow label="LTV" value={`₹${parseFloat(selected.ltv || 0).toLocaleString()}`} valueColor="#059669" />
            <SnapRow label="Health Score" value={selected.health_score}
              valueColor={parseInt(selected.health_score) >= 70 ? "#16A34A" : parseInt(selected.health_score) >= 40 ? "#D97706" : "#DC2626"} />
            <SnapRow label="Priority" value={(PRIORITY_CONFIG[selected.priority]?.icon || "") + " " + (PRIORITY_CONFIG[selected.priority]?.label || selected.priority)} />
            <SnapRow label="Due" value={new Date(selected.due_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />
            <SnapRow label="Source" value={selected.source} />
            {selected.escalation_level > 0 && (
              <SnapRow label="Escalation" value={`Level ${selected.escalation_level}`} valueColor="#EA580C" />
            )}
          </div>

          {/* Suggested Script */}
          {selected.category_id && (
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0" }}>
              <PanelLabel>💬 Suggested Script</PanelLabel>
              <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.7, background: "#F8FAFC", padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                {getScript(selected)}
              </div>
            </div>
          )}

          {/* Description */}
          {selected.description && (
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0" }}>
              <PanelLabel>Notes</PanelLabel>
              <p style={{ margin: 0, fontSize: 12.5, color: "#374151", lineHeight: 1.6 }}>{selected.description}</p>
            </div>
          )}

          {/* Quick Links */}
          <div style={{ padding: "14px 20px" }}>
            <PanelLabel>Quick Actions</PanelLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ActionLinkBtn icon={<CheckCircle size={13} />} label="Mark Complete" color="#059669" onClick={() => setCompleteModal(selected)} />
              <ActionLinkBtn icon={<Calendar size={13} />} label="Reschedule" color="#2563EB" onClick={() => setRescheduleModal(selected)} />
              <ActionLinkBtn icon={<Flag size={13} />} label="Escalate" color="#EA580C" onClick={() => handleEscalate(selected)} />
              <Link to={`/customers/${selected.customer_id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F5F3FF", color: "#6D28D9", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                <User size={13} /> Open Customer 360°
              </Link>
              <Link to={`/journey/${selected.customer_id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#EFF6FF", color: "#2563EB", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                <Clock size={13} /> View Journey Timeline
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* ── Complete Modal ────────────────────────────────────────────────────── */}
      {completeModal && (
        <Modal title={`✅ Complete: ${completeModal.title}`} onClose={() => setCompleteModal(null)}>
          <label style={modalLabel}>Outcome <span style={{ color: "#DC2626" }}>*</span></label>
          <select value={completeForm.outcome} onChange={e => setCompleteForm(f => ({ ...f, outcome: e.target.value }))} style={modalInput}>
            <option value="">Select an outcome…</option>
            {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <label style={{ ...modalLabel, marginTop: 12 }}>Notes</label>
          <textarea value={completeForm.notes} onChange={e => setCompleteForm(f => ({ ...f, notes: e.target.value }))}
            rows={3} placeholder="Additional notes…" style={{ ...modalInput, resize: "none" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={handleComplete} disabled={submitting}
              style={{ flex: 1, padding: "10px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              {submitting ? "Saving…" : "Mark Complete"}
            </button>
            <button onClick={() => setCompleteModal(null)} style={{ padding: "10px 16px", background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── Reschedule Modal ─────────────────────────────────────────────────── */}
      {rescheduleModal && (
        <Modal title={`📅 Reschedule: ${rescheduleModal.title}`} onClose={() => setRescheduleModal(null)}>
          <label style={modalLabel}>New Date & Time <span style={{ color: "#DC2626" }}>*</span></label>
          <input type="datetime-local" value={rescheduleForm.due_at} onChange={e => setRescheduleForm(f => ({ ...f, due_at: e.target.value }))} style={modalInput} />
          <label style={{ ...modalLabel, marginTop: 12 }}>Reason <span style={{ color: "#DC2626" }}>*</span></label>
          <textarea value={rescheduleForm.reason} onChange={e => setRescheduleForm(f => ({ ...f, reason: e.target.value }))}
            rows={2} placeholder="Why are you rescheduling?" style={{ ...modalInput, resize: "none" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={handleReschedule} disabled={submitting}
              style={{ flex: 1, padding: "10px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              {submitting ? "Saving…" : "Reschedule"}
            </button>
            <button onClick={() => setRescheduleModal(null)} style={{ padding: "10px 16px", background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PanelLabel({ children }) {
  return <p style={{ margin: "0 0 10px 0", fontSize: 10.5, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.07em", textTransform: "uppercase" }}>{children}</p>;
}

function SnapRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: valueColor || "#0F172A", maxWidth: 160, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
    </div>
  );
}

function ActionBtn({ children, color, bg, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 30, height: 30, borderRadius: 7, background: bg, color, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      {children}
    </button>
  );
}

function ActionLinkBtn({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: color + "15", color, border: `1px solid ${color}30`, borderRadius: 8, textAlign: "left", width: "100%", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
      {icon} {label}
    </button>
  );
}

const iconBtn = { width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 12 };

function getScript(fup) {
  const scripts = {
    fcat_abandoned_cart: `"Hi ${fup.customer_name}, I noticed you left some items in your cart. I wanted to check if you had any questions about your order? We can also help you complete the purchase now."`,
    fcat_ctwa_lead: `"Hi ${fup.customer_name}, thanks for reaching out to us. I'm calling to understand how we can help you. Do you have a moment to speak?"`,
    fcat_complaint: `"Hi ${fup.customer_name}, I'm following up on your complaint. I want to ensure we've resolved your issue completely. Can you confirm if everything is sorted?"`,
    fcat_delivered_fu: `"Hi ${fup.customer_name}, your order has been delivered! How are you finding the product so far? We'd love your feedback."`,
    fcat_refund: `"Hi ${fup.customer_name}, I'm following up on your refund request. I'd like to update you on the current status and timeline."`,
    fcat_payment_pending: `"Hi ${fup.customer_name}, we noticed your payment is still pending for your recent order. Can I help you complete the payment now?"`,
  };
  return scripts[fup.category_id] || `"Hi ${fup.customer_name}, I'm calling regarding your ${fup.title}. Do you have a moment to speak?"`;
}

const ghostBtn = { display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "#F1F5F9", color: "#374151", border: "1px solid #E2E8F0", borderRadius: 8, fontWeight: 600, fontSize: 12.5, cursor: "pointer" };
const filterSel = { padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 7, fontSize: 12.5, outline: "none", background: "#fff", color: "#374151" };
const modalLabel = { display: "block", fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 6 };
const modalInput = { width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
