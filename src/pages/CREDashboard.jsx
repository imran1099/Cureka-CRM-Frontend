import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { api } from "../lib/api";
import { TrendingUp, DollarSign, CheckCircle2, XCircle, Target, Layers } from "lucide-react";

export default function CREDashboard() {
  const [data, setData] = useState(null);
  const [aiForecast, setAiForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.cre.getAnalytics(),
      api.cre.getAIForecast().catch(() => null)
    ]).then(([d, aiRes]) => {
      setData(d);
      if (aiRes?.forecast) setAiForecast(aiRes.forecast);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading dashboard…</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--coral)" }}>Failed to load data.</div>;

  const { revByAgent, revByBrand, pipelineStats, totals, campaigns } = data;
  const totalRevenue = revByAgent.reduce((acc, a) => acc + (parseFloat(a.total_revenue) || 0), 0);
  const convRate = totals.total > 0 ? Math.round((totals.won / totals.total) * 100) : 0;
  const pipelineValue = parseFloat(totals.total_pipeline_value || 0);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 24px 0", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
        <TrendingUp size={24} color="var(--teal)" /> Revenue Engine Dashboard
      </h1>

      {/* AI Forecasting Overview (Phase 2 Placeholder) */}
      {aiForecast && (
        <div style={{ background: "linear-gradient(to right, #EEF2FF, #F3E8FF)", padding: 20, borderRadius: 12, marginBottom: 28, border: "1px solid #E0E7FF", display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px 0", color: "#4338CA", display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={16} /> AI Revenue Forecast
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#3730A3" }}>
              Expected Monthly Revenue: <strong>₹{aiForecast.expected_monthly_revenue.toLocaleString()}</strong> (Confidence: {aiForecast.confidence_interval})
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#3730A3" }}>
              Top Growth Segment: <strong>{aiForecast.top_growth_segment}</strong> | Churn Risk: <strong>{aiForecast.churn_risk_accounts} accounts</strong>
            </p>
          </div>
        </div>
      )}

      {/* Executive KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 16, marginBottom: 28 }}>
        <KPICard icon={<DollarSign/>} label="Total Revenue Won" value={`₹${totalRevenue.toLocaleString()}`} />
        <KPICard icon={<Layers/>} label="Pipeline Value" value={`₹${pipelineValue.toLocaleString()}`} />
        <KPICard icon={<CheckCircle2 color="#16A34A"/>} label="Won" value={totals.won || 0} color="#16A34A" />
        <KPICard icon={<XCircle color="#DC2626"/>} label="Lost" value={totals.lost || 0} color="#DC2626" />
        <KPICard icon={<Target/>} label="Conversion Rate" value={`${convRate}%`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Agent Revenue Leaderboard */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 20px 0", color: "var(--ink)" }}>Agent Revenue Leaderboard</h2>
          {revByAgent.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No revenue data yet. Mark some opportunities as Won to see results.</p>
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revByAgent} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="agent_name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--slate)" }} angle={-20} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "var(--bg-wash)" }} formatter={(v) => [`₹${parseFloat(v).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="total_revenue" name="Revenue" fill="var(--teal)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pipeline Stage Funnel */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px 0", color: "var(--ink)" }}>Pipeline Distribution</h2>
          {pipelineStats.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No open opportunities in pipeline yet.</p>
          ) : (
            <div>
              {pipelineStats.map(s => (
                <div key={s.stage_name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{s.stage_name}</span>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>{s.count} opps · ₹{parseFloat(s.pipeline_value || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4 }}>
                    <div style={{
                      width: `${Math.max(5, Math.round((s.count / Math.max(1, pipelineStats.reduce((a, b) => a + b.count, 0))) * 100))}%`,
                      height: "100%", background: s.color || "var(--teal)", borderRadius: 4, transition: "width 0.4s"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Brand */}
      {revByBrand.length > 0 && (
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)", marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 20px 0", color: "var(--ink)" }}>Revenue by Brand</h2>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revByBrand} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="brand_name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${parseFloat(v).toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="total_revenue" fill="#8884d8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 20px 0", color: "var(--ink)" }}>Active Campaigns</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-wash)", borderBottom: "1px solid var(--card-border)" }}>
                {["Campaign", "Brand", "Revenue Target", "Revenue Achieved", "Status", "Open Opps", "Won"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const pct = c.revenue_target > 0 ? Math.round((c.revenue_achieved / c.revenue_target) * 100) : 0;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 14 }}>{c.name}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.brand_name || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>₹{parseFloat(c.revenue_target || 0).toLocaleString()}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: 700, color: pct >= 100 ? "#16A34A" : "var(--ink)" }}>
                        ₹{parseFloat(c.revenue_achieved || 0).toLocaleString()} ({pct}%)
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.status === "active" ? "#DCFCE7" : "#F1F5F9", color: c.status === "active" ? "#166534" : "#6B7280" }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.total_opps || 0}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#16A34A", fontWeight: 700 }}>{c.won_opps || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KPICard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--bg)", color: color || "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "var(--slate)", fontWeight: 600 }}>{label}</p>
        <h3 style={{ margin: "2px 0 0 0", fontSize: 22, fontWeight: 800, color: color || "var(--ink)" }}>{value}</h3>
      </div>
    </div>
  );
}
