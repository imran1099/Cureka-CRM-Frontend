import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { SEGMENTS, SOURCES, outcomeMeta, OBJECTION_TYPES, SENTIMENTS, DECISION_STYLES, PRICE_SENSITIVITY, CONTACT_TIMES, SUGGESTED_TAGS } from "../lib/constants";
import { ArrowLeft, Phone, ShoppingBag, MessageSquare, ToggleLeft, ToggleRight, Plus, X, Pencil, AlertTriangle, Tag as TagIcon, HeartPulse, Sparkles, Brain } from "lucide-react";

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const reload = async () => {
    const refreshed = await api.getCustomer(id);
    setData(refreshed);
  };

  useEffect(() => {
    setLoading(true);
    api
      .getCustomer(id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleDNC = async () => {
    await api.updateCustomer(id, { do_not_call: data.customer.do_not_call ? 0 : 1 });
    await reload();
  };

  if (loading) return <div style={{ padding: 28, color: "var(--muted)" }}>Loading…</div>;
  if (!data) return <div style={{ padding: 28 }}>Customer not found.</div>;

  const { customer, purchases, calls, tags } = data;
  const seg = SEGMENTS[customer.segment] || SEGMENTS.new_lead;
  const Icon = seg.icon;

  // Merge purchases + calls into one chronological timeline
  const timeline = [
    ...purchases.map((p) => ({ type: "purchase", date: p.order_date, data: p })),
    ...calls.map((c) => ({ type: "call", date: c.called_at, data: c })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ padding: "24px 28px", maxWidth: 760 }}>
      <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--slate)", fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={14} /> Back to queue
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{customer.name}</h1>
          <div className="tabular" style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>
            {customer.phone} {customer.email ? `· ${customer.email}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowEditProfile(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--teal)", background: "none", border: "1px solid var(--teal-border)", borderRadius: 8, padding: "7px 11px" }}
          >
            <Pencil size={13} /> Edit profile
          </button>
          <button
            onClick={toggleDNC}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: customer.do_not_call ? "var(--coral)" : "var(--muted)", background: "none", border: "1px solid var(--card-border)", borderRadius: 8, padding: "7px 11px" }}
          >
            {customer.do_not_call ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {customer.do_not_call ? "Do-not-call ON" : "Mark do-not-call"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <InfoCard label="Lifetime value" value={`₹${Number(customer.ltv).toLocaleString("en-IN")}`} />
        <InfoCard label="Source" value={SOURCES[customer.source] || customer.source} />
        <InfoCard label="Segment" value={seg.label} color={seg.color} icon={Icon} />
        {customer.score > -1000 && <InfoCard label="Priority reason" value={customer.reason} />}
      </div>

      {customer.cart_items && (
        <div style={{ marginTop: 14, fontSize: 13, background: "var(--teal-light)", border: "1px solid var(--teal-border)", borderRadius: 10, padding: "10px 14px", color: "var(--teal)" }}>
          <strong>Cart contents:</strong> {customer.cart_items}
        </div>
      )}

      {customer.allergies_restrictions && (
        <div style={{ marginTop: 14, fontSize: 13, background: "var(--coral-light)", border: "1px solid var(--coral-border)", borderRadius: 10, padding: "10px 14px", color: "var(--coral)", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <div><strong>Allergies / restrictions:</strong> {customer.allergies_restrictions}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        {customer.age && <InfoCard label="Age" value={customer.age} />}
        {customer.gender && <InfoCard label="Gender" value={customer.gender} />}
        {customer.city && <InfoCard label="City" value={customer.city} />}
        {customer.preferred_contact_time && <InfoCard label="Best time to call" value={CONTACT_TIMES.find((c) => c.key === customer.preferred_contact_time)?.label || customer.preferred_contact_time} />}
        {customer.preferred_language && <InfoCard label="Preferred language" value={customer.preferred_language} />}
        {customer.price_sensitivity && <InfoCard label="Price sensitivity" value={PRICE_SENSITIVITY.find((p) => p.key === customer.price_sensitivity)?.label} color={customer.price_sensitivity === "high" ? "var(--coral)" : "var(--ink)"} />}
        {customer.product_name && <InfoCard label="Product Name" value={customer.product_name} />}
        {customer.sku && <InfoCard label="SKU" value={customer.sku} />}
      </div>

      {customer.order_ids && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 6 }}>Order ID(s)</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {customer.order_ids.split(",").map(oid => (
              <span key={oid.trim()} style={{ fontSize: 12, fontWeight: 700, background: "var(--teal-light)", color: "var(--teal)", borderRadius: 6, padding: "4px 8px", border: "1px solid var(--teal-border)" }}>
                {oid.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {customer.household_notes && (
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--slate)", background: "#fff", border: "1px solid var(--card-border)", borderRadius: 10, padding: "10px 14px" }}>
          <strong>Household notes:</strong> {customer.household_notes}
        </div>
      )}

      <HealthAndTags customer={customer} tags={tags} onChange={reload} />

      <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 28, marginBottom: 12 }}>History</h2>

      {timeline.length === 0 ? (
        <div style={{ color: "var(--muted)", fontSize: 13.5 }}>No purchases or calls logged yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {timeline.map((item, idx) =>
            item.type === "purchase" ? (
              <PurchaseRow key={`p-${idx}`} purchase={item.data} />
            ) : (
              <CallRow key={`c-${idx}`} call={item.data} />
            )
          )}
        </div>
      )}

      {showEditProfile && (
        <EditProfileModal customer={customer} onClose={() => setShowEditProfile(false)} onSaved={async () => { setShowEditProfile(false); await reload(); }} />
      )}
    </div>
  );
}

function InfoCard({ label, value, color, icon: Icon }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 10, padding: "10px 14px", minWidth: 140 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: color || "var(--ink)", display: "flex", alignItems: "center", gap: 5 }}>
        {Icon && <Icon size={13} />}
        {value}
      </div>
    </div>
  );
}

function PurchaseRow({ purchase }) {
  return (
    <div style={{ display: "flex", gap: 12, background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ShoppingBag size={15} color="var(--teal)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{purchase.product_name}</div>
        <div className="tabular" style={{ fontSize: 12, color: "var(--muted)" }}>
          {purchase.order_date} · Qty {purchase.quantity} · ₹{Number(purchase.amount).toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}

function CallRow({ call }) {
  const meta = outcomeMeta(call.outcome);
  const OIcon = meta.icon;
  const objection = OBJECTION_TYPES.find((o) => o.key === call.objection_type);
  const sentiment = SENTIMENTS.find((s) => s.key === call.sentiment);
  const decisionStyle = DECISION_STYLES.find((d) => d.key === call.decision_style);

  return (
    <div style={{ display: "flex", gap: 12, background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: "var(--slate-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <OIcon size={15} color={meta.color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {meta.label}
          <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>by {call.agent_name}</span>
        </div>
        <div className="tabular" style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
          {new Date(call.called_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {call.sale_amount ? ` · ₹${Number(call.sale_amount).toLocaleString("en-IN")}` : ""}
        </div>

        {(objection || sentiment || decisionStyle || call.interest_level) && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 }}>
            {objection && objection.key !== "no_objection" && (
              <MiniTag label={`Objection: ${objection.label}`} color="var(--coral)" />
            )}
            {sentiment && <MiniTag label={sentiment.label} color={sentiment.color} />}
            {decisionStyle && <MiniTag label={decisionStyle.label} color="var(--slate)" />}
            {call.interest_level && <MiniTag label={`Interest: ${call.interest_level}/5`} color="var(--teal)" />}
          </div>
        )}

        {call.remarks && (
          <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 6, background: "var(--bg)", borderRadius: 7, padding: "7px 9px", display: "flex", gap: 6 }}>
            <MessageSquare size={12} style={{ flexShrink: 0, marginTop: 1, opacity: 0.5 }} />
            {call.remarks}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniTag({ label, color }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color, background: `${color}1A`, borderRadius: 5, padding: "2px 7px" }}>
      {label}
    </span>
  );
}

function HealthAndTags({ customer, tags, onChange }) {
  const [adding, setAdding] = useState(null); // tag_type currently adding, or null
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
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
        <TagIcon size={15} /> Tags
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((s) => {
          const SIcon = s.icon;
          const sectionTags = byType(s.type);
          return (
            <div key={s.type}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6 }}>
                <SIcon size={13} /> {s.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sectionTags.map((t) => (
                  <span
                    key={t.id}
                    style={{ fontSize: 12, fontWeight: 600, color: s.color, background: `${s.color}14`, border: `1px solid ${s.color}33`, borderRadius: 7, padding: "5px 9px", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    {t.tag}
                    <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", color: s.color, opacity: 0.6, display: "flex" }}>
                      <X size={11} />
                    </button>
                  </span>
                ))}

                {adding === s.type ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      autoFocus
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitTag(s.type)}
                      placeholder="Type a tag…"
                      list={`suggestions-${s.type}`}
                      style={{ fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--slate-border)", width: 140 }}
                    />
                    <datalist id={`suggestions-${s.type}`}>
                      {SUGGESTED_TAGS[s.type].map((t) => <option key={t} value={t} />)}
                    </datalist>
                    <button onClick={() => submitTag(s.type)} style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: s.color, border: "none", borderRadius: 6, padding: "5px 9px" }}>Add</button>
                    <button onClick={() => { setAdding(null); setNewTag(""); }} style={{ background: "none", border: "none", color: "var(--muted)" }}><X size={13} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(s.type)}
                    style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", background: "none", border: "1px dashed var(--slate-border)", borderRadius: 7, padding: "5px 9px", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={11} /> Add
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
    product_name: customer.product_name || "",
    sku: customer.sku || "",
    order_ids: customer.order_ids || "",
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
        product_name: form.product_name || null,
        sku: form.sku || null,
        order_ids: form.order_ids || null,
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
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)" }}><X size={18} /></button>
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
        <ModalField label="Product Name"><input style={inputStyle} value={form.product_name} onChange={(e) => set("product_name", e.target.value)} placeholder="e.g. Cureka Daily Vitamins" /></ModalField>
        <ModalField label="SKU"><input style={inputStyle} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. CDV-1001" /></ModalField>
        <ModalField label="Order ID(s) (comma-separated)"><input style={inputStyle} value={form.order_ids} onChange={(e) => set("order_ids", e.target.value)} placeholder="e.g. ORD-01, ORD-02" /></ModalField>
        <ModalField label="Allergies / restrictions"><input style={inputStyle} value={form.allergies_restrictions} onChange={(e) => set("allergies_restrictions", e.target.value)} placeholder="e.g. Allergic to shellfish-derived supplements" /></ModalField>
        <ModalField label="Health conditions (comma-separated)"><input style={inputStyle} value={form.health_conditions} onChange={(e) => set("health_conditions", e.target.value)} placeholder="diabetes, joint pain" /></ModalField>
        <ModalField label="Product preferences (comma-separated)"><input style={inputStyle} value={form.product_preferences} onChange={(e) => set("product_preferences", e.target.value)} placeholder="ayurvedic, sugar-free" /></ModalField>

        {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

        <button onClick={submit} disabled={saving} style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13.5, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}

function ModalField({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--slate)", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", fontSize: 13.5, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--slate-border)", fontFamily: "inherit" };
