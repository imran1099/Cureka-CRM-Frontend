import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  ArrowLeft, Search, Filter, Plus, X, ChevronDown, ChevronUp,
  User, Phone, TrendingUp, Ticket, PhoneCall, Package, Clock, BarChart2, Lock
} from "lucide-react";

const CATEGORY_COLORS = {
  customer: "#7C3AED",
  order:    "#2563EB",
  sales:    "#059669",
  call:     "#0891B2",
  support:  "#DC2626",
  internal: "#92400E",
};

const CATEGORY_BG = {
  customer: "#F5F3FF",
  order:    "#EFF6FF",
  sales:    "#ECFDF5",
  call:     "#ECFEFF",
  support:  "#FEF2F2",
  internal: "#FFFBEB",
};

export default function CustomerJourneyPage() {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [events, setEvents] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [insights, setInsights] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [includeInternal, setIncludeInternal] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Note composer
  const [noteText, setNoteText] = useState("");
  const [noteIsInternal, setNoteIsInternal] = useState(true);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Expanded events
  const [expandedIds, setExpandedIds] = useState(new Set());

  const loaderRef = useRef(null);

  // ── Load customer profile ──────────────────────────────────────────────
  useEffect(() => {
    api.getCustomer(customerId).then(d => setCustomer(d?.customer || d)).catch(() => {});
    api.timeline.getMilestones(customerId).then(d => setMilestones(d.milestones || [])).catch(() => {});
    api.timeline.getInsights(customerId).then(d => setInsights(d.insights || [])).catch(() => {});
    api.timeline.getAnalytics(customerId).then(d => setAnalytics(d)).catch(() => {});
    api.timeline.getEventTypes().then(d => setEventTypes(d.types || [])).catch(() => {});
  }, [customerId]);

  // ── Load events (page 1) ───────────────────────────────────────────────
  const loadEvents = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) setLoading(true); else setLoadingMore(true);

    const params = { page: currentPage, limit: 25, include_internal: includeInternal };
    if (search) params.q = search;
    if (filterCategory) params.category = filterCategory;
    if (filterDateFrom) params.date_from = filterDateFrom;
    if (filterDateTo) params.date_to = filterDateTo;

    try {
      const res = await api.timeline.getEvents(customerId, params);
      const fetched = res.events || [];
      setTotal(res.total || 0);
      setHasMore(currentPage < (res.totalPages || 1));
      setEvents(prev => reset ? fetched : [...prev, ...fetched]);
      if (!reset) setPage(p => p + 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [customerId, page, search, filterCategory, filterDateFrom, filterDateTo, includeInternal]);

  useEffect(() => { setPage(1); loadEvents(true); }, [search, filterCategory, filterDateFrom, filterDateTo, includeInternal, customerId]);

  // ── Infinite scroll ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore) loadEvents(false);
    }, { threshold: 0.5 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loadEvents]);

  // ── Group events by date ───────────────────────────────────────────────
  const grouped = events.reduce((acc, ev) => {
    const date = new Date(ev.created_at).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(ev);
    return acc;
  }, {});

  const toggleExpand = (id) => setExpandedIds(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmittingNote(true);
    try {
      await api.timeline.addNote(customerId, { content: noteText, is_internal: noteIsInternal });
      setNoteText("");
      loadEvents(true);
    } catch (err) { alert(err.message); }
    finally { setSubmittingNote(false); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F8FAFC", overflow: "hidden" }}>

      {/* ── Left Context Panel ──────────────────────────────────────────── */}
      <aside style={{ width: 280, background: "#fff", borderRight: "1px solid #E2E8F0", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <button onClick={() => navigate(`/customers/${customerId}`)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 12.5, fontWeight: 600, padding: 0, marginBottom: 14 }}>
            <ArrowLeft size={13} /> Back to Profile
          </button>
          <div style={{ display: "flex", align: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #6D28D9, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
              {customer?.name?.[0] || "?"}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>{customer?.name || "Loading…"}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{customer?.phone}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link to={`/customers/${customerId}`} style={quickBtn("#6D28D9")}><User size={12} /> 360°</Link>
            <Link to={`/calls/workspace/${customerId}`} style={quickBtn("#059669")}><Phone size={12} /> Call</Link>
            <Link to={`/tickets`} style={quickBtn("#DC2626")}><Ticket size={12} /> Ticket</Link>
          </div>
        </div>

        {/* Segment + Health */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <SectionLabel>Customer Status</SectionLabel>
          <CtxRow label="Segment" value={customer?.segment} />
          <CtxRow label="LTV" value={`₹${parseFloat(customer?.ltv || 0).toLocaleString()}`} valueColor="#059669" />
          <CtxRow label="Health Score" value={customer?.health_score || "—"}
            valueColor={parseInt(customer?.health_score) >= 70 ? "#16A34A" : parseInt(customer?.health_score) >= 40 ? "#D97706" : "#DC2626"} />
          <CtxRow label="Source" value={customer?.source} />
        </div>

        {/* Analytics */}
        {analytics && (
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
            <SectionLabel>Journey Analytics</SectionLabel>
            <CtxRow label="Total Events" value={analytics.total_events} />
            <CtxRow label="Support Interactions" value={analytics.support_interactions} valueColor={analytics.support_interactions >= 3 ? "#DC2626" : undefined} />
            <CtxRow label="Total Calls" value={analytics.total_calls} />
            <CtxRow label="Total Purchases" value={analytics.total_purchases} valueColor="#059669" />
            <CtxRow label="Customer Since" value={analytics.lifecycle_days != null ? `${analytics.lifecycle_days} days` : "—"} />
            {analytics.avg_days_between_purchases && (
              <CtxRow label="Avg. Purchase Interval" value={`${analytics.avg_days_between_purchases} days`} />
            )}
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
            <SectionLabel>Milestones 🏆</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {milestones.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "linear-gradient(90deg, #FFFBEB, #FEF3C7)", border: "1px solid #FDE68A", borderRadius: 8 }}>
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div style={{ padding: "16px 20px" }}>
            <SectionLabel>💡 Auto-Insights</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {insights.map(ins => (
                <div key={ins.id} style={{ padding: "8px 10px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, fontSize: 12, color: "#166534", lineHeight: 1.5 }}>
                  {ins.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Timeline Area ─────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Sticky Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "14px 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={18} color="#6D28D9" /> Customer Journey Timeline
              </h1>
              <p style={{ margin: 0, fontSize: 12.5, color: "#64748B" }}>{total} events recorded · {customer?.name}</p>
            </div>
            <button onClick={() => setFiltersOpen(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: filtersOpen ? "#6D28D9" : "#F1F5F9", color: filtersOpen ? "#fff" : "#374151", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <Filter size={14} /> Filters
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); }}
              placeholder="Search events, descriptions…"
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Filter Bar */}
          {filtersOpen && (
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                style={filterSelect}>
                <option value="">All Categories</option>
                {["customer","order","sales","call","support","internal"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={filterSelect} />
              <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={filterSelect} />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#374151", fontWeight: 600 }}>
                <input type="checkbox" checked={includeInternal} onChange={e => setIncludeInternal(e.target.checked)} /> Show Internal Notes
              </label>
              <button onClick={() => { setSearch(""); setFilterCategory(""); setFilterDateFrom(""); setFilterDateTo(""); setIncludeInternal(true); }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <X size={12} /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Note Composer */}
        <div style={{ padding: "14px 24px", background: "#FAFAFA", borderBottom: "1px solid #E2E8F0", flexShrink: 0 }}>
          <form onSubmit={handleAddNote} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: noteIsInternal ? "#92400E" : "#374151" }}>
                  <input type="radio" checked={noteIsInternal} onChange={() => setNoteIsInternal(true)} /> <Lock size={11} /> Internal (Private)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: !noteIsInternal ? "#2563EB" : "#374151" }}>
                  <input type="radio" checked={!noteIsInternal} onChange={() => setNoteIsInternal(false)} /> Public Note
                </label>
              </div>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2}
                placeholder={noteIsInternal ? "🔒 Add an internal note (not visible to customers)…" : "Add a public note…"}
                style={{ width: "100%", padding: "8px 12px", border: `1px solid ${noteIsInternal ? "#FDE68A" : "#E2E8F0"}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", background: noteIsInternal ? "#FFFBEB" : "#fff" }} />
            </div>
            <button type="submit" disabled={submittingNote || !noteText.trim()}
              style={{ padding: "10px 18px", background: noteIsInternal ? "#92400E" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
              <Plus size={14} style={{ display: "inline", marginRight: 4 }} />Log Note
            </button>
          </form>
        </div>

        {/* Timeline Scroll Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 72, background: "#E2E8F0", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80, color: "#94A3B8" }}>
              <Clock size={48} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 16, fontWeight: 600 }}>No timeline events yet</p>
              <p style={{ fontSize: 13 }}>Start logging calls, tickets, and opportunities to build this customer's journey.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, dayEvents]) => (
              <div key={date}>
                {/* Sticky Date Header */}
                <div style={{ position: "sticky", top: 0, zIndex: 10, margin: "0 -8px 16px -8px", padding: "6px 16px", background: "linear-gradient(90deg, #6D28D9, #2563EB)", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
                  {date}
                </div>

                <div style={{ position: "relative", paddingLeft: 40 }}>
                  {/* Vertical line */}
                  <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, background: "#E2E8F0" }} />

                  {dayEvents.map((ev, idx) => {
                    const cat = ev.event_category || "customer";
                    const color = ev.event_color || CATEGORY_COLORS[cat] || "#64748B";
                    const bg = CATEGORY_BG[cat] || "#F8FAFC";
                    const isExpanded = expandedIds.has(ev.id);
                    const isInternal = ev.is_internal === 1;

                    return (
                      <div key={ev.id} style={{ position: "relative", marginBottom: 16 }}>
                        {/* Dot */}
                        <div style={{
                          position: "absolute", left: -32, top: 14, width: 28, height: 28,
                          borderRadius: "50%", background: bg, border: `2px solid ${color}`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                        }}>
                          {ev.event_icon || "📌"}
                        </div>

                        {/* Card */}
                        <div style={{
                          background: isInternal ? "#FFFBEB" : "#fff",
                          border: `1px solid ${isInternal ? "#FDE68A" : "#E2E8F0"}`,
                          borderLeft: `3px solid ${color}`,
                          borderRadius: 10,
                          padding: "12px 16px",
                          cursor: "pointer",
                          transition: "box-shadow 0.15s",
                        }} onClick={() => toggleExpand(ev.id)}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                {isInternal && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", background: "#FEF3C7", color: "#92400E", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                                    <Lock size={9} /> Internal
                                  </span>
                                )}
                                <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: bg, color }}>
                                  {ev.event_label || ev.event_type}
                                </span>
                                {ev.brand_name && (
                                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#F1F5F9", color: "#475569" }}>
                                    {ev.brand_name}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{ev.event_title}</div>
                              {ev.event_description && !isExpanded && (
                                <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 480 }}>
                                  {ev.event_description}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
                              {ev.agent_name && (
                                <span style={{ fontSize: 11.5, color: "#64748B", display: "flex", alignItems: "center", gap: 3 }}>
                                  <User size={11} /> {ev.agent_name}
                                </span>
                              )}
                              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                                {new Date(ev.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isExpanded ? <ChevronUp size={14} color="#94A3B8" /> : <ChevronDown size={14} color="#94A3B8" />}
                            </div>
                          </div>

                          {/* Expanded Drill-down */}
                          {isExpanded && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F1F5F9" }}>
                              {ev.event_description && (
                                <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{ev.event_description}</p>
                              )}
                              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                {ev.outcome && <DrillItem label="Outcome" value={ev.outcome} />}
                                {ev.department && <DrillItem label="Department" value={ev.department} />}
                                {ev.source_system && <DrillItem label="Source" value={ev.source_system} />}
                                {ev.ref_id && ev.ref_type && (
                                  <DrillItem label={`Related ${ev.ref_type}`} value={
                                    ev.ref_type === "ticket" ? (
                                      <Link to={`/tickets/${ev.ref_id}`} style={{ color: "#2563EB", textDecoration: "none", fontWeight: 700 }}>
                                        View Ticket →
                                      </Link>
                                    ) : ev.ref_type === "opportunity" ? (
                                      <Link to={`/pipeline/${ev.ref_id}`} style={{ color: "#059669", textDecoration: "none", fontWeight: 700 }}>
                                        View Opportunity →
                                      </Link>
                                    ) : ev.ref_id
                                  } />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Infinite scroll loader */}
          {hasMore && !loading && <div ref={loaderRef} style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 13 }}>
            {loadingMore ? "Loading more…" : ""}
          </div>}
          {!hasMore && events.length > 0 && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8", fontSize: 12 }}>
              — End of timeline — {total} events total
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return <p style={{ margin: "0 0 10px 0", fontSize: 10.5, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.07em", textTransform: "uppercase" }}>{children}</p>;
}

function CtxRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: valueColor || "#0F172A", textAlign: "right", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function DrillItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#374151", fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}

const quickBtn = (color) => ({
  display: "flex", alignItems: "center", gap: 4,
  padding: "5px 10px", background: color + "15", color,
  border: `1px solid ${color}30`, borderRadius: 6,
  textDecoration: "none", fontSize: 11.5, fontWeight: 700, flexShrink: 0,
});

const filterSelect = {
  padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 7,
  fontSize: 12.5, outline: "none", background: "#fff", color: "#374151",
};

