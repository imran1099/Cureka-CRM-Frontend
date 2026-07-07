import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, PhoneCall, DollarSign, Target } from "lucide-react";

export default function CallAnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.calls.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading dashboards...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--coral)" }}>Failed to load data</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 24px 0", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
        <TrendingUp size={24} color="var(--teal)" /> Call Productivity Engine
      </h1>

      {/* Top KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        <StatCard icon={<PhoneCall/>} title="Total Calls" value={data.totals.total_calls} />
        <StatCard icon={<DollarSign/>} title="Revenue Generated" value={`₹${data.totals.total_revenue?.toLocaleString() || 0}`} />
        <StatCard icon={<Target/>} title="Conversion Rate" value={`${data.totals.total_calls ? Math.round(((data.agentStats.reduce((acc, a) => acc + a.orders_generated, 0)) / data.totals.total_calls) * 100) : 0}%`} />
        <StatCard icon={<Users/>} title="Active Agents" value={data.agentStats.length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Agent Leaderboard Chart */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 24px 0", color: "var(--ink)" }}>Agent Call Volume & Revenue</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.agentStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="agent_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--slate)" }} />
                <YAxis yAxisId="left" orientation="left" stroke="var(--teal)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: "var(--bg-wash)" }} />
                <Bar yAxisId="left" dataKey="total_calls" name="Total Calls" fill="var(--teal)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue_generated" name="Revenue (₹)" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Objections Pie Chart */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 24px 0", color: "var(--ink)" }}>Top Objections</h2>
          <div style={{ height: 250 }}>
            {data.objections.length === 0 ? (
               <div style={{ textAlign: "center", color: "var(--muted)", paddingTop: 80 }}>No objections logged yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.objections} dataKey="count" nameKey="objection_type" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {data.objections.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {data.objections.map((o, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--slate)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[idx % COLORS.length] }} />
                {o.objection_type} ({o.count})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call Outcomes Table */}
      <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px 0", color: "var(--ink)" }}>Call Outcomes Breakdown</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-wash)", borderBottom: "1px solid var(--card-border)" }}>
              <th style={thStyle}>Outcome</th>
              <th style={{...thStyle, textAlign: "right"}}>Count</th>
              <th style={{...thStyle, textAlign: "right"}}>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {data.outcomes.map(o => (
              <tr key={o.outcome} style={{ borderBottom: "1px solid var(--card-border)" }}>
                <td style={tdStyle}>{o.outcome}</td>
                <td style={{...tdStyle, textAlign: "right"}}>{o.count}</td>
                <td style={{...tdStyle, textAlign: "right", color: "var(--slate)"}}>{Math.round((o.count / data.totals.total_calls) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>{title}</p>
        <h3 style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>{value}</h3>
      </div>
    </div>
  );
}

const thStyle = { padding: "12px", fontSize: 12, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", textAlign: "left" };
const tdStyle = { padding: "12px", fontSize: 14, color: "var(--ink)", fontWeight: 600 };
