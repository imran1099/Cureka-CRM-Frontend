import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Ticket, AlertCircle, Clock, CheckCircle2, Search, Filter } from "lucide-react";

export default function TicketsListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "open", priority: "", page: 1 });
  const navigate = useNavigate();

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.tickets.list(filters);
      setTickets(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters.status, filters.priority, filters.page]);

  const updateFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
            <Ticket size={24} color="var(--teal)" /> Ticket Management
          </h1>
          <p style={{ fontSize: 13, color: "var(--slate)", margin: "4px 0 0 0" }}>Manage, assign, and resolve customer interactions.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, background: "#fff", padding: 16, borderRadius: 12, border: "1px solid var(--card-border)", boxShadow: "0 2px 10px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color="var(--muted)" />
          <select value={filters.status} onChange={e => updateFilter("status", e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={filters.priority} onChange={e => updateFilter("priority", e.target.value)} style={selectStyle}>
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Loading tickets...</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--card-border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-wash)", borderBottom: "1px solid var(--card-border)" }}>
                <th style={thStyle}>Ticket ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Brand</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Assignee</th>
                <th style={thStyle}>SLA Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No tickets found matching filters.</td></tr>
              )}
              {tickets.map(t => {
                const now = new Date();
                const due = t.sla_due_date ? new Date(t.sla_due_date) : null;
                const isBreached = due && now > due && !t.first_response_at;
                
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--card-border)", cursor: "pointer", transition: "background 0.2s" }} onClick={() => navigate(`/tickets/${t.id}`)}>
                    <td style={tdStyle}><span style={{ fontFamily: "monospace", fontSize: 12, background: "var(--bg)", padding: "2px 6px", borderRadius: 4 }}>{t.id.split("_")[1]}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{t.customer_name}</td>
                    <td style={tdStyle}>{t.brand_name}</td>
                    <td style={tdStyle}><PriorityBadge priority={t.priority} /></td>
                    <td style={tdStyle}><StatusBadge status={t.status} /></td>
                    <td style={tdStyle}>{t.agent_name || <span style={{ color: "var(--muted)" }}>Unassigned</span>}</td>
                    <td style={tdStyle}>
                      {isBreached ? (
                        <span style={{ color: "var(--coral)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}><AlertCircle size={14} /> Breached</span>
                      ) : t.first_response_at ? (
                        <span style={{ color: "var(--teal)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={14} /> Met</span>
                      ) : due ? (
                        <span style={{ color: "#E5A000", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}><Clock size={14} /> Pending</span>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: "14px 16px", fontSize: 12, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em" };
const tdStyle = { padding: "14px 16px", fontSize: 13, color: "var(--ink)", verticalAlign: "middle" };
const selectStyle = { padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-border)", fontSize: 13, backgroundColor: "var(--bg-wash)", outline: "none", cursor: "pointer" };

function PriorityBadge({ priority }) {
  const colors = { critical: "var(--coral)", high: "#E5A000", medium: "#6D5BD0", low: "var(--slate)" };
  const c = colors[priority] || colors.medium;
  return <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: c, background: `${c}1A`, padding: "4px 8px", borderRadius: 6 }}>{priority}</span>;
}

function StatusBadge({ status }) {
  return <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--slate)", background: "var(--bg)", border: "1px solid var(--slate-border)", padding: "4px 8px", borderRadius: 6 }}>{status.replace("_", " ")}</span>;
}
