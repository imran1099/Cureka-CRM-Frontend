import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import { TrendingUp, CheckCircle2, AlertTriangle, DollarSign, ShoppingCart, MessageSquare } from "lucide-react";

export default function CommandCenterAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cscc.getAnalytics().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading analytics…</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--coral)" }}>Failed to load data.</div>;

  const totals = data.totals || {};
  const convRate = totals.total_tasks > 0 ? Math.round((totals.completed_tasks / totals.total_tasks) * 100) : 0;
  const cartRate = data.queueHealth?.find(q => q.name === "Abandoned Cart");
  const cartPct  = cartRate && cartRate.total > 0 ? Math.round((cartRate.completed / cartRate.total) * 100) : 0;
  const ctwaPct  = (totals.total_tasks > 0 && totals.ctwa_converted) ? Math.round((totals.ctwa_converted / totals.total_tasks) * 100) : 0;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 24px 0", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
        <TrendingUp size={24} color="var(--teal)" /> Command Center Analytics
      </h1>

      {/* Executive KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <ExecKPI icon={<CheckCircle2/>} label="Completion Rate" value={`${convRate}%`} />
        <ExecKPI icon={<DollarSign/>} label="Revenue Generated" value={`₹${(totals.total_revenue || 0).toLocaleString()}`} />
        <ExecKPI icon={<ShoppingCart/>} label="Cart Recovery %" value={`${cartPct}%`} />
        <ExecKPI icon={<MessageSquare/>} label="CTWA Converted" value={totals.ctwa_converted || 0} />
        <ExecKPI icon={<AlertTriangle/>} label="Total Tasks" value={totals.total_tasks || 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Queue Health */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0", color: "var(--ink)" }}>Queue Health</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(data.queueHealth || []).map(q => {
              const pct = q.total > 0 ? Math.round((q.completed / q.total) * 100) : 0;
              return (
                <div key={q.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{q.name}</span>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>{q.completed}/{q.total} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: q.color || "var(--teal)", borderRadius: 3, transition: "width 0.4s" }} />
                  </div>
                  {q.sla_breached > 0 && <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#DC2626" }}>⚠ {q.sla_breached} SLA breached</p>}
                </div>
              );
            })}
            {(data.queueHealth || []).length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No queue data available yet.</p>}
          </div>
        </div>

        {/* Agent Performance */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0", color: "var(--ink)" }}>Agent Performance</h2>
          {(data.agentPerf || []).length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No agent data available yet.</p>
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.agentPerf} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="agent_name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--slate)" }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "var(--bg-wash)" }} />
                  <Bar yAxisId="left" dataKey="completed" name="Completed" fill="var(--teal)" radius={[4,4,0,0]} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#8884d8" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Queue */}
      <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px 0", color: "var(--ink)" }}>Revenue by Queue</h2>
        {(data.queueHealth || []).length > 0 ? (
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.queueHealth} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--slate)" }} angle={-25} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: "var(--bg-wash)" }} />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#F97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>No revenue data available yet.</p>
        )}
      </div>
    </div>
  );
}

function ExecKPI({ icon, label, value }) {
  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--bg)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "var(--slate)", fontWeight: 600 }}>{label}</p>
        <h3 style={{ margin: "2px 0 0 0", fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{value}</h3>
      </div>
    </div>
  );
}
