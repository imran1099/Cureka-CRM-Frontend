import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { User, Phone, PhoneForwarded, ShoppingCart, CalendarClock, TicketIcon, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function CallWorkspacePage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [outcome, setOutcome] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [objectionType, setObjectionType] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [category, setCategory] = useState("general");
  const [script, setScript] = useState("");

  useEffect(() => {
    loadCustomer();
    loadScript("general");
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      const res = await api.getCustomer360(customerId);
      setCustomer(res.customer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadScript = async (cat) => {
    try {
      const res = await api.calls.getScript(cat);
      setScript(res.content);
    } catch (err) {
      setScript("No script available for this category.");
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    loadScript(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!outcome) return alert("Outcome is mandatory");
    
    // Follow-up validation
    const requiresFollowup = outcome === "Call Back Tomorrow" || outcome === "Call Back Next Week" || outcome === "Follow-up Required";
    if (requiresFollowup && !followUpDate) return alert("Please select a follow-up date");

    try {
      await api.calls.logCall({
        customer_id: customerId,
        brand_id: customer?.brand_id, // Might need proper mapping
        call_type: "outbound",
        call_category: category,
        outcome,
        remarks,
        sale_amount: parseFloat(saleAmount) || 0,
        objection_type: objectionType,
        follow_up_date: requiresFollowup ? followUpDate : null,
      });
      alert("Call logged successfully!");
      navigate("/calls");
    } catch (err) {
      console.error(err);
      alert("Failed to log call");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading workspace...</div>;
  if (!customer) return <div style={{ padding: 40, textAlign: "center", color: "var(--coral)" }}>Customer not found</div>;

  const requiresFollowup = outcome === "Call Back Tomorrow" || outcome === "Call Back Next Week" || outcome === "Follow-up Required";

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)", background: "var(--bg-wash)", overflow: "hidden" }}>
      
      {/* Left Panel - Customer Snapshot */}
      <div style={{ width: 320, background: "#fff", borderRight: "1px solid var(--card-border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--card-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate)" }}>
              <User size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--ink)" }}>{customer.name}</h2>
              <Link to={`/customers/${customer.id}`} target="_blank" style={{ fontSize: 12, color: "var(--teal)", textDecoration: "none", fontWeight: 600 }}>Open Full 360° Profile</Link>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}><Phone size={16} /> {customer.phone}</div>
            <div style={{ fontSize: 13, color: "var(--slate)" }}>Segment: <strong>{customer.segment}</strong></div>
            <div style={{ fontSize: 13, color: "var(--slate)" }}>Health Score: <strong>{customer.health_score}</strong></div>
          </div>
        </div>

        {/* Script Viewer */}
        <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 800, color: "var(--slate)", letterSpacing: "0.05em", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 6 }}><FileText size={14}/> Call Script</h3>
          <select value={category} onChange={handleCategoryChange} style={{ ...inputStyle, marginBottom: 12 }}>
            <option value="general">General Follow-up</option>
            <option value="abandoned_cart">Abandoned Cart Recovery</option>
            <option value="rto">RTO Recovery</option>
            <option value="cross_sell">Cross-sell</option>
          </select>
          <div style={{ flex: 1, background: "var(--bg)", padding: 12, borderRadius: 8, fontSize: 13, color: "var(--ink)", lineHeight: 1.6, whiteSpace: "pre-wrap", border: "1px solid var(--card-border)", overflowY: "auto" }}>
            {script}
          </div>
        </div>
      </div>

      {/* Main Workspace - Call Outcome Form */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        <div style={{ background: "#fff", padding: 32, borderRadius: 12, border: "1px solid var(--card-border)", maxWidth: 700, margin: "0 auto", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 24px 0", color: "var(--ink)" }}>Log Call Outcome</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            <div>
              <label style={labelStyle}>Call Outcome *</label>
              <select required value={outcome} onChange={e => setOutcome(e.target.value)} style={inputStyle}>
                <option value="">Select Outcome...</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Payment Link Sent">Payment Link Sent</option>
                <option value="Interested">Interested</option>
                <option value="Call Back Tomorrow">Call Back Tomorrow</option>
                <option value="Call Back Next Week">Call Back Next Week</option>
                <option value="Follow-up Required">Follow-up Required</option>
                <option value="No Response">No Response</option>
                <option value="Busy">Busy</option>
                <option value="Switched Off">Switched Off</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Already Purchased">Already Purchased</option>
                <option value="Refund Requested">Refund Requested</option>
                <option value="Complaint Registered">Complaint Registered</option>
              </select>
            </div>

            {requiresFollowup && (
              <div style={{ background: "#F3E8FF", padding: 16, borderRadius: 8, border: "1px solid #D8B4FE" }}>
                <label style={{...labelStyle, color: "#6B21A8"}}>Schedule Follow-up Date & Time *</label>
                <input required type="datetime-local" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={inputStyle} />
                <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#7E22CE" }}>A follow-up task will be automatically created and added to the queue.</p>
              </div>
            )}

            <div>
              <label style={labelStyle}>Customer Objection</label>
              <select value={objectionType} onChange={e => setObjectionType(e.target.value)} style={inputStyle}>
                <option value="">No Objection / Select One</option>
                <option value="Price Too High">Price Too High</option>
                <option value="Delivery Delay">Delivery Delay</option>
                <option value="Need Doctor Consultation">Need Doctor Consultation</option>
                <option value="Purchased Elsewhere">Purchased Elsewhere</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Call Later">Call Later</option>
              </select>
            </div>

            {(outcome === "Order Placed" || outcome === "Payment Link Sent") && (
              <div>
                <label style={labelStyle}>Sale Amount / Expected Value (For Attribution)</label>
                <input type="number" placeholder="0.00" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} style={inputStyle} />
              </div>
            )}

            <div>
              <label style={labelStyle}>Call Summary & Remarks</label>
              <textarea 
                rows={4} 
                placeholder="Summarize the conversation..." 
                value={remarks} 
                onChange={e => setRemarks(e.target.value)} 
                style={{ ...inputStyle, resize: "vertical" }} 
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
              <button type="button" onClick={() => navigate("/calls")} style={{ padding: "10px 20px", background: "transparent", color: "var(--slate)", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={{ padding: "10px 24px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={18} /> Save & Complete Call
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--slate-border)", fontSize: 14, outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 13, fontWeight: 700, color: "var(--slate)", marginBottom: 8 };
