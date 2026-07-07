import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { SEGMENTS, SOURCES, outcomeMeta, OBJECTION_TYPES, SENTIMENTS, DECISION_STYLES, PRICE_SENSITIVITY, CONTACT_TIMES, SUGGESTED_TAGS } from "../lib/constants";
import { ArrowLeft, Phone, Mail, MessageSquare, Plus, X, Pencil, AlertTriangle, Tag as TagIcon, HeartPulse, Sparkles, Brain, Check, MapPin, Ticket, Clock, Calendar, ShieldCheck, Activity, Star, Bot, FileText, ShoppingBag, CreditCard } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("timeline");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  
  const [noteContent, setNoteContent] = useState("");
  const [followupData, setFollowupData] = useState({ due_date: "", reason: "" });

  const reload = async () => {
    try {
      const [res360, resTimeline] = await Promise.all([
        api.getCustomer360(id),
        api.getCustomerTimeline(id)
      ]);
      setData(res360);
      setTimeline(resTimeline.timeline || []);
    } catch (err) {
      console.error(err);
      if (err.status === 404) setData(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 28, color: "var(--muted)" }}>Loading Customer 360° Profile…</div>;
  if (!data) return <div style={{ padding: 28 }}>Customer not found or access denied.</div>;

  const { customer, kpis, tags, addresses, followups } = data;
  const seg = SEGMENTS[customer.segment] || SEGMENTS.new_lead;
  const SegIcon = seg.icon;

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await api.addCustomerNote(id, { content: noteContent.trim() });
    setNoteContent("");
    setShowAddNote(false);
    reload();
  };

  const handleAddFollowup = async () => {
    if (!followupData.due_date) return;
    await api.createFollowup(id, { ...followupData });
    setFollowupData({ due_date: "", reason: "" });
    setShowAddFollowup(false);
    reload();
  };

  const tabs = [
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "purchases", label: "Purchases", icon: ShoppingBag },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "calls", label: "Calls", icon: Phone },
    { id: "notes", label: "Internal Notes", icon: FileText },
    { id: "ai", label: "AI Insights", icon: Bot },
  ];

  const filteredTimeline = timeline.filter(item => {
    if (activeTab === "timeline") return true;
    if (activeTab === "purchases") return item.type === "order";
    if (activeTab === "tickets") return item.type === "ticket";
    if (activeTab === "calls") return item.type === "call";
    if (activeTab === "notes") return item.type === "note";
    return false;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-wash)" }}>
      {/* Sticky Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid var(--card-border)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: "var(--bg)", border: "1px solid var(--card-border)", borderRadius: "50%", color: "var(--slate)", cursor: "pointer" }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--teal)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{customer.name}</h1>
              {customer.health_score >= 80 && <span title="Verified & Healthy" style={{ color: "var(--teal)", display: "flex" }}><ShieldCheck size={16} /></span>}
              {customer.do_not_call === 1 && <span style={{ fontSize: 10, fontWeight: 800, background: "var(--coral-light)", color: "var(--coral)", padding: "3px 6px", borderRadius: 4 }}>DNC</span>}
            </div>
            <div className="tabular" style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, display: "flex", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {customer.phone}</span>
              {customer.email && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {customer.email}</span>}
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><TagIcon size={12} /> CRM ID: {customer.id}</span>
              {customer.shopify_customer_id && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ShoppingBag size={12} /> Shopify ID: {customer.shopify_customer_id}</span>}
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          <QuickActionButton icon={Phone} label="Call" color="var(--teal)" />
          <QuickActionButton icon={Mail} label="Email" />
          <QuickActionButton icon={MessageSquare} label="WhatsApp" />
          <QuickActionButton icon={Ticket} label="Create Ticket" />
          <QuickActionButton icon={FileText} label="Add Note" onClick={() => setShowAddNote(true)} />
          <QuickActionButton icon={Calendar} label="Follow-up" onClick={() => setShowAddFollowup(true)} />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left Panel - Identity & Demographics */}
        <div style={{ width: 340, flexShrink: 0, background: "#fff", borderRight: "1px solid var(--card-border)", overflowY: "auto", padding: "20px" }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "var(--slate)" }}>Customer Identity</h3>
            <button onClick={() => setShowEditProfile(true)} style={{ background: "none", border: "none", color: "var(--teal)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><Pencil size={12} /> Edit</button>
          </div>

          <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px", marginBottom: 20 }}>
            <IdentityRow label="Segment" value={seg.label} icon={SegIcon} color={seg.color} />
            <IdentityRow label="Age / Gender" value={`${customer.age || '-'} / ${customer.gender || '-'}`} />
            <IdentityRow label="City" value={customer.city || '-'} />
            <IdentityRow label="Language" value={customer.preferred_language || '-'} />
            <IdentityRow label="Best Time to Call" value={CONTACT_TIMES.find(c => c.key === customer.preferred_contact_time)?.label || '-'} />
            <IdentityRow label="Price Sensitivity" value={PRICE_SENSITIVITY.find(p => p.key === customer.price_sensitivity)?.label || '-'} color={customer.price_sensitivity === 'high' ? 'var(--coral)' : undefined} />
            {customer.customer_since && <IdentityRow label="Customer Since" value={new Date(customer.customer_since).toLocaleDateString()} />}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0", color: "var(--slate)" }}>Brand Relationships</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {customer.brandLinks && customer.brandLinks.map(b => (
              <span key={b.brand_id} style={{ fontSize: 11, fontWeight: 700, background: "#fff", border: "1px solid var(--slate-border)", borderRadius: 6, padding: "4px 8px" }}>
                {b.brand_name}
              </span>
            ))}
            {(!customer.brandLinks || customer.brandLinks.length === 0) && <span style={{ fontSize: 12, color: "var(--muted)" }}>No brands</span>}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0", color: "var(--slate)" }}>Pending Follow-ups</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {followups.map(f => (
              <div key={f.id} style={{ background: "#fff", border: "1px solid var(--teal-border)", borderRadius: 8, padding: "10px", borderLeft: "3px solid var(--teal)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--teal)", display: "flex", justifyContent: "space-between" }}>
                  <span>{new Date(f.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <span>{f.agent_name}</span>
                </div>
                {f.reason && <div style={{ fontSize: 12, marginTop: 4, color: "var(--slate)" }}>{f.reason}</div>}
              </div>
            ))}
            {followups.length === 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>No pending follow-ups.</span>}
          </div>

          <HealthAndTags customer={customer} tags={tags} onChange={reload} />

          {(customer.allergies_restrictions || customer.health_conditions?.length > 0) && (
            <div style={{ marginTop: 20, background: "var(--coral-light)", border: "1px solid var(--coral-border)", borderRadius: 10, padding: "12px", color: "var(--coral)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                <AlertTriangle size={14} /> Medical / Restrictions
              </div>
              {customer.allergies_restrictions && <div style={{ fontSize: 12, marginBottom: 4 }}><strong>Allergies:</strong> {customer.allergies_restrictions}</div>}
              {customer.health_conditions?.length > 0 && <div style={{ fontSize: 12 }}><strong>Conditions:</strong> {customer.health_conditions.join(", ")}</div>}
            </div>
          )}
          
          {customer.household_notes && (
             <div style={{ marginTop: 12, background: "var(--bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "12px", color: "var(--slate)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Household Notes</div>
              <div style={{ fontSize: 12 }}>{customer.household_notes}</div>
            </div>
          )}

        </div>

        {/* Right Panel - Analytics & Hub */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column" }}>
          
          {/* KPI Row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <KPICard label="Health Score" value={`${customer.score || customer.health_score || 0}/100`} color={customer.score > 50 ? "var(--teal)" : "var(--coral)"} icon={HeartPulse} />
            <KPICard label="Lifetime Value" value={`₹${Number(customer.ltv).toLocaleString("en-IN")}`} icon={CreditCard} />
            <KPICard label="Total Orders" value={kpis.total_orders} icon={ShoppingBag} />
            <KPICard label="Avg Order Value" value={`₹${kpis.aov.toLocaleString("en-IN")}`} icon={Activity} />
            <KPICard label="Open Tickets" value={kpis.open_tickets} color={kpis.open_tickets > 0 ? "var(--coral)" : "var(--muted)"} icon={Ticket} />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--card-border)", marginBottom: 20 }}>
            {tabs.map(t => {
              const active = activeTab === t.id;
              const TIcon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "0 0 12px 0",
                    background: "none", border: "none", borderBottom: active ? "2px solid var(--teal)" : "2px solid transparent",
                    color: active ? "var(--teal)" : "var(--muted)",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <TIcon size={14} /> {t.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content Area */}
          <div style={{ flex: 1 }}>
            
            {activeTab === "ai" && (
              <div style={{ background: "linear-gradient(135deg, var(--teal-light), #fff)", border: "1px solid var(--teal-border)", borderRadius: 12, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--teal)", fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
                  <Sparkles size={20} /> AI Recommendations
                </div>
                <p style={{ fontSize: 13, color: "var(--slate)", lineHeight: 1.5, marginBottom: 16 }}>
                  Based on this customer's profile, purchase history, and recent interactions, the AI suggests the following next best actions:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#fff", padding: 12, borderRadius: 8, border: "1px solid var(--card-border)", fontSize: 13, display: "flex", gap: 10 }}>
                    <div style={{ color: "var(--teal)" }}><Star size={16} /></div>
                    <div><strong>Cross-sell Opportunity:</strong> Customer recently bought Vitamin C. High probability to purchase Zinc Supplements.</div>
                  </div>
                  <div style={{ background: "#fff", padding: 12, borderRadius: 8, border: "1px solid var(--card-border)", fontSize: 13, display: "flex", gap: 10 }}>
                    <div style={{ color: "var(--coral)" }}><AlertTriangle size={16} /></div>
                    <div><strong>Churn Risk:</strong> Customer has 2 open tickets and hasn't purchased in 45 days. Suggest initiating a check-in call.</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "ai" && (
              filteredTimeline.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                  No {activeTab} history available.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
                  {/* Timeline vertical line */}
                  <div style={{ position: "absolute", left: 19, top: 20, bottom: 20, width: 2, background: "var(--card-border)", zIndex: 0 }}></div>
                  
                  {filteredTimeline.map((item, idx) => (
                    <TimelineRow key={`${item.type}-${idx}`} item={item} />
                  ))}
                </div>
              )
            )}
            
          </div>
        </div>
      </div>

      {showEditProfile && <EditProfileModal customer={customer} onClose={() => setShowEditProfile(false)} onSaved={async () => { setShowEditProfile(false); await reload(); }} />}
      
      {showAddNote && (
        <SimpleModal title="Add Internal Note" onClose={() => setShowAddNote(false)} onSave={handleAddNote}>
          <textarea style={{ ...inputStyle, minHeight: 100 }} placeholder="Write a note... this is only visible to agents." value={noteContent} onChange={e => setNoteContent(e.target.value)} />
        </SimpleModal>
      )}

      {showAddFollowup && (
        <SimpleModal title="Schedule Follow-up" onClose={() => setShowAddFollowup(false)} onSave={handleAddFollowup}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Due Date & Time</label>
              <input type="datetime-local" style={inputStyle} value={followupData.due_date} onChange={e => setFollowupData({ ...followupData, due_date: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Reason</label>
              <input type="text" style={inputStyle} placeholder="e.g. Call to check if supplement is working" value={followupData.reason} onChange={e => setFollowupData({ ...followupData, reason: e.target.value })} />
            </div>
          </div>
        </SimpleModal>
      )}

    </div>
  );
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function QuickActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: color || "var(--slate)", background: "#fff", border: "1px solid var(--card-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
      <Icon size={13} /> {label}
    </button>
  );
}

function IdentityRow({ label, value, icon: Icon, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "4px 0", fontSize: 12.5 }}>
      <span style={{ color: "var(--muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: color || "var(--ink)", display: "flex", alignItems: "center", gap: 4 }}>
        {Icon && <Icon size={12} />} {value}
      </span>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, color }) {
  return (
    <div style={{ flex: "1 1 140px", background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.01)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>
        <Icon size={14} /> {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || "var(--ink)", letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
}

function TimelineRow({ item }) {
  let Icon = Activity;
  let color = "var(--slate)";
  let bg = "var(--slate-light)";
  
  if (item.type === "order") {
    Icon = ShoppingBag;
    color = "var(--teal)";
    bg = "var(--teal-light)";
  } else if (item.type === "call") {
    Icon = Phone;
    color = "#6D5BD0";
    bg = "#6D5BD01A";
  } else if (item.type === "ticket") {
    Icon = Ticket;
    color = "var(--coral)";
    bg = "var(--coral-light)";
  } else if (item.type === "note") {
    Icon = FileText;
    color = "#E5A000";
    bg = "#FFF5D1";
  }

  return (
    <div style={{ display: "flex", gap: 16, zIndex: 1 }}>
      <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #fff" }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1, background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "14px 16px", marginTop: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{item.title}</div>
          <div className="tabular" style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>
            {new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
        </div>
        
        {item.type === "order" && (
          <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 4 }}>
            Quantity: <strong>{item.quantity}</strong> · Amount: <strong>₹{Number(item.amount).toLocaleString()}</strong>
          </div>
        )}
        
        {item.type === "call" && (
          <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 4 }}>
            Agent: <strong>{item.agent_name || "Unknown"}</strong>
            {item.remarks && <div style={{ marginTop: 6, background: "var(--bg)", padding: "6px 10px", borderRadius: 6, fontStyle: "italic" }}>"{item.remarks}"</div>}
          </div>
        )}

        {item.type === "ticket" && (
          <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 4 }}>
            Status: <span style={{ textTransform: "uppercase", fontSize: 10, fontWeight: 800, padding: "2px 6px", background: "var(--bg)", borderRadius: 4 }}>{item.status}</span>
          </div>
        )}

        {item.type === "note" && (
          <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 4 }}>
            <span style={{ fontWeight: 600, color: "var(--muted)" }}>By {item.agent_name}</span>
            <div style={{ marginTop: 6, background: "#FFFBF0", border: "1px solid #FFE8A1", padding: "8px 12px", borderRadius: 8, whiteSpace: "pre-wrap" }}>
              {item.remarks}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleModal({ title, children, onClose, onSave }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 400 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16.5, fontWeight: 700 }}>{title}</h2>
        {children}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, background: "var(--bg)", border: "none", borderRadius: 8, fontWeight: 600 }}>Cancel</button>
          <button onClick={onSave} style={{ flex: 1, padding: 10, background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700 }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// Reuse HealthAndTags and EditProfileModal exactly or similarly from before

function HealthAndTags({ customer, tags, onChange }) {
  const [adding, setAdding] = useState(null);
  const [newTag, setNewTag] = useState("");

  const byType = (type) => tags.filter((t) => t.tag_type === type);

  const submitTag = async (tagType) => {
    if (!newTag.trim()) return;
    await api.addTag(customer.id, newTag.trim(), tagType);
    setNewTag("");
    setAdding(null);
    onChange();
  };

  const removeTag = async (tag) => {
    await api.removeTag(customer.id, tag.id);
    onChange();
  };

  const sections = [
    { type: "health", label: "Health context", icon: HeartPulse, color: "var(--coral)" },
    { type: "preference", label: "Preferences", icon: Sparkles, color: "var(--teal)" },
    { type: "behavioral", label: "Behavioral", icon: Brain, color: "#6D5BD0" },
  ];

  return (
    <div style={{ marginTop: 22 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0", color: "var(--slate)", display: "flex", alignItems: "center", gap: 6 }}>
        <TagIcon size={14} /> Tags & Context
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((s) => {
          const SIcon = s.icon;
          const sectionTags = byType(s.type);
          return (
            <div key={s.type}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: s.color, marginBottom: 6 }}>
                <SIcon size={12} /> {s.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sectionTags.map((t) => (
                  <span
                    key={t.id}
                    style={{ fontSize: 11.5, fontWeight: 600, color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}33`, borderRadius: 6, padding: "4px 8px", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    {t.tag}
                    <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", color: s.color, opacity: 0.6, display: "flex", cursor: "pointer" }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}

                {adding === s.type ? (
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <input
                      autoFocus
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitTag(s.type)}
                      placeholder="Type..."
                      list={`suggestions-${s.type}`}
                      style={{ fontSize: 11.5, padding: "4px 6px", borderRadius: 4, border: "1px solid var(--slate-border)", width: 100 }}
                    />
                    <datalist id={`suggestions-${s.type}`}>
                      {SUGGESTED_TAGS[s.type].map((t) => <option key={t} value={t} />)}
                    </datalist>
                    <button onClick={() => submitTag(s.type)} style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: s.color, border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer" }}>Add</button>
                    <button onClick={() => { setAdding(null); setNewTag(""); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={12} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(s.type)}
                    style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", background: "none", border: "1px dashed var(--slate-border)", borderRadius: 6, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
                  >
                    <Plus size={10} /> Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditProfileModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    age: customer.age || "",
    gender: customer.gender || "",
    city: customer.city || "",
    preferred_contact_time: customer.preferred_contact_time || "",
    preferred_language: customer.preferred_language || "",
    household_notes: customer.household_notes || "",
    allergies_restrictions: customer.allergies_restrictions || "",
    health_conditions: (customer.health_conditions || []).join(", "),
    product_preferences: (customer.product_preferences || []).join(", "),
    price_sensitivity: customer.price_sensitivity || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await api.updateCustomer(customer.id, {
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        city: form.city || null,
        preferred_contact_time: form.preferred_contact_time || null,
        preferred_language: form.preferred_language || null,
        household_notes: form.household_notes || null,
        allergies_restrictions: form.allergies_restrictions || null,
        health_conditions: form.health_conditions ? form.health_conditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
        product_preferences: form.product_preferences ? form.product_preferences.split(",").map((s) => s.trim()).filter(Boolean) : [],
        price_sensitivity: form.price_sensitivity || null,
      });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Edit profile — {customer.name}</h2>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <ModalField label="Age" style={{ flex: 1 }}><input type="number" style={inputStyle} value={form.age} onChange={(e) => set("age", e.target.value)} /></ModalField>
          <ModalField label="Gender" style={{ flex: 1 }}>
            <select style={inputStyle} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">—</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </ModalField>
        </div>
        <ModalField label="City"><input style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} /></ModalField>
        <ModalField label="Preferred contact time">
          <select style={inputStyle} value={form.preferred_contact_time} onChange={(e) => set("preferred_contact_time", e.target.value)}>
            <option value="">—</option>
            {CONTACT_TIMES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </ModalField>
        <ModalField label="Preferred language"><input style={inputStyle} value={form.preferred_language} onChange={(e) => set("preferred_language", e.target.value)} placeholder="e.g. Hindi, Tamil, English" /></ModalField>
        <ModalField label="Price sensitivity">
          <select style={inputStyle} value={form.price_sensitivity} onChange={(e) => set("price_sensitivity", e.target.value)}>
            <option value="">—</option>
            {PRICE_SENSITIVITY.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </ModalField>
        <ModalField label="Household notes"><input style={inputStyle} value={form.household_notes} onChange={(e) => set("household_notes", e.target.value)} placeholder="e.g. Decisions made jointly with spouse" /></ModalField>
        <ModalField label="Allergies / restrictions"><input style={inputStyle} value={form.allergies_restrictions} onChange={(e) => set("allergies_restrictions", e.target.value)} placeholder="e.g. Allergic to shellfish-derived supplements" /></ModalField>
        <ModalField label="Health conditions (comma-separated)"><input style={inputStyle} value={form.health_conditions} onChange={(e) => set("health_conditions", e.target.value)} placeholder="diabetes, joint pain" /></ModalField>
        <ModalField label="Product preferences (comma-separated)"><input style={inputStyle} value={form.product_preferences} onChange={(e) => set("product_preferences", e.target.value)} placeholder="ayurvedic, sugar-free" /></ModalField>

        {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

        <button onClick={submit} disabled={saving} style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13.5, fontWeight: 700, opacity: saving ? 0.7 : 1, cursor: "pointer" }}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}

function ModalField({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--slate)", marginBottom: 5 };
const inputStyle = { width: "100%", fontSize: 13.5, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--slate-border)", fontFamily: "inherit" };
