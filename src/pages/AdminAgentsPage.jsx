import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Plus, X, ToggleLeft, ToggleRight, KeyRound, User, UserCheck } from "lucide-react";
import { useAuth } from "../lib/auth.jsx";

export default function AdminAgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, rolesRes, deptRes] = await Promise.all([
        api.iam.listUsers(),
        api.roles.listRoles(),
        api.departments.list()
      ]);
      setAgents(res.users);
      setRoles(rolesRes.roles);
      setDepartments(deptRes.departments);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (agent) => {
    const newStatus = agent.employment_status === "active" ? "suspended" : "active";
    await api.iam.updateStatus(agent.id, newStatus);
    load();
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Users & Agents</h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 0" }}>Manage employees, agents, roles, and access.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700 }}>
          <Plus size={14} /> New user
        </button>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: 13.5 }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {agents.map((a) => (
            <div key={a.id} style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  {a.name}
                  {a.employee_id && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--slate)", background: "var(--bg)", padding: "2px 6px", borderRadius: 4 }}>#{a.employee_id}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{a.email}</div>
                {a.department_name && <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>{a.department_name}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: ["admin", "super_admin"].includes(a.role_slug) ? "var(--coral)" : "var(--teal)", background: ["admin", "super_admin"].includes(a.role_slug) ? "var(--coral-light)" : "var(--teal-light)", borderRadius: 6, padding: "3px 8px" }}>
                  {a.role_name}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--slate)" }}>
                  {a.brands && a.brands.length > 0 ? `${a.brands.length} brand(s)` : 'No brands'}
                </span>
              </div>
              
              <div style={{ width: 1, height: 32, background: "var(--card-border)", margin: "0 4px" }} />

              <button onClick={() => setResetTarget(a)} title="Reset password" style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: 8, padding: 7, color: "var(--slate)" }}>
                <KeyRound size={14} />
              </button>
              <button 
                onClick={() => toggleActive(a)} 
                disabled={a.id === user.id}
                style={{ 
                  display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid var(--card-border)", 
                  borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, 
                  color: a.employment_status === "active" ? "var(--teal)" : "var(--muted)",
                  opacity: a.id === user.id ? 0.5 : 1,
                  cursor: a.id === user.id ? "not-allowed" : "pointer"
                }}>
                {a.employment_status === "active" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {a.employment_status === "active" ? "Active" : "Disabled"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddAgentModal roles={roles} departments={departments} onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} />}
      {resetTarget && <ResetPasswordModal agent={resetTarget} onClose={() => setResetTarget(null)} onDone={() => { setResetTarget(null); load(); }} />}
    </div>
  );
}

function AddAgentModal({ roles, departments, onClose, onDone }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", employee_id: "", role_id: roles[0]?.id || "", department_id: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await api.iam.createUser(form);
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="New User" onClose={onClose}>
      <Field label="Name"><input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
      <Field label="Employee ID (Optional)"><input style={inputStyle} value={form.employee_id} onChange={(e) => set("employee_id", e.target.value)} /></Field>
      
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Role">
            <select style={inputStyle} value={form.role_id} onChange={(e) => set("role_id", e.target.value)}>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Department">
            <select style={inputStyle} value={form.department_id} onChange={(e) => set("department_id", e.target.value)}>
              <option value="">None</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Temporary Password"><input style={inputStyle} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Share securely with the agent" /></Field>
      
      {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <button onClick={submit} disabled={!form.name || !form.email || !form.password || saving} style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 13.5, fontWeight: 700, opacity: !form.name || !form.email || !form.password ? 0.5 : 1 }}>
        {saving ? "Creating…" : "Create user"}
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
      await api.iam.resetPassword(agent.id, { new_password: password });
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
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 450 }}>
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
