import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Zap, ChevronDown, X, Check } from "lucide-react";

const TRIGGER_EVENTS = [
  { value: "cart_abandoned",      label: "🛒 Cart Abandoned" },
  { value: "call_no_answer",      label: "📵 Call No Answer / Missed" },
  { value: "ticket_created",      label: "🎫 Ticket Created" },
  { value: "ticket_resolved",     label: "✅ Ticket Resolved" },
  { value: "order_delivered",     label: "📦 Order Delivered" },
  { value: "payment_link_sent",   label: "💳 Payment Link Sent" },
  { value: "opportunity_created", label: "💡 Opportunity Created" },
  { value: "customer_registered", label: "🆕 Customer Registered" },
];

const PRIORITY_OPTS = [
  { value: "critical", label: "🔴 Critical" },
  { value: "high",     label: "🟠 High" },
  { value: "medium",   label: "🟡 Medium" },
  { value: "low",      label: "🟢 Low" },
];

export default function WorkflowRulesPage() {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm());

  function defaultForm() {
    return {
      name: "", description: "", trigger_event: "", is_active: true, priority_order: 10,
      action_config: { category_id: "", title: "", delay_hours: 0, priority: "medium" },
    };
  }

  const load = async () => {
    setLoading(true);
    try {
      const [rulesRes, catsRes] = await Promise.all([
        api.followups.getRules(),
        api.followups.getCategories(),
      ]);
      setRules(rulesRes.rules || []);
      setCategories(catsRes.categories || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditRule(null);
    setForm(defaultForm());
    setShowForm(true);
  };

  const openEdit = (rule) => {
    setEditRule(rule);
    const config = typeof rule.action_config === "string" ? JSON.parse(rule.action_config) : rule.action_config;
    setForm({
      name: rule.name, description: rule.description || "", trigger_event: rule.trigger_event,
      is_active: rule.is_active === 1, priority_order: rule.priority_order,
      action_config: config,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.trigger_event || !form.action_config.category_id || !form.action_config.title) {
      return alert("Name, trigger event, category, and follow-up title are required.");
    }
    setSubmitting(true);
    try {
      if (editRule) {
        await api.followups.updateRule(editRule.id, form);
      } else {
        await api.followups.createRule(form);
      }
      setShowForm(false);
      load();
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (rule) => {
    await api.followups.updateRule(rule.id, { is_active: rule.is_active ? 0 : 1 });
    load();
  };

  const handleDelete = async (rule) => {
    if (!window.confirm(`Delete rule "${rule.name}"?`)) return;
    await api.followups.deleteRule(rule.id);
    load();
  };

  const groupedByTrigger = TRIGGER_EVENTS.map(ev => ({
    ...ev,
    rules: rules.filter(r => r.trigger_event === ev.value),
  })).filter(g => g.rules.length > 0 || g.value === "cart_abandoned");

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "24px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={20} color="#F59E0B" /> Workflow Rules Engine
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748B", marginTop: 2 }}>
            Configure no-code automation rules that auto-create follow-ups from business events
          </p>
        </div>
        <button onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "linear-gradient(135deg,#6D28D9,#2563EB)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
          <Plus size={15} /> New Rule
        </button>
      </div>

      {/* Rules List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 80, background: "#E2E8F0", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite" }} />)}
        </div>
      ) : rules.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
          <Zap size={48} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>No workflow rules configured</p>
          <p style={{ fontSize: 13 }}>Click "New Rule" to create your first automation.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {TRIGGER_EVENTS.map(ev => {
            const evRules = rules.filter(r => r.trigger_event === ev.value);
            if (!evRules.length) return null;
            return (
              <div key={ev.value}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#475569" }}>When: {ev.label}</span>
                  <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                  <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{evRules.length} rule{evRules.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {evRules.map(rule => {
                    const config = typeof rule.action_config === "string" ? JSON.parse(rule.action_config) : rule.action_config;
                    const cat = categories.find(c => c.id === config.category_id);
                    return (
                      <div key={rule.id} style={{
                        background: "#fff", borderRadius: 10, padding: "14px 18px",
                        border: "1px solid #E2E8F0", borderLeft: `3px solid ${rule.is_active ? "#059669" : "#CBD5E1"}`,
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                        opacity: rule.is_active ? 1 : 0.6,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 4 }}>
                            {rule.is_active ? "🟢" : "⚪"} {rule.name}
                          </div>
                          <div style={{ fontSize: 12.5, color: "#64748B", display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <span>→ <strong>{config.title}</strong></span>
                            {cat && <span>Category: {cat.icon} {cat.name}</span>}
                            <span>After: <strong>{config.delay_hours || 0}h delay</strong></span>
                            <span>Priority: <strong>{config.priority || "medium"}</strong></span>
                          </div>
                          {rule.description && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{rule.description}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => handleToggle(rule)} title={rule.is_active ? "Disable" : "Enable"}
                            style={{ ...iconBtn, color: rule.is_active ? "#059669" : "#94A3B8", background: rule.is_active ? "#F0FDF4" : "#F9FAFB" }}>
                            {rule.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button onClick={() => openEdit(rule)} style={{ ...iconBtn, color: "#2563EB", background: "#EFF6FF" }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(rule)} style={{ ...iconBtn, color: "#DC2626", background: "#FEF2F2" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rule Form Modal ─────────────────────────────────────────────────── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 560, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{editRule ? "Edit Rule" : "Create Workflow Rule"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 14 }}>
                <FormField label="Rule Name *">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Abandoned Cart → Immediate Follow-up" style={inp} />
                </FormField>
                <FormField label="Description">
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional rule description" style={inp} />
                </FormField>
                <FormField label="Trigger Event *">
                  <select value={form.trigger_event} onChange={e => setForm(f => ({ ...f, trigger_event: e.target.value }))} style={inp}>
                    <option value="">Select trigger event…</option>
                    {TRIGGER_EVENTS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </FormField>

                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Action: Create Follow-up</div>
                  <div style={{ display: "grid", gap: 12 }}>
                    <FormField label="Follow-up Category *">
                      <select value={form.action_config.category_id}
                        onChange={e => setForm(f => ({ ...f, action_config: { ...f.action_config, category_id: e.target.value } }))} style={inp}>
                        <option value="">Select category…</option>
                        {["sales","success","support","operations","internal"].map(grp => (
                          <optgroup key={grp} label={grp.toUpperCase()}>
                            {categories.filter(c => c.group_name === grp).map(c => (
                              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Follow-up Title *">
                      <input value={form.action_config.title}
                        onChange={e => setForm(f => ({ ...f, action_config: { ...f.action_config, title: e.target.value } }))}
                        placeholder="e.g. Cart Recovery Follow-up" style={inp} />
                    </FormField>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <FormField label="Delay (hours)">
                        <input type="number" min={0} value={form.action_config.delay_hours}
                          onChange={e => setForm(f => ({ ...f, action_config: { ...f.action_config, delay_hours: parseInt(e.target.value) || 0 } }))}
                          style={inp} />
                      </FormField>
                      <FormField label="Priority">
                        <select value={form.action_config.priority}
                          onChange={e => setForm(f => ({ ...f, action_config: { ...f.action_config, priority: e.target.value } }))} style={inp}>
                          {PRIORITY_OPTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </FormField>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                    Rule Active
                  </label>
                </div>

                <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
                  <button type="submit" disabled={submitting}
                    style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#6D28D9,#2563EB)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    {submitting ? "Saving…" : editRule ? "Update Rule" : "Create Rule"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ padding: "11px 18px", background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 9, fontWeight: 600, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" };
const iconBtn = { width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" };
