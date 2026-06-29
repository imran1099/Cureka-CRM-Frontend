import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Plus, X, ToggleLeft, ToggleRight, KeyRound } from "lucide-react";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAgents();
      setAgents(res.agents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (agent) => {
    await api.updateAgent(agent.id, { active: agent.active ? 0 : 1 });
    load();
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Agents</h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 0" }}>Manage individual logins for the support team.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700 }}>
          <Plus size={14} /> New agent
        </button>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: 13.5 }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {agents.map((a) => (
            <div key={a.id} style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{a.email}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: a.role === "admin" ? "var(--coral)" : "var(--teal)", background: a.role === "admin" ? "var(--coral-light)" : "var(--teal-light)", borderRadius: 6, padding: "3px 8px" }}>
                {a.role}
              </span>
              <button onClick={() => setResetTarget(a)} title="Reset password" style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: 8, padding: 7, color: "var(--slate)" }}>
                <KeyRound size={14} />
              </button>
              <button onClick={() => toggleActive(a)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid var(--card-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, color: a.active ? "var(--teal)" : "var(--muted)" }}>
                {a.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {a.active ? "Active" : "Disabled"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddAgentModal onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} />}
      {resetTarget && <ResetPasswordModal agent={resetTarget} onClose={() => setResetTarget(null)} onDone={() => setResetTarget(null)} />}
    </div>
  );
}

function AddAgentModal({ onClose, onDone }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await api.createAgent(form);
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="New agent login" onClose={onClose}>
      <Field label="Name"><input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
      <Field label="Temporary password"><input style={inputStyle} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Share securely with the agent" /></Field>
      <Field label="Role">
        <select style={inputStyle} value={form.role} onChange={(e) => set("role", e.target.value)}>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <button onClick={submit} disabled={!form.name || !form.email || !form.password || saving} style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13.5, fontWeight: 700, opacity: !form.name || !form.email || !form.password ? 0.5 : 1 }}>
        {saving ? "Creating…" : "Create login"}
      </button>
    </ModalShell>
  );
}

function ResetPasswordModal({ agent, onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await api.updateAgent(agent.id, { password });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Reset password — ${agent.name}`} onClose={onClose}>
      <Field label="New password"><input style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <button onClick={submit} disabled={!password || saving} style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13.5, fontWeight: 700, opacity: !password ? 0.5 : 1 }}>
        {saving ? "Saving…" : "Reset password"}
      </button>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--slate)", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", fontSize: 14, padding: "9px 11px", borderRadius: 9, border: "1px solid var(--slate-border)", fontFamily: "inherit" };
