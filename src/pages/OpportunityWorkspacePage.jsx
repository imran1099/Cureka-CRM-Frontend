import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import {
  User, Phone, TrendingUp, CheckCircle2, XCircle, MessageSquare,
  Calendar, ChevronRight, Package, Lightbulb, ArrowLeft, PhoneCall
} from "lucide-react";

const ACTIVITY_ICONS = {
  created: "🆕", stage_change: "➡️", note: "📝", call: "📞",
  followup_scheduled: "📅", outcome_update: "🏁",
};

export default function OpportunityWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action UI state
  const [activityNote, setActivityNote] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [followupDate, setFollowupDate] = useState("");
  const [followupType, setFollowupType] = useState("call");
  const [showWonModal, setShowWonModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [wonOrderId, setWonOrderId] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
    api.cre.getStages().then(r => setStages(r.stages || [])).catch(() => {});
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.cre.getOpportunity(id);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleStageChange = async (stageId) => {
    try {
      await api.cre.updateOpportunity(id, { stage_id: stageId });
      loadAll();
    } catch (err) { alert(err.message); }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityNote.trim()) return;
    setSubmitting(true);
    try {
      await api.cre.addActivity(id, { activity_type: activityType, description: activityNote });
      setActivityNote("");
      loadAll();
    } finally { setSubmitting(false); }
  };

  const handleScheduleFollowup = async (e) => {
    e.preventDefault();
    if (!followupDate) return;
    try {
      await api.cre.scheduleFollowup(id, { due_date: followupDate, follow_up_type: followupType });
      setFollowupDate("");
      loadAll();
    } catch (err) { alert(err.message); }
  };

  const handleMarkWon = async () => {
    if (!wonOrderId.trim()) return alert("Order ID is required");
    try {
      await api.cre.updateOpportunity(id, { outcome: "won", stage_id: "stage_won", order_id: wonOrderId });
      setShowWonModal(false);
      loadAll();
    } catch (err) { alert(err.message); }
  };

  const handleMarkLost = async () => {
    if (!lostReason.trim()) return alert("Lost reason is mandatory");
    try {
      await api.cre.updateOpportunity(id, { outcome: "lost", stage_id: "stage_lost", lost_reason: lostReason });
      setShowLostModal(false);
      loadAll();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading opportunity…</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--coral)" }}>Opportunity not found</div>;

  const { opportunity: opp, activities, followups, purchaseHistory, recommendations } = data;
  const isTerminal = opp.outcome === "won" || opp.outcome === "lost";

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)", background: "var(--bg-wash)", overflow: "hidden" }}>

      {/* Left Column: Metadata + Quick Actions */}
      <div style={{ width: 290, background: "#fff", borderRight: "1px solid var(--card-border)", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)" }}>
          <button onClick={() => navigate("/pipeline")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--slate)", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 14 }}>
            <ArrowLeft size={14} /> Back to Pipeline
          </button>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: opp.stage_color + "22", color: opp.stage_color }}>
            {opp.stage_name}
          </span>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: "8px 0 2px 0", color: "var(--ink)" }}>{opp.customer_name}</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--slate)" }}>{opp.type} · {opp.source}</p>
        </div>

        {/* Customer Snapshot */}
        <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
          <p style={sectionHead}>Customer Snapshot</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SnapItem label="Phone" value={<a href={`tel:${opp.phone}`} style={{ color: "var(--teal)", textDecoration: "none" }}>{opp.phone}</a>} />
            <SnapItem label="Segment" value={opp.segment} />
            <SnapItem label="LTV" value={`₹${parseFloat(opp.ltv || 0).toLocaleString()}`} />
            <SnapItem label="Health Score" value={opp.health_score} valueColor={parseInt(opp.health_score) < 50 ? "#EF4444" : "#16A34A"} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Link to={`/customers/${opp.customer_id}`}
              style={{ flex: 1, padding: "7px 0", background: "var(--teal)", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 12, fontWeight: 700, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <User size={13} /> Open 360°
            </Link>
            <Link to={`/calls/workspace/${opp.customer_id}`}
              style={{ flex: 1, padding: "7px 0", background: "#F97316", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 12, fontWeight: 700, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <PhoneCall size={13} /> Call
            </Link>
          </div>
        </div>

        {/* Opportunity Details */}
        <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
          <p style={sectionHead}>Opportunity Details</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SnapItem label="Expected Revenue" value={`₹${parseFloat(opp.expected_revenue || 0).toLocaleString()}`} valueColor="var(--teal)" />
            <SnapItem label="Probability" value={`${opp.probability || 20}%`} />
            <SnapItem label="Priority" value={opp.priority} />
            <SnapItem label="Close Date" value={opp.close_date || "—"} />
            {opp.outcome !== "open" && (
              <SnapItem label="Outcome" value={opp.outcome.toUpperCase()} valueColor={opp.outcome === "won" ? "#16A34A" : "#DC2626"} />
            )}
            {opp.lost_reason && <SnapItem label="Lost Reason" value={opp.lost_reason} />}
          </div>
        </div>

        {/* Stage Changer */}
        {!isTerminal && (
          <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
            <p style={sectionHead}>Move Stage</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {stages.filter(s => !s.is_won && !s.is_lost).map(s => (
                <button key={s.id} onClick={() => handleStageChange(s.id)}
                  style={{ padding: "6px 12px", background: opp.stage_id === s.id ? s.color : "var(--bg-wash)", color: opp.stage_id === s.id ? "#fff" : "var(--ink)", border: `1px solid ${opp.stage_id === s.id ? s.color : "var(--card-border)"}`, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                  {opp.stage_id === s.id ? "▶ " : ""}{s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Win / Lose actions */}
        {!isTerminal && (
          <div style={{ padding: 20, display: "flex", gap: 8 }}>
            <button onClick={() => setShowWonModal(true)}
              style={{ flex: 1, padding: "8px 0", background: "#DCFCE7", color: "#166534", border: "1px solid #86EFAC", borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <CheckCircle2 size={14} /> Won
            </button>
            <button onClick={() => setShowLostModal(true)}
              style={{ flex: 1, padding: "8px 0", background: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <XCircle size={14} /> Lost
            </button>
          </div>
        )}
      </div>

      {/* Center Column: Activity Timeline */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "hidden" }}>
        <div style={{ padding: "16px 20px", background: "#fff", borderBottom: "1px solid var(--card-border)", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>Activity Timeline</h3>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {activities.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", paddingTop: 40 }}>No activities yet.</p>}
          {activities.map(act => (
            <div key={act.id} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {ACTIVITY_ICONS[act.activity_type] || "•"}
              </div>
              <div style={{ flex: 1, background: "#fff", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--card-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", textTransform: "capitalize" }}>{act.activity_type.replace("_", " ")}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(act.created_at).toLocaleString()}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--ink)" }}>{act.description}</p>
                {act.agent_name && <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "var(--slate)" }}>by {act.agent_name}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Note Composer */}
        {!isTerminal && (
          <div style={{ padding: 16, background: "#fff", borderTop: "1px solid var(--card-border)", flexShrink: 0 }}>
            <form onSubmit={handleAddActivity} style={{ display: "flex", gap: 10 }}>
              <select value={activityType} onChange={e => setActivityType(e.target.value)}
                style={{ padding: "8px 10px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, outline: "none" }}>
                <option value="note">Note</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="email">Email</option>
              </select>
              <input value={activityNote} onChange={e => setActivityNote(e.target.value)}
                placeholder="Log an activity…" style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, outline: "none" }} />
              <button type="submit" disabled={submitting}
                style={{ padding: "8px 16px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                Log
              </button>
            </form>
            <form onSubmit={handleScheduleFollowup} style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <select value={followupType} onChange={e => setFollowupType(e.target.value)}
                style={{ padding: "8px 10px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, outline: "none" }}>
                <option value="call">📞 Call</option>
                <option value="email">✉️ Email</option>
                <option value="whatsapp">💬 WhatsApp</option>
              </select>
              <input type="datetime-local" value={followupDate} onChange={e => setFollowupDate(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, outline: "none" }} />
              <button type="submit"
                style={{ padding: "8px 16px", background: "#6D28D9", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar size={14} /> Follow-up
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right Column: Recommendations + Purchase History */}
      <div style={{ width: 260, background: "#fff", borderLeft: "1px solid var(--card-border)", overflowY: "auto", flexShrink: 0 }}>
        {/* Product Recommendations */}
        <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
          <p style={{ ...sectionHead, color: "#92400E" }}>💡 Recommendations</p>
          {recommendations.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)" }}>No purchase history to recommend from.</p>
          ) : (
            recommendations.map((r, i) => (
              <div key={i} style={{ padding: "8px 10px", background: "#FFFBEB", borderRadius: 7, border: "1px solid #FDE68A", marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 11, color: "#78350F", fontWeight: 700 }}>{r.label}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#92400E" }}>{r.product}</p>
              </div>
            ))
          )}
        </div>

        {/* Purchase History */}
        <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
          <p style={sectionHead}>Purchase History</p>
          {purchaseHistory.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)" }}>No purchases yet.</p>
          ) : (
            purchaseHistory.map(ph => (
              <div key={ph.id} style={{ marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{ph.product_name}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "var(--slate)" }}>{ph.order_date} · ₹{parseFloat(ph.amount).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Scheduled Follow-ups */}
        <div style={{ padding: 20 }}>
          <p style={sectionHead}>Scheduled Follow-ups</p>
          {followups.filter(f => f.status === "pending").length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted)" }}>No pending follow-ups.</p>
          ) : (
            followups.filter(f => f.status === "pending").map(f => (
              <div key={f.id} style={{ padding: "8px 10px", background: "#F5F3FF", borderRadius: 7, border: "1px solid #DDD6FE", marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#5B21B6", textTransform: "capitalize" }}>{f.follow_up_type}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#7C3AED" }}>{new Date(f.due_date).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Won Modal */}
      {showWonModal && (
        <Modal title="🏆 Mark as Won" onClose={() => setShowWonModal(false)}>
          <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>Provide the Shopify/Order ID to attribute this win. Revenue will be recorded against your account.</p>
          <label style={labelStyle}>Order ID *</label>
          <input value={wonOrderId} onChange={e => setWonOrderId(e.target.value)} placeholder="e.g. #1234 or ORD-XXXX" style={inputStyle} />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={handleMarkWon} style={{ flex: 1, padding: "9px 0", background: "#16A34A", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Confirm Won</button>
            <button onClick={() => setShowWonModal(false)} style={{ flex: 1, padding: "9px 0", background: "none", border: "none", color: "var(--slate)", cursor: "pointer" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Lost Modal */}
      {showLostModal && (
        <Modal title="❌ Mark as Lost" onClose={() => setShowLostModal(false)}>
          <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>A reason is mandatory. This helps us improve future conversion.</p>
          <label style={labelStyle}>Lost Reason *</label>
          <select value={lostReason} onChange={e => setLostReason(e.target.value)} style={inputStyle}>
            <option value="">Select a reason…</option>
            <option>Price Too High</option>
            <option>Already Purchased</option>
            <option>Delivery Time</option>
            <option>Need Doctor Consultation</option>
            <option>Family Approval</option>
            <option>Product Out of Stock</option>
            <option>Payment Issue</option>
            <option>Not Interested</option>
            <option>No Response after 3 Attempts</option>
            <option>Competitor Purchase</option>
          </select>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={handleMarkLost} style={{ flex: 1, padding: "9px 0", background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Confirm Lost</button>
            <button onClick={() => setShowLostModal(false)} style={{ flex: 1, padding: "9px 0", background: "none", border: "none", color: "var(--slate)", cursor: "pointer" }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--slate)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SnapItem({ label, value, valueColor }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--slate)" }}>{label}</p>
      <p style={{ margin: "1px 0 0 0", fontSize: 13, fontWeight: 700, color: valueColor || "var(--ink)" }}>{value}</p>
    </div>
  );
}

const sectionHead = { margin: "0 0 12px 0", fontSize: 10, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.06em" };
const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--card-border)", fontSize: 13, outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 6 };
