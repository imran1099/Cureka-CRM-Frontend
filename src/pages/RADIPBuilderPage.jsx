import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Save, Settings, Database, Activity } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6D28D9",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

export default function RADIPBuilderPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    source: "orders",
    dimension: "brand_id",
    metric: "sum_revenue"
  });
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [meta, setMeta] = useState({ name: "", description: "", category: "Custom" });

  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await api.radip.previewBuilder({ config });
      setPreviewData(res.data || []);
    } catch (err) {
      alert("Failed to generate preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!meta.name) return alert("Please provide a report name.");
    try {
      const res = await api.radip.saveCustomReport({
        name: meta.name,
        description: meta.description,
        category: meta.category,
        query_config: config
      });
      alert("Custom Report Saved!");
      navigate(`/radip/viewer/${res.id}`);
    } catch (err) {
      alert("Failed to save report.");
    }
  };

  const headers = previewData && previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div style={{ display: "flex", height: "100%", background: COLORS.bg, overflow: "hidden" }}>
      
      {/* Left Sidebar (Guided Builder) */}
      <div style={{ width: 350, background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}` }}>
          <Link to="/radip" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: COLORS.textMuted, textDecoration: "none", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            <ArrowLeft size={14} /> Back to Hub
          </Link>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Settings size={18} color={COLORS.primary} /> Guided Report Builder
          </h2>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
              <Database size={14} color={COLORS.primary} /> 1. Select Data Source
            </label>
            <select 
              value={config.source} 
              onChange={e => setConfig({...config, source: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}
            >
              <option value="orders">Shopify Orders</option>
              <option value="tickets">Support Tickets</option>
              <option value="calls">Call Logs</option>
            </select>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
              <Activity size={14} color={COLORS.primary} /> 2. Group By (Dimension)
            </label>
            <select 
              value={config.dimension} 
              onChange={e => setConfig({...config, dimension: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}
            >
              {config.source === 'orders' && (
                <>
                  <option value="brand_id">Brand</option>
                  <option value="DATE(created_at)">Date</option>
                  <option value="financial_status">Payment Status</option>
                </>
              )}
              {config.source === 'tickets' && (
                <>
                  <option value="status">Status</option>
                  <option value="reason">Reason (Category)</option>
                  <option value="brand_id">Brand</option>
                </>
              )}
              {config.source === 'calls' && (
                <>
                  <option value="status">Outcome</option>
                  <option value="agent_id">Agent ID</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
              <Activity size={14} color={COLORS.primary} /> 3. Measure (Metric)
            </label>
            <select 
              value={config.metric} 
              onChange={e => setConfig({...config, metric: e.target.value})}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}
            >
              <option value="count">Count (Total Volume)</option>
              {config.source === 'orders' && <option value="sum_revenue">Sum of Revenue</option>}
            </select>
          </div>

          <button onClick={handlePreview} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "12px", background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Play size={14} /> Run Preview
          </button>
        </div>

        <div style={{ padding: 20, borderTop: `1px solid ${COLORS.border}`, background: "#F1F5F9" }}>
          <input type="text" placeholder="Report Name" value={meta.name} onChange={e => setMeta({...meta, name: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, marginBottom: 8, fontSize: 13, boxSizing: "border-box" }} />
          <input type="text" placeholder="Description" value={meta.description} onChange={e => setMeta({...meta, description: e.target.value})} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, marginBottom: 12, fontSize: 13, boxSizing: "border-box" }} />
          <button onClick={handleSave} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "12px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Save size={14} /> Save Report
          </button>
        </div>
      </div>

      {/* Right Side (Preview Pane) */}
      <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: COLORS.text }}>Preview</h3>
        <div style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {loading ? (
             <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Executing query...</div>
          ) : !previewData ? (
             <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Configure the report and click 'Run Preview' to see data.</div>
          ) : previewData.length === 0 ? (
             <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>No data returned.</div>
          ) : (
            <div style={{ overflow: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ position: "sticky", top: 0, background: COLORS.bg, zIndex: 1 }}>
                  <tr>
                    {headers.map(h => (
                      <th key={h} style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>
                        {h.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? COLORS.card : COLORS.bg }}>
                      {headers.map(h => (
                        <td key={h} style={{ padding: "12px 16px", fontSize: 13, color: COLORS.text }}>
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
