import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Plus, Kanban, List, Filter, TrendingUp, Search } from "lucide-react";

const OPP_TYPES = [
  "CTWA Lead", "Abandoned Cart", "Upsell Opportunity", "Cross-sell Opportunity",
  "Repeat Purchase", "Subscription Renewal", "RTO Recovery", "Dormant Customer",
  "VIP Engagement", "Bundle Recommendation", "General",
];
const SOURCES = ["CTWA", "Shopify Store", "Phone Call", "Manual Entry", "Abandoned Checkout", "Marketing Campaign", "Referral"];

export default function PipelinePage() {
  const [view, setView] = useState("kanban");
  const [pipeline, setPipeline] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  // Create form state
  const [customers, setCustomers] = useState([]);
  const [newOpp, setNewOpp] = useState({ customer_id: "", type: "CTWA Lead", source: "Manual Entry", expected_revenue: "", priority: "medium" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pipelineRes, oppsRes] = await Promise.all([
        api.cre.getPipeline(),
        api.cre.getOpportunities(),
      ]);
      setPipeline(pipelineRes.pipeline || []);
      setOpportunities(oppsRes.opportunities || []);
    } finally { setLoading(false); }
  };

  const searchCustomers = async (q) => {
    if (q.length < 2) return;
    try {
      const res = await api.searchCustomers(q);
      setCustomers(res.customers || []);
    } catch (_) { }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await api.cre.createOpportunity(newOpp);
      setShowCreate(false);
      navigate(`/pipeline/${res.id}`);
    } catch (err) {
      setCreateError(err.message || "Failed to create opportunity. A duplicate may exist.");
    } finally { setCreating(false); }
  };

  const handleStageMove = async (oppId, newStageId) => {
    try {
      await api.cre.updateOpportunity(oppId, { stage_id: newStageId });
      loadData();
    } catch (err) { console.error(err); }
  };

  const filteredOpps = opportunities.filter(o => {
    const matchSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || o.type === filterType;
    return matchSearch && matchType;
  });

  const totalPipelineValue = pipeline.reduce((acc, s) => acc + s.opportunities.reduce((a, o) => a + (parseFloat(o.expected_revenue) || 0), 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 70px)", background: "var(--bg-wash)" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={22} color="var(--teal)" /> Sales Pipeline
          </h1>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "var(--slate)" }}>
            Pipeline Value: <strong style={{ color: "var(--teal)" }}>₹{totalPipelineValue.toLocaleString()}</strong>
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: 4, background: "var(--bg-wash)", padding: 4, borderRadius: 8 }}>
          <ViewBtn active={view === "kanban"} onClick={() => setView("kanban")} icon={<Kanban size={15} />} label="Kanban" />
          <ViewBtn active={view === "table"} onClick={() => setView("table")} icon={<List size={15} />} label="Table" />
        </div>

        {/* Filters */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--slate)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search customers…" style={{ paddingLeft: 32, padding: "7px 12px 7px 30px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, outline: "none" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: "7px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, outline: "none" }}>
          <option value="">All Types</option>
          {OPP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <button onClick={() => setShowCreate(true)}
          style={{ padding: "8px 16px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> New Opportunity
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 14 }}>Loading pipeline…</div>
      ) : view === "kanban" ? (
        <KanbanView pipeline={pipeline} onCardClick={id => navigate(`/pipeline/${id}`)} onMove={handleStageMove} />
      ) : (
        <TableView opportunities={filteredOpps} onRowClick={id => navigate(`/pipeline/${id}`)} />
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, width: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>New Opportunity</h2>
            {createError && <div style={{ padding: "10px 14px", background: "#FEE2E2", color: "#DC2626", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{createError}</div>}
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Customer Phone / Name *</label>
                <input required placeholder="Search by name or phone…" onInput={e => searchCustomers(e.target.value)}
                  style={inputStyle} list="cust-suggestions" onChange={e => {
                    const found = customers.find(c => c.name === e.target.value || c.phone === e.target.value);
                    if (found) setNewOpp(p => ({ ...p, customer_id: found.id }));
                  }} />
                <datalist id="cust-suggestions">
                  {customers.map(c => <option key={c.id} value={c.name}>{c.phone}</option>)}
                </datalist>
              </div>
              <div>
                <label style={labelStyle}>Opportunity Type *</label>
                <select required value={newOpp.type} onChange={e => setNewOpp(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                  {OPP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Source</label>
                <select value={newOpp.source} onChange={e => setNewOpp(p => ({ ...p, source: e.target.value }))} style={inputStyle}>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Expected Revenue (₹)</label>
                  <input type="number" value={newOpp.expected_revenue} onChange={e => setNewOpp(p => ({ ...p, expected_revenue: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={newOpp.priority} onChange={e => setNewOpp(p => ({ ...p, priority: e.target.value }))} style={inputStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "8px 16px", background: "none", border: "none", color: "var(--slate)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: "8px 20px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  {creating ? "Creating…" : "Create Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanView({ pipeline, onCardClick, onMove }) {
  const dragRef = useRef(null);

  const handleDragStart = (oppId) => { dragRef.current = oppId; };
  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (dragRef.current) { onMove(dragRef.current, stageId); dragRef.current = null; }
  };
  const handleDragOver = (e) => e.preventDefault();

  return (
    <div style={{ flex: 1, display: "flex", gap: 0, overflowX: "auto", padding: "16px", alignItems: "flex-start" }}>
      {pipeline.map(stage => (
        <div key={stage.id} onDrop={e => handleDrop(e, stage.id)} onDragOver={handleDragOver}
          style={{ minWidth: 240, width: 240, flexShrink: 0, marginRight: 12, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 160px)" }}>
          <div style={{ padding: "8px 12px", borderRadius: "8px 8px 0 0", background: stage.color, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{stage.name}</span>
            <span style={{ background: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{stage.opportunities.length}</span>
          </div>
          <div style={{ flex: 1, background: "#F8FAFC", border: "1px solid var(--card-border)", borderTop: "none", borderRadius: "0 0 8px 8px", overflowY: "auto", padding: 8, minHeight: 80 }}>
            {stage.opportunities.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, padding: "20px 0" }}>Drop here</p>
            )}
            {stage.opportunities.map(opp => (
              <OppCard key={opp.id} opp={opp} onClick={() => onCardClick(opp.id)} onDragStart={() => handleDragStart(opp.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OppCard({ opp, onClick, onDragStart }) {
  const priorityColors = { critical: "#EF4444", high: "#F97316", medium: "#F59E0B", low: "#6B7280" };
  return (
    <div draggable onDragStart={onDragStart} onClick={onClick}
      style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", marginBottom: 8, cursor: "grab", border: "1px solid var(--card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "box-shadow 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{opp.customer_name}</span>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColors[opp.priority] || "#6B7280", display: "inline-block", marginTop: 3 }} />
      </div>
      <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "var(--slate)" }}>{opp.type}</p>
      {opp.expected_revenue > 0 && (
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--teal)" }}>₹{parseFloat(opp.expected_revenue).toLocaleString()}</div>
      )}
      {opp.next_followup_at && (
        <div style={{ fontSize: 11, color: new Date(opp.next_followup_at) < new Date() ? "#DC2626" : "var(--slate)", marginTop: 4 }}>
          📅 {new Date(opp.next_followup_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

function TableView({ opportunities, onRowClick }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--card-border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg-wash)", borderBottom: "1px solid var(--card-border)" }}>
              {["Customer", "Type", "Stage", "Expected Revenue", "Priority", "Agent", "Next Follow-up"].map(h => (
                <th key={h} style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opportunities.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No opportunities found.</td></tr>
            )}
            {opportunities.map(opp => (
              <tr key={opp.id} onClick={() => onRowClick(opp.id)}
                style={{ borderBottom: "1px solid var(--card-border)", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-wash)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{opp.customer_name}<br /><span style={{ fontSize: 11, color: "var(--slate)", fontWeight: 400 }}>{opp.phone}</span></td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{opp.type}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: opp.stage_color + "22", color: opp.stage_color }}>{opp.stage_name}</span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>
                  {opp.expected_revenue > 0 ? `₹${parseFloat(opp.expected_revenue).toLocaleString()}` : "—"}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, textTransform: "capitalize" }}>{opp.priority}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{opp.agent_name || "Unassigned"}</td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: opp.next_followup_at && new Date(opp.next_followup_at) < new Date() ? "#DC2626" : "var(--slate)" }}>
                  {opp.next_followup_at ? new Date(opp.next_followup_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 10px", background: active ? "#fff" : "transparent", border: "none", borderRadius: 6, fontWeight: active ? 700 : 500, fontSize: 12, cursor: "pointer", color: active ? "var(--ink)" : "var(--slate)", display: "flex", alignItems: "center", gap: 5, boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
      {icon} {label}
    </button>
  );
}

const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--card-border)", fontSize: 13, outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 6 };
