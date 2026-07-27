import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useToast } from "../components/Toast";
import { SkeletonCard, SkeletonTable } from "../components/SkeletonLoader";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  ShoppingBag,
  Ticket,
  Clock,
  MessageSquare,
  Sparkles,
  Copy,
  Plus,
  Send,
  RotateCcw,
  DollarSign,
  FileText,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Tag,
  ExternalLink,
  Activity,
  HeartPulse,
} from "lucide-react";

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  // Quick Action Modal States
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupDate, setFollowupDate] = useState("");
  const [followupReason, setFollowupReason] = useState("");

  const loadProfile = () => {
    setLoading(true);
    api
      .get(`/api/customers/${id}/360`)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Customer 360 load error:", err);
        addToast("Failed to load customer profile", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const handleCopyDetails = () => {
    if (!data?.customer) return;
    const text = `Customer Name: ${data.customer.name}\nPhone: ${data.customer.phone}\nEmail: ${data.customer.email}\nAddress: ${data.addresses?.[0]?.full_address || "N/A"}\nLTV: ₹${data.analytics?.total_spend}`;
    navigator.clipboard.writeText(text);
    addToast("Customer details copied to clipboard!", "success");
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      await api.post(`/api/customers/${id}/notes`, { content: noteContent });
      addToast("Internal note added successfully!", "success");
      setNoteContent("");
      setShowNoteModal(false);
      loadProfile();
    } catch (err) {
      addToast("Failed to add note", "error");
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    if (!followupDate) return;
    try {
      await api.post(`/api/customers/${id}/followups`, {
        due_date: followupDate,
        reason: followupReason || "Customer Follow-up",
      });
      addToast("Follow-up task created!", "success");
      setFollowupDate("");
      setFollowupReason("");
      setShowFollowupModal(false);
      loadProfile();
    } catch (err) {
      addToast("Failed to create follow-up", "error");
    }
  };

  if (loading || !data) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <SkeletonCard height={100} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 20 }}>
          <SkeletonCard height={400} />
          <SkeletonTable rows={6} />
          <SkeletonCard height={400} />
        </div>
      </div>
    );
  }

  const { customer, analytics, orders, communication, support, marketing, subscriptions, timeline, addresses, tags, aiInsights } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1440, margin: "0 auto" }}>
      {/* ── BREADCRUMB & HEADER BAR ────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
            <Link to="/admin/customers" style={{ color: "var(--muted)" }}>Customers</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Customer 360° Profile</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {customer.name}
            </h1>
            {customer.is_vip === 1 && (
              <span className="badge badge-pending" style={{ fontSize: 12 }}>
                <Star size={13} /> VIP Customer
              </span>
            )}
            <span className="badge badge-info" style={{ fontSize: 12 }}>
              {customer.membership_tier || "Silver Member"}
            </span>
          </div>
        </div>

        {/* ── QUICK ACTIONS TOOLBAR ─────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/calls/workspace/${id}`)}>
            <Phone size={14} /> Log Call
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast(`Opening WhatsApp chat with ${customer.phone}...`, "info")}>
            <MessageSquare size={14} /> Send WhatsApp
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => addToast(`Opening Email composer for ${customer.email}...`, "info")}>
            <Mail size={14} /> Send Email
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/tickets")}>
            <Ticket size={14} /> Create Ticket
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowNoteModal(true)}>
            <FileText size={14} /> Add Note
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFollowupModal(true)}>
            <Clock size={14} /> Create Follow-up
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleCopyDetails}>
            <Copy size={14} /> Copy Details
          </button>
        </div>
      </div>

      {/* ── THREE-COLUMN ENTERPRISE LAYOUT ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 340px", gap: 20, alignItems: "start" }}>
        
        {/* ── LEFT COLUMN: PERSONAL DETAILS & ANALYTICS METRICS ───────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Customer Analytics Cards */}
          <div className="card-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} style={{ color: "var(--teal)" }} />
              Customer Analytics
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <MetricRow label="Lifetime Value (LTV)" value={`₹${analytics.total_spend.toLocaleString("en-IN")}`} highlight />
              <MetricRow label="Total Orders" value={analytics.total_orders} />
              <MetricRow label="Average Order Value (AOV)" value={`₹${analytics.aov.toLocaleString("en-IN")}`} />
              <MetricRow label="Repeat Purchase %" value={`${analytics.repeat_purchase_pct}%`} />
              <MetricRow label="RFM Score" value={analytics.rfm_score} />
              <MetricRow label="Risk Score Assessment" value={`${analytics.risk_score} / 100 (Low)`} />
              <MetricRow label="Loyalty Points Balance" value={`${customer.loyalty_points} Pts`} />
              <MetricRow label="Predicted Next Order" value={analytics.predicted_next_purchase} />
            </div>
          </div>

          {/* Personal Information */}
          <div className="card-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
              <User size={16} style={{ color: "var(--teal)" }} />
              Personal Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <DetailRow icon={Phone} label="Phone" value={customer.phone || "N/A"} />
              <DetailRow icon={Mail} label="Email" value={customer.email || "N/A"} />
              <DetailRow icon={Calendar} label="Birthday" value={customer.birthday} />
              <DetailRow icon={User} label="Gender" value={customer.gender} />
              <DetailRow
                icon={MapPin}
                label="Primary Address"
                value={addresses?.[0]?.full_address || "124 Marine Drive, Fort"}
              />
              <DetailRow
                icon={MapPin}
                label="City / State"
                value={`${addresses?.[0]?.city || "Mumbai"}, ${addresses?.[0]?.state || "Maharashtra"} - ${addresses?.[0]?.pincode || "400001"}`}
              />
            </div>
          </div>

          {/* Subscriptions & Consents */}
          <div className="card-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--ink)" }}>
              Subscriptions & Consents
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ConsentBadge label="WhatsApp Notification Consent" active={customer.whatsapp_consent === 1} />
              <ConsentBadge label="Email Newsletter Consent" active={customer.newsletter_consent === 1} />
              <ConsentBadge label="VIP Membership Active" active={customer.is_vip === 1} />
            </div>
          </div>
        </div>

        {/* ── CENTER COLUMN: TABBED WORKSPACE & UNIFIED TIMELINE ────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Workspace Tabs */}
          <div className="card-panel" style={{ padding: "4px 8px", display: "flex", gap: 4, background: "var(--card)" }}>
            {[
              { id: "timeline", label: "Unified Timeline", icon: Activity },
              { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
              { id: "communication", label: "Communications", icon: MessageSquare },
              { id: "support", label: `Tickets (${support.tickets.length})`, icon: Ticket },
              { id: "marketing", label: "Marketing & UTM", icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? "var(--teal)" : "var(--muted)",
                    background: activeTab === tab.id ? "var(--teal-light)" : "transparent",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: UNIFIED CHRONOLOGICAL TIMELINE */}
          {activeTab === "timeline" && (
            <div className="card-panel" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={16} style={{ color: "var(--teal)" }} />
                Unified Chronological Timeline (Orders, Calls, Tickets, Notes)
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
                {timeline.map((event, idx) => (
                  <div
                    key={event.id || idx}
                    style={{
                      display: "flex",
                      gap: 14,
                      position: "relative",
                      paddingBottom: idx === timeline.length - 1 ? 0 : 12,
                      borderLeft: idx === timeline.length - 1 ? "none" : "2px solid var(--card-border)",
                      marginLeft: 14,
                      paddingLeft: 20,
                    }}
                  >
                    {/* Timeline Node Bullet Icon */}
                    <div
                      style={{
                        position: "absolute",
                        left: -11,
                        top: 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: getTimelineColor(event.type).bg,
                        color: getTimelineColor(event.type).text,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid var(--card)",
                      }}
                    >
                      {getTimelineIcon(event.type)}
                    </div>

                    <div style={{ flex: 1, background: "var(--bg)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{event.title}</span>
                        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{new Date(event.date).toLocaleString()}</span>
                      </div>
                      {event.remarks && <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{event.remarks}</p>}
                      {event.amount && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", marginTop: 4 }}>Amount: ₹{Number(event.amount).toLocaleString("en-IN")}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & REFUNDS HISTORY */}
          {activeTab === "orders" && (
            <div className="card-panel" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Purchase & Order History</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--card-border)", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>
                    <th style={{ padding: "10px 12px" }}>Product Name</th>
                    <th style={{ padding: "10px 12px" }}>Order Date</th>
                    <th style={{ padding: "10px 12px" }}>Qty</th>
                    <th style={{ padding: "10px 12px" }}>Amount</th>
                    <th style={{ padding: "10px 12px" }}>Status</th>
                    <th style={{ padding: "10px 12px" }}>Courier / Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--ink)" }}>{o.product_name}</td>
                      <td style={{ padding: "12px", color: "var(--muted)" }}>{new Date(o.order_date).toLocaleDateString()}</td>
                      <td style={{ padding: "12px" }}>{o.quantity}</td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "var(--teal)" }}>₹{Number(o.amount).toLocaleString("en-IN")}</td>
                      <td style={{ padding: "12px" }}>
                        <span className="badge badge-success">{o.status}</span>
                      </td>
                      <td style={{ padding: "12px", fontSize: 12, color: "var(--muted)" }}>
                        {o.courier} ({o.tracking_number})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: COMMUNICATIONS & NOTES */}
          {activeTab === "communication" && (
            <div className="card-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Logged Calls, WhatsApp & Internal Notes</h3>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>INTERNAL NOTES</h4>
                {communication.notes.map((n) => (
                  <div key={n.id} style={{ background: "var(--bg)", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 8, border: "1px solid var(--card-border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", marginBottom: 4 }}>{n.agent_name || "Agent"} • {new Date(n.date).toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: "var(--ink)" }}>{n.content}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>WHATSAPP & EMAIL MESSAGES</h4>
                {communication.whatsapp.map((w) => (
                  <div key={w.id} style={{ background: "var(--bg)", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 8, border: "1px solid var(--card-border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", marginBottom: 4 }}>WhatsApp ({w.type}) • {new Date(w.date).toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: "var(--ink)" }}>{w.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT HISTORY */}
          {activeTab === "support" && (
            <div className="card-panel" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Support Tickets & CSAT Scores</h3>
                <div style={{ display: "flex", gap: 12, fontSize: 13, fontWeight: 700 }}>
                  <span style={{ color: "var(--status-success-text)" }}>CSAT: {support.csat_score}</span>
                  <span style={{ color: "var(--teal)" }}>NPS: {support.nps_score}</span>
                </div>
              </div>

              {support.tickets.map((t) => (
                <div key={t.id} style={{ padding: 12, background: "var(--bg)", borderRadius: "var(--radius-sm)", marginBottom: 10, border: "1px solid var(--card-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>Ticket #{t.id.slice(0, 8)} - {t.department}</span>
                    <span className="badge badge-pending">{t.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Assigned: {t.agent_name || "Unassigned"} • Priority: {t.priority}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: MARKETING & UTM HISTORY */}
          {activeTab === "marketing" && (
            <div className="card-panel" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Marketing Campaigns & UTM History</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <MetricRow label="Campaigns Received" value={marketing.campaigns_received} />
                <MetricRow label="Emails Opened" value={marketing.emails_opened} />
                <MetricRow label="WhatsApp Clicks" value={marketing.whatsapp_clicks} />
                <MetricRow label="Referral Source" value={marketing.referral_source} />
                <MetricRow label="UTM Source" value={marketing.utm_source} />
                <MetricRow label="Coupons Used" value={marketing.coupons_used.join(", ")} />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: INTEGRATED AI ASSISTANT PANEL ────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="card-panel"
            style={{
              padding: 18,
              background: "linear-gradient(180deg, var(--card) 0%, var(--bg) 100%)",
              border: "1px solid var(--teal-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "var(--teal)" }}>
              <Sparkles size={18} />
              <h3 style={{ fontSize: 15, fontWeight: 800 }}>AI Customer Copilot</h3>
            </div>

            {/* Sentiment Meter */}
            <div style={{ background: "var(--card)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>CUSTOMER SENTIMENT ANALYSIS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--status-success-text)", fontWeight: 700, fontSize: 14 }}>
                <HeartPulse size={18} />
                Positive ({aiInsights.sentiment.positive}%)
              </div>
            </div>

            {/* AI Summary */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>AUTOMATED AI SUMMARY</div>
              <p style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.5 }}>{aiInsights.summary}</p>
            </div>

            {/* Buying Behavior */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>BUYING BEHAVIOR & INTENT</div>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>{aiInsights.buying_behavior}</p>
            </div>

            {/* Suggested Action */}
            <div style={{ background: "var(--status-info-bg)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--status-info-border)", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--status-info-text)", marginBottom: 4 }}>SUGGESTED NEXT BEST ACTION</div>
              <p style={{ fontSize: 12.5, color: "var(--status-info-text)", fontWeight: 600 }}>{aiInsights.suggested_next_action}</p>
            </div>

            {/* Upsell / Cross-sell Recommendations */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>RECOMMENDED UPSELL & CROSS-SELL</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {aiInsights.recommendations.map((prod, idx) => (
                  <div key={idx} style={{ background: "var(--card)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--card-border)", fontSize: 12, fontWeight: 600, color: "var(--teal)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus size={12} /> {prod}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS FOR QUICK ACTIONS ─────────────────────────────────── */}
      {showNoteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card-panel" style={{ padding: 24, width: 420 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Add Internal Agent Note</h3>
            <form onSubmit={handleAddNote}>
              <textarea
                className="input"
                rows={4}
                placeholder="Type internal note details here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFollowupModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card-panel" style={{ padding: 24, width: 420 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Schedule Follow-up Task</h3>
            <form onSubmit={handleCreateFollowup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Due Date & Time</label>
                <input type="datetime-local" className="input" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Reason / Topic</label>
                <input type="text" className="input" placeholder="e.g. Call regarding reorder inquiry" value={followupReason} onChange={(e) => setFollowupReason(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFollowupModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight ? "var(--teal)" : "var(--ink)" }}>{value}</span>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Icon size={15} style={{ color: "var(--muted)", marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
        <div style={{ color: "var(--ink)", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

function ConsentBadge({ label, active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, padding: "6px 10px", background: "var(--bg)", borderRadius: 6, border: "1px solid var(--card-border)" }}>
      <span style={{ color: "var(--ink)", fontWeight: 500 }}>{label}</span>
      <span className={active ? "badge badge-success" : "badge badge-critical"}>
        {active ? "Active" : "Opted Out"}
      </span>
    </div>
  );
}

function getTimelineIcon(type) {
  switch (type) {
    case "order": return <ShoppingBag size={11} />;
    case "call": return <Phone size={11} />;
    case "ticket": return <Ticket size={11} />;
    case "note": return <FileText size={11} />;
    default: return <Activity size={11} />;
  }
}

function getTimelineColor(type) {
  switch (type) {
    case "order": return { bg: "var(--teal-light)", text: "var(--teal)" };
    case "call": return { bg: "var(--amber-light)", text: "var(--amber)" };
    case "ticket": return { bg: "var(--status-critical-bg)", text: "var(--status-critical-text)" };
    case "note": return { bg: "var(--status-info-bg)", text: "var(--status-info-text)" };
    default: return { bg: "var(--slate-light)", text: "var(--slate)" };
  }
}
