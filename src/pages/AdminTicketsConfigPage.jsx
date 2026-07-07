import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Settings, Plus, Save } from "lucide-react";

export default function AdminTicketsConfigPage() {
  const [categories, setCategories] = useState([]);
  const [slas, setSlas] = useState([]);
  
  const [newCat, setNewCat] = useState({ name: "", department_id: "" });
  const [newSla, setNewSla] = useState({ category_id: "", priority: "medium", first_response_minutes: 60, resolution_minutes: 1440 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.tickets.getCategories(),
        api.tickets.getSlaRules()
      ]);
      setCategories(cRes.categories || []);
      setSlas(sRes.rules || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCat.name) return;
    await api.tickets.createCategory(newCat);
    setNewCat({ name: "", department_id: "" });
    loadData();
  };

  const handleCreateSla = async () => {
    if (!newSla.category_id) return;
    await api.tickets.createSlaRule(newSla);
    setNewSla({ category_id: "", priority: "medium", first_response_minutes: 60, resolution_minutes: 1440 });
    loadData();
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 24px 0", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
        <Settings size={24} color="var(--teal)" /> Ticketing Configuration
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        
        {/* Categories Config */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px 0", color: "var(--ink)" }}>Ticket Categories</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input 
              type="text" 
              placeholder="Category Name (e.g. Delivery Issue)" 
              value={newCat.name} 
              onChange={e => setNewCat({...newCat, name: e.target.value})}
              style={inputStyle}
            />
            <button onClick={handleCreateCategory} style={btnStyle}><Plus size={16}/> Add</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-wash)", borderBottom: "1px solid var(--card-border)" }}>
                <th style={thStyle}>Name</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={tdStyle}>{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SLA Rules Config */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px 0", color: "var(--ink)" }}>SLA Rules</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <select value={newSla.category_id} onChange={e => setNewSla({...newSla, category_id: e.target.value})} style={inputStyle}>
              <option value="">Select Category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={newSla.priority} onChange={e => setNewSla({...newSla, priority: e.target.value})} style={inputStyle}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" placeholder="First Response (mins)" value={newSla.first_response_minutes} onChange={e => setNewSla({...newSla, first_response_minutes: parseInt(e.target.value)})} style={inputStyle} />
              <input type="number" placeholder="Resolution (mins)" value={newSla.resolution_minutes} onChange={e => setNewSla({...newSla, resolution_minutes: parseInt(e.target.value)})} style={inputStyle} />
            </div>
            <button onClick={handleCreateSla} style={{...btnStyle, width: "100%", justifyContent: "center"}}><Save size={16}/> Save Rule</button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-wash)", borderBottom: "1px solid var(--card-border)" }}>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>FRT</th>
                <th style={thStyle}>Res</th>
              </tr>
            </thead>
            <tbody>
              {slas.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <td style={tdStyle}>{s.category_name}</td>
                  <td style={tdStyle}>{s.priority}</td>
                  <td style={tdStyle}>{s.first_response_minutes}m</td>
                  <td style={tdStyle}>{s.resolution_minutes}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const inputStyle = { flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--slate-border)", fontSize: 13, outline: "none" };
const btnStyle = { padding: "8px 16px", borderRadius: 8, background: "var(--teal)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 };
const thStyle = { padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase", textAlign: "left" };
const tdStyle = { padding: "12px", fontSize: 13, color: "var(--ink)", borderBottom: "1px solid var(--bg)" };
