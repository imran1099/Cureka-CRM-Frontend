import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Phone, PhoneForwarded, ShoppingCart, CalendarClock, TicketIcon, PhoneCall } from "lucide-react";

export default function CallQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await api.calls.getQueue();
      setQueue(res.queue || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
            <PhoneForwarded size={24} color="var(--teal)" /> Intelligent Call Queue
          </h1>
          <p style={{ fontSize: 13, color: "var(--slate)", margin: "4px 0 0 0" }}>Prioritized outbound calling list.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Loading queue...</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--card-border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-wash)", borderBottom: "1px solid var(--card-border)" }}>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Trigger Date</th>
                <th style={thStyle}>Queue Reason</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No calls in queue! Great job!</td></tr>
              )}
              {queue.map((item, idx) => {
                const isUrgent = item.priority_score === 1;
                const isMedium = item.priority_score === 2;
                const bg = isUrgent ? "#FFF5F5" : isMedium ? "#FFFBF0" : "transparent";
                
                return (
                  <tr key={`${item.customer_id}_${idx}`} style={{ borderBottom: "1px solid var(--card-border)", background: bg }}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{item.name}</td>
                    <td style={tdStyle}>{item.phone}</td>
                    <td style={{ ...tdStyle, color: isUrgent ? "var(--coral)" : "var(--slate)" }}>
                      {new Date(item.trigger_date).toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      <ReasonBadge reason={item.queue_reason} />
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => navigate(`/calls/workspace/${item.customer_id}`)}
                        style={{ padding: "6px 12px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <PhoneCall size={14} /> Call Now
                      </button>
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

function ReasonBadge({ reason }) {
  if (reason === "Abandoned Cart") {
    return <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--coral)", fontWeight: 700, fontSize: 12 }}><ShoppingCart size={14} /> {reason}</span>;
  }
  if (reason.startsWith("Follow-up")) {
    return <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#6D5BD0", fontWeight: 700, fontSize: 12 }}><CalendarClock size={14} /> {reason}</span>;
  }
  if (reason.startsWith("Open Ticket")) {
    return <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#E5A000", fontWeight: 700, fontSize: 12 }}><TicketIcon size={14} /> {reason}</span>;
  }
  return <span>{reason}</span>;
}
