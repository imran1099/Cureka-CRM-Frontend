import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { BarChart2, TrendingUp, Users, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const PRIORITY_COLORS = { critical: "#DC2626", high: "#EA580C", medium: "#CA8A04", low: "#16A34A" };
const GROUP_COLORS = { sales: "#2563EB", success: "#059669", support: "#DC2626", operations: "#D97706", internal: "#6B7280" };

export default function FollowupAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.followups.getStats({ date_from: dateFrom, date_to: dateTo });
      setStats(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [dateFrom, dateTo]);

  if (loading) return <PageLoader />;
  if (!stats) return null;

  const { totals, completion_rate, overdue_rate, by_category = [], by_agent = [], by_status = [] } = stats;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "24px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 size={20} color="#6D28D9" /> Follow-up Analytics
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748B", marginTop: 2 }}>Team performance & follow-up execution insights</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={filterSel} placeholder="From" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={filterSel} placeholder="To" />
          <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={ghostBtn}>Clear</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard icon={<BarChart2 size={18} />} label="Total Follow-ups" value={totals?.total || 0} color="#6D28D9" />
        <KpiCard icon={<CheckCircle size={18} />} label="Completed" value={totals?.completed || 0} sub={`${completion_rate}%`} color="#059669" />
        <KpiCard icon={<AlertTriangle size={18} />} label="Overdue" value={totals?.overdue || 0} sub={`${overdue_rate}%`} color="#DC2626" />
        <KpiCard icon={<Clock size={18} />} label="Pending" value={totals?.pending || 0} color="#D97706" />
        <KpiCard icon={<TrendingUp size={18} />} label="Completion Rate" value={`${completion_rate}%`} color={completion_rate >= 80 ? "#059669" : completion_rate >= 60 ? "#D97706" : "#DC2626"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* By Category */}
        <div style={card}>
          <h3 style={cardTitle}>📊 Follow-ups by Category</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {by_category.slice(0, 10).map(cat => {
              const total = cat.cnt || 0;
              const max = by_category[0]?.cnt || 1;
              const pct = Math.round((total / max) * 100);
              const completionPct = total > 0 ? Math.round((cat.completed / total) * 100) : 0;
              const groupColor = GROUP_COLORS[cat.group_name] || "#6B7280";
              return (
                <div key={cat.category || "General"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
                      {cat.icon || "📋"} {cat.category || "General"}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748B" }}>
                      {cat.completed}/{total} ({completionPct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: groupColor, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Status */}
        <div style={card}>
          <h3 style={cardTitle}>📋 Status Distribution</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {by_status.map(s => {
              const total = (totals?.total || 1);
              const pct = Math.round((s.cnt / total) * 100);
              const colors = {
                scheduled: "#2563EB", pending: "#7C3AED", in_progress: "#D97706",
                overdue: "#DC2626", completed: "#059669", cancelled: "#6B7280",
              };
              const color = colors[s.status] || "#6B7280";
              const labels = {
                scheduled: "Scheduled", pending: "Pending", in_progress: "In Progress",
                overdue: "⚠️ Overdue", completed: "✅ Completed", cancelled: "Cancelled",
              };
              return (
                <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, width: 110, color, flexShrink: 0 }}>{labels[s.status] || s.status}</span>
                  <div style={{ flex: 1, height: 18, background: "#F1F5F9", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#64748B", width: 50, textAlign: "right", flexShrink: 0 }}>{s.cnt} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div style={card}>
        <h3 style={cardTitle}>👥 Agent Performance</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Agent", "Total Assigned", "Completed", "Overdue", "Completion Rate"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11.5, fontWeight: 800, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {by_agent.map((a, i) => (
                <tr key={a.agent_name + i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0F172A" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6D28D9,#2563EB)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                        {a.agent_name?.[0] || "?"}
                      </div>
                      {a.agent_name}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#374151" }}>{a.total}</td>
                  <td style={{ padding: "10px 12px", color: "#059669", fontWeight: 700 }}>{a.completed}</td>
                  <td style={{ padding: "10px 12px", color: a.overdue > 0 ? "#DC2626" : "#6B7280", fontWeight: a.overdue > 0 ? 700 : 400 }}>{a.overdue}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${a.completion_rate || 0}%`, background: (a.completion_rate || 0) >= 80 ? "#059669" : (a.completion_rate || 0) >= 60 ? "#D97706" : "#DC2626", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: (a.completion_rate || 0) >= 80 ? "#059669" : "#D97706" }}>{a.completion_rate || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {!by_agent.length && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>No agent data available for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #E2E8F0", borderTop: `3px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ color, background: color + "15", padding: 6, borderRadius: 8 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A" }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color, fontWeight: 700, marginTop: 2 }}>{sub} rate</div>}
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ padding: 40, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
      {[...Array(5)].map((_, i) => <div key={i} style={{ height: 100, background: "#E2E8F0", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite" }} />)}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid #E2E8F0" };
const cardTitle = { margin: "0 0 16px 0", fontSize: 14, fontWeight: 800, color: "#0F172A" };
const filterSel = { padding: "7px 10px", border: "1px solid #E2E8F0", borderRadius: 7, fontSize: 12.5, outline: "none", background: "#fff" };
const ghostBtn = { padding: "7px 12px", background: "#F1F5F9", color: "#374151", border: "1px solid #E2E8F0", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer" };
