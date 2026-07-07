import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { ArrowLeft, User, Phone, Mail, Clock, Send, MessageSquare, ShieldAlert } from "lucide-react";

export default function TicketWorkspacePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const res = await api.tickets.get(id);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.tickets.addComment(id, { content: comment, is_internal: isInternal ? 1 : 0 });
      setComment("");
      loadTicket(); // Reload timeline & comments
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.tickets.update(id, { status });
      loadTicket();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading workspace...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--coral)" }}>Ticket not found</div>;

  const { ticket, comments, timeline } = data;

  // Merge timeline and comments into a unified thread
  const thread = [
    ...comments.map(c => ({ ...c, _type: 'comment', _date: new Date(c.created_at) })),
    ...timeline.map(t => ({ ...t, _type: 'event', _date: new Date(t.created_at) }))
  ].sort((a, b) => a._date - b._date);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)", background: "var(--bg-wash)", overflow: "hidden" }}>
      
      {/* Left Panel - Customer Snapshot */}
      <div style={{ width: 320, background: "#fff", borderRight: "1px solid var(--card-border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
          <Link to="/tickets" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--slate)", textDecoration: "none", marginBottom: 20, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Tickets
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate)" }}>
              <User size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--ink)" }}>{ticket.customer_name}</h2>
              <Link to={`/customers/${ticket.customer_id}`} style={{ fontSize: 12, color: "var(--teal)", textDecoration: "none", fontWeight: 600 }}>View 360 Profile</Link>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--slate)" }}><Phone size={14} /> {ticket.customer_phone || 'No Phone'}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--slate)" }}><Mail size={14} /> {ticket.customer_email || 'No Email'}</div>
          </div>
        </div>

        <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
          <h3 style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 800, color: "var(--slate)", letterSpacing: "0.05em", margin: "0 0 12px 0" }}>Ticket Details</h3>
          <div style={detailRowStyle}><span style={labelStyle}>Brand</span><span style={valStyle}>{ticket.brand_name}</span></div>
          <div style={detailRowStyle}><span style={labelStyle}>Priority</span><span style={{...valStyle, color: ticket.priority === 'critical' ? 'var(--coral)' : 'inherit', fontWeight: 700, textTransform: 'capitalize'}}>{ticket.priority}</span></div>
          <div style={detailRowStyle}><span style={labelStyle}>Status</span><span style={{...valStyle, textTransform: 'capitalize'}}>{ticket.status.replace("_", " ")}</span></div>
          <div style={detailRowStyle}><span style={labelStyle}>Assignee</span><span style={valStyle}>{ticket.agent_name || 'Unassigned'}</span></div>
          <div style={detailRowStyle}><span style={labelStyle}>Created</span><span style={valStyle}>{new Date(ticket.created_at).toLocaleString()}</span></div>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-wash)" }}>
        
        {/* Workspace Header */}
        <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--ink)" }}>Ticket #{ticket.id.split("_")[1]}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
              {ticket.sla_due_date && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: (new Date() > new Date(ticket.sla_due_date) && !ticket.first_response_at) ? "var(--coral)" : "var(--slate)" }}>
                  <Clock size={14} /> SLA Due: {new Date(ticket.sla_due_date).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {ticket.status !== 'resolved' && (
              <button onClick={() => updateStatus('resolved')} style={{ ...btnStyle, background: "var(--teal)", color: "#fff", border: "none" }}>Mark Resolved</button>
            )}
            {ticket.status === 'resolved' && (
              <button onClick={() => updateStatus('closed')} style={{ ...btnStyle, background: "var(--ink)", color: "#fff", border: "none" }}>Close Ticket</button>
            )}
          </div>
        </div>

        {/* Thread */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {thread.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: 40 }}>No interactions yet.</div>
          ) : (
            thread.map((item, idx) => {
              if (item._type === 'event') {
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", margin: "8px 0" }}>
                    <div style={{ width: 30, height: 1, background: "var(--slate-border)" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--slate)", textTransform: "uppercase" }}>
                      {item.event_type.replace("_", " ")}: {item.description} ({item._date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                    </span>
                    <div style={{ width: 30, height: 1, background: "var(--slate-border)" }} />
                  </div>
                )
              }
              if (item._type === 'comment') {
                const isSystem = !item.agent_name;
                const isInternal = item.is_internal === 1;
                return (
                  <div key={idx} style={{ 
                    alignSelf: isSystem ? "center" : "flex-start", 
                    maxWidth: "80%", 
                    background: isInternal ? "#FFF9C4" : "#fff", 
                    padding: 16, 
                    borderRadius: 12, 
                    border: isInternal ? "1px solid #FBC02D" : "1px solid var(--card-border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: isInternal ? "#FBC02D" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: isInternal ? "#fff" : "var(--slate)" }}>
                        {isInternal ? <ShieldAlert size={14} /> : <User size={14} />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{item.agent_name || 'Customer'}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{item._date.toLocaleString()}</span>
                      {isInternal && <span style={{ fontSize: 10, fontWeight: 800, color: "#F57F17", background: "#FFF59D", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>Internal Note</span>}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {item.content}
                    </div>
                  </div>
                )
              }
              return null;
            })
          )}
        </div>

        {/* Composer */}
        {ticket.status !== 'closed' && (
          <div style={{ padding: 24, background: "#fff", borderTop: "1px solid var(--card-border)" }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: isInternal ? "#F57F17" : "var(--slate)", cursor: "pointer" }}>
                <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                Add as Internal Note (Hidden from Customer)
              </label>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <textarea 
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={isInternal ? "Write an internal note for your team..." : "Write a public reply to the customer..."}
                style={{ 
                  flex: 1, 
                  height: 60, 
                  padding: 12, 
                  borderRadius: 8, 
                  border: isInternal ? "2px solid #FBC02D" : "1px solid var(--slate-border)", 
                  fontSize: 14, 
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                  background: isInternal ? "#FFFDE7" : "#fff"
                }}
              />
              <button 
                onClick={handlePostComment}
                style={{ ...btnStyle, height: 60, padding: "0 24px", background: isInternal ? "#FBC02D" : "var(--teal)", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 8 }}
              >
                <Send size={16} /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const detailRowStyle = { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 };
const labelStyle = { color: "var(--slate)", fontWeight: 500 };
const valStyle = { color: "var(--ink)", fontWeight: 600, textAlign: "right" };
const btnStyle = { fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: "pointer", transition: "opacity 0.2s" };
