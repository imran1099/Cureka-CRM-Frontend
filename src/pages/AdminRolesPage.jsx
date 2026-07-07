import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Shield, Plus, X, Check, Search, Lock, Edit2, Trash2 } from "lucide-react";

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.roles.listRoles(),
        api.permissions.list(),
      ]);
      setRoles(rolesRes.roles);
      setPermissions(permsRes.grouped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteRole = async (role) => {
    if (role.is_system) return alert("Cannot delete system roles");
    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;
    try {
      await api.roles.deleteRole(role.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Roles & Permissions</h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 0" }}>Configure system access tiers and fine-grained permissions.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700 }}>
          <Plus size={14} /> New Custom Role
        </button>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: 13.5 }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {roles.map((r) => (
            <div key={r.id} style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ background: r.is_system ? "var(--coral-light)" : "var(--teal-light)", color: r.is_system ? "var(--coral)" : "var(--teal)", padding: 12, borderRadius: 12 }}>
                {r.is_system ? <Lock size={20} /> : <Shield size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  {r.name}
                  {r.is_system === 1 && <span style={{ fontSize: 10, fontWeight: 700, background: "var(--bg)", color: "var(--slate)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>System</span>}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  {r.description || "No description provided."}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 24, padding: "0 24px", borderLeft: "1px solid var(--card-border)", borderRight: "1px solid var(--card-border)" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>{r.user_count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--slate)", textTransform: "uppercase" }}>Users</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>{r.permission_count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--slate)", textTransform: "uppercase" }}>Permissions</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditingRole(r)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg)", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, color: "var(--slate)", cursor: "pointer" }}>
                  <Edit2 size={14} /> Edit
                </button>
                {!r.is_system && (
                  <button onClick={() => deleteRole(r)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--coral-light)", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, color: "var(--coral)", cursor: "pointer" }}>
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingRole && <RoleEditorModal role={editingRole} onClose={() => setEditingRole(null)} onDone={() => { setEditingRole(null); load(); }} />}
      {showAdd && <AddRoleModal permissions={permissions} onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function RoleEditorModal({ role, onClose, onDone }) {
  const [perms, setPerms] = useState({});
  const [matrix, setMatrix] = useState([]);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    api.roles.getPermissionsMatrix(role.id).then(res => {
      setPerms(res.grouped);
      setMatrix(res.permissions);
    });
  }, [role.id]);

  const togglePerm = (permId) => {
    setMatrix(prev => prev.map(p => p.id === permId ? { ...p, granted: !p.granted } : p));
  };

  const submit = async () => {
    setSaving(true);
    try {
      const selectedIds = matrix.filter(p => p.granted).map(p => p.id);
      await api.roles.setPermissionsMatrix(role.id, selectedIds);
      onDone();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!matrix.length) return null;

  return (
    <ModalShell title={`Edit Role: ${role.name}`} onClose={onClose} width={800}>
      <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 10, marginBottom: 20 }}>
        {Object.entries(perms).map(([module, modulePerms]) => (
          <div key={module} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "capitalize", borderBottom: "1px solid var(--card-border)", paddingBottom: 8, marginBottom: 12 }}>
              {module}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {modulePerms.map(p => {
                const current = matrix.find(m => m.id === p.id);
                const isGranted = current?.granted;
                return (
                  <label key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: isGranted ? "var(--teal-light)" : "var(--bg)", padding: "10px 12px", borderRadius: 8, border: `1px solid ${isGranted ? "var(--teal-border)" : "transparent"}` }}>
                    <input 
                      type="checkbox" 
                      checked={isGranted || false} 
                      onChange={() => togglePerm(p.id)}
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isGranted ? "var(--teal)" : "var(--ink)" }}>{p.action}</div>
                      <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 2 }}>{p.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid var(--card-border)", paddingTop: 16 }}>
        <button onClick={onClose} style={{ background: "none", border: "1px solid var(--slate-border)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>Cancel</button>
        <button onClick={submit} disabled={saving} style={{ background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700 }}>
          {saving ? "Saving…" : "Save Permissions"}
        </button>
      </div>
    </ModalShell>
  );
}

function AddRoleModal({ permissions, onClose, onDone }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedPerms, setSelectedPerms] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const togglePerm = (id) => {
    const next = new Set(selectedPerms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPerms(next);
  };

  const submit = async () => {
    setSaving(true);
    try {
      await api.roles.createRole({ ...form, permission_ids: Array.from(selectedPerms) });
      onDone();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Create Custom Role" onClose={onClose} width={800}>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--slate)", marginBottom: 5 }}>Role Name</label>
          <input 
            style={{ width: "100%", fontSize: 14, padding: "9px 11px", borderRadius: 9, border: "1px solid var(--slate-border)", fontFamily: "inherit" }} 
            value={form.name} 
            onChange={(e) => setForm(f => ({...f, name: e.target.value}))} 
            placeholder="e.g. Junior Agent"
          />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--slate)", marginBottom: 5 }}>Description</label>
          <input 
            style={{ width: "100%", fontSize: 14, padding: "9px 11px", borderRadius: 9, border: "1px solid var(--slate-border)", fontFamily: "inherit" }} 
            value={form.description} 
            onChange={(e) => setForm(f => ({...f, description: e.target.value}))} 
            placeholder="Briefly describe the purpose of this role"
          />
        </div>
      </div>

      <div style={{ maxHeight: "50vh", overflowY: "auto", paddingRight: 10, marginBottom: 20 }}>
        {Object.entries(permissions).map(([module, modulePerms]) => (
          <div key={module} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "capitalize", borderBottom: "1px solid var(--card-border)", paddingBottom: 8, marginBottom: 12 }}>
              {module}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {modulePerms.map(p => {
                const isGranted = selectedPerms.has(p.id);
                return (
                  <label key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: isGranted ? "var(--teal-light)" : "var(--bg)", padding: "10px 12px", borderRadius: 8, border: `1px solid ${isGranted ? "var(--teal-border)" : "transparent"}` }}>
                    <input 
                      type="checkbox" 
                      checked={isGranted} 
                      onChange={() => togglePerm(p.id)}
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isGranted ? "var(--teal)" : "var(--ink)" }}>{p.action}</div>
                      <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 2 }}>{p.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid var(--card-border)", paddingTop: 16 }}>
        <button onClick={onClose} style={{ background: "none", border: "1px solid var(--slate-border)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>Cancel</button>
        <button onClick={submit} disabled={!form.name || saving} style={{ background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, opacity: !form.name ? 0.5 : 1 }}>
          {saving ? "Creating…" : "Create Role"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children, width = 450 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: width }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
