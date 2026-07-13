import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { SEGMENTS } from "../lib/constants";
import { TrendingUp, Phone, IndianRupee, AlertCircle, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [range, setRange] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getOverview(), 
      api.getLeaderboard(range),
      api.uncc.getNotifications()
    ])
      .then(([o, l, n]) => {
        setOverview(o);
        setLeaderboard(l.leaderboard);
        setNotifications(n.notifications ? n.notifications.filter(x => x.status === 'unread').slice(0, 5) : []);
      })
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div style={{ padding: 28, color: "var(--muted)" }}>Loading dashboard…</div>;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 4px" }}>Admin dashboard</h1>
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 20px" }}>Team performance and queue health, at a glance.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={Phone} label="Calls today" value={overview.callsToday} />
        <StatCard icon={TrendingUp} label="Sales today" value={overview.salesToday} highlight />
        <StatCard icon={IndianRupee} label="Revenue today" value={`₹${overview.revenueToday.toLocaleString("en-IN")}`} highlight />
        <StatCard icon={AlertCircle} label="Overdue callbacks" value={overview.overdueCallbacks} warn={overview.overdueCallbacks > 0} />
        <StatCard icon={Users} label="Unassigned customers" value={overview.unassignedCustomers} />
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Segment health</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        {overview.segmentHealth.map((s) => {
          const seg = SEGMENTS[s.segment] || SEGMENTS.new_lead;
          const Icon = seg.icon;
          return (
            <div key={s.segment} style={{ background: "#fff", border: `1px solid ${seg.border}`, borderRadius: 12, padding: "12px 16px", minWidth: 170 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: seg.color, fontSize: 12.5, fontWeight: 700 }}>
                <Icon size={13} /> {seg.label}
              </div>
              <div className="tabular" style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{s.count}</div>
              <div className="tabular" style={{ fontSize: 11.5, color: "var(--muted)" }}>₹{Number(s.total_ltv || 0).toLocaleString("en-IN")} combined LTV</div>
            </div>
          );
        })}
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        
        {/* Leaderboard Widget */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Agent leaderboard</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {["today", "7d", "30d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  style={{
                    background: range === r ? "var(--teal)" : "#fff",
                    color: range === r ? "#fff" : "var(--slate)",
                    border: range === r ? "none" : "1px solid var(--card-border)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {r === "today" ? "Today" : r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
            {leaderboard.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No data for this period.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--card-border)", fontSize: 11, color: "var(--slate)", textTransform: "uppercase" }}>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Agent</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Won</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((l, i) => (
                    <tr key={l.agent_id} style={{ borderBottom: i === leaderboard.length - 1 ? "none" : "1px solid var(--card-border)", fontSize: 13 }}>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>{l.agent_name}</td>
                      <td className="tabular" style={{ padding: "12px 14px" }}>{l.won} <span style={{ color: "var(--muted)", fontSize: 11.5 }}>/ {l.total}</span></td>
                      <td className="tabular" style={{ padding: "12px 14px", fontWeight: 700, color: "var(--teal)" }}>₹{Number(l.sales).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Notifications Widget */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Alerts</h2>
            <Link to="/notifications" style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", textDecoration: "none" }}>View all &rarr;</Link>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No unread alerts.</div>
            ) : (
              notifications.map((n, i) => (
                <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderBottom: i === notifications.length - 1 ? "none" : "1px solid var(--card-border)", background: n.priority === 'Critical' ? "var(--coral-light)" : "#fff" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.priority === 'Critical' ? "var(--coral)" : n.priority === 'High' ? "var(--amber)" : n.priority === 'Medium' ? "var(--yellow)" : "var(--teal)", marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.4, marginBottom: 2 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "var(--slate)", display: "flex", gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{n.category}</span>
                      <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight, warn }) {
  return (
    <div style={{ background: warn ? "var(--amber-light)" : "#fff", border: `1px solid ${warn ? "var(--amber-border)" : "var(--card-border)"}`, borderRadius: 12, padding: "12px 16px", minWidth: 130 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 11.5, fontWeight: 600 }}>
        <Icon size={12} /> {label}
      </div>
      <div className="tabular" style={{ fontSize: 21, fontWeight: 800, marginTop: 4, color: highlight ? "var(--teal)" : warn ? "var(--amber)" : "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th style={{ padding: "10px 16px", fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textAlign: align, textTransform: "uppercase", letterSpacing: "0.03em" }}>
      {children}
    </th>
  );
}
