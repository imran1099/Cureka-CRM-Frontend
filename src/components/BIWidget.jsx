import React from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PhoneCall, Calendar, Target, User, Ticket, ListChecks } from "lucide-react";

const COLORS = {
  primary: "#6D28D9",
  success: "#16A34A",
  warning: "#EA580C",
  text: "#0F172A",
  textMuted: "#64748B",
  card: "#FFFFFF",
  border: "#E2E8F0"
};

const PIE_COLORS = ["#6D28D9", "#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#F43F5E"];

export default function BIWidget({ config, data }) {
  const { title, type, kpi_id } = config;
  const isLoading = data === undefined;
  
  const renderContent = () => {
    if (isLoading) return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Loading...</div>;
    if (data.type === 'error') return <div style={{ color: "red", fontSize: 13 }}>Error loading widget</div>;

    switch (type) {
      case 'kpi_card': {
        const val = data.value || 0;
        let formatted = val;
        if (data.type === 'currency') formatted = `₹${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        else if (data.type === 'percentage') formatted = `${val}${data.suffix || ''}`;
        else formatted = parseFloat(val).toLocaleString();

        return (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.text }}>{formatted}</div>
          </div>
        );
      }
      
      case 'line_chart': {
        const chartData = data.data || [];
        return (
          <div style={{ height: "100%", minHeight: 200, width: "100%" }}>
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="Revenue" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: COLORS.primary }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 'pie_chart': {
        const chartData = data.data || [];
        return (
          <div style={{ height: "100%", minHeight: 200, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 'leaderboard': {
        const rows = data.data || [];
        return (
          <div style={{ overflowY: "auto", height: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase" }}>Agent</th>
                  <th style={{ padding: "8px 0", textAlign: "right", fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase" }}>Calls</th>
                  <th style={{ padding: "8px 0", textAlign: "right", fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase" }}>CSAT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px dashed ${COLORS.border}` }}>
                    <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 700, color: COLORS.text }}>{row.name}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, color: COLORS.textMuted }}>{row.calls}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, color: COLORS.success, fontWeight: 700 }}>{row.csat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'action_panel': {
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: "100%" }}>
            <Link to="/queue" style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.primaryLight, color: COLORS.primary, padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
              <PhoneCall size={18} /> Start Call Queue
            </Link>
            <Link to="/followups" style={{ display: "flex", alignItems: "center", gap: 10, background: "#FEFCE8", color: "#CA8A04", padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
              <Calendar size={18} /> View Follow-ups
            </Link>
            <Link to="/knowledge" style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0FDF4", color: "#16A34A", padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
              <ListChecks size={18} /> Knowledge Hub
            </Link>
            <Link to="/tickets" style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF7ED", color: "#EA580C", padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
              <Ticket size={18} /> Customer Cases
            </Link>
          </div>
        );
      }

      default:
        return <div>Unknown widget type: {type}</div>;
    }
  };

  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", height: "100%", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 700, color: COLORS.textMuted }}>{title}</h3>
      <div style={{ flex: 1 }}>
        {renderContent()}
      </div>
    </div>
  );
}
