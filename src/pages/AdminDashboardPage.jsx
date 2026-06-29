import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { SEGMENTS } from "../lib/constants";
import { TrendingUp, Phone, IndianRupee, AlertCircle, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [range, setRange] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getOverview(), api.getLeaderboard(range)])
      .then(([o, l]) => {
        setOverview(o);
        setLeaderboard(l.leaderboard);
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Agent leaderboard</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {["today", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--slate-border)",
                background: range === r ? "var(--teal)" : "#fff",
                color: range === r ? "#fff" : "var(--slate)",
              }}
            >
              {r === "today" ? "Today" : r === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--card-border)" }}>
              <Th>Agent</Th>
              <Th align="right">Calls made</Th>
              <Th align="right">Sales</Th>
              <Th align="right">Conversion</Th>
              <Th align="right">Revenue</Th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((a, idx) => (
              <tr key={a.id} style={{ borderBottom: idx < leaderboard.length - 1 ? "1px solid var(--bg)" : "none" }}>
                <td style={{ padding: "11px 16px", fontSize: 13.5, fontWeight: 600 }}>{a.name}</td>
                <td className="tabular" style={{ padding: "11px 16px", fontSize: 13.5, textAlign: "right" }}>{a.calls_made}</td>
                <td className="tabular" style={{ padding: "11px 16px", fontSize: 13.5, textAlign: "right" }}>{a.sales}</td>
                <td className="tabular" style={{ padding: "11px 16px", fontSize: 13.5, textAlign: "right" }}>{a.conversion}%</td>
                <td className="tabular" style={{ padding: "11px 16px", fontSize: 13.5, textAlign: "right", fontWeight: 700, color: "var(--teal)" }}>
                  ₹{Number(a.revenue).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
