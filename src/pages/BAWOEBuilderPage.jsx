import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Play, GitMerge, Zap, Settings2 } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6366F1",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  success: "#10B981"
};

export default function BAWOEBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Workflow State
  const [name, setName] = useState("New Workflow");
  const [description, setDescription] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("order_delivered");
  const [status, setStatus] = useState("draft");
  
  // Linear Nodes Representation (Simplified for V1 UI, but mapped to Graph definition on save)
  const [steps, setSteps] = useState([
    { id: "1", type: "trigger", config: { event: "order_delivered" } }
  ]);

  useEffect(() => {
    if (id !== "new") {
      setLoading(true);
      api.bawoe.getWorkflow(id).then(res => {
        const wf = res.workflow;
        setName(wf.name);
        setDescription(wf.description);
        setTriggerEvent(wf.trigger_event);
        setStatus(wf.status);
        
        let def = wf.definition;
        if (typeof def === 'string') def = JSON.parse(def);
        
        // For V1 UI, we flatten the graph back into a linear sequence if possible.
        // Assuming nodes array is somewhat ordered for this basic builder
        setSteps(def.nodes || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAddStep = (type) => {
    const newId = Date.now().toString();
    const newStep = { id: newId, type, config: {} };
    if (type === 'condition') newStep.config = { field: "brand_id", operator: "==", value: "brd_cureka" };
    if (type === 'action') newStep.config = { action: "CREATE_FOLLOWUP", payload: { reason: "Follow up", days: 1 } };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index) => {
    if (index === 0) return; // Cannot remove trigger
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const updateStepConfig = (index, newConfig) => {
    const newSteps = [...steps];
    newSteps[index].config = { ...newSteps[index].config, ...newConfig };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Convert linear steps into a Graph (nodes + edges) for the backend
    const nodes = steps.map(s => ({ id: s.id, type: s.type, data: s.config }));
    const edges = [];
    
    for (let i = 0; i < nodes.length - 1; i++) {
      const source = nodes[i];
      const target = nodes[i + 1];
      
      const edge = { id: `e${source.id}-${target.id}`, source: source.id, target: target.id };
      
      // If source was condition, assume the next step is the 'true' branch for this linear builder
      if (source.type === 'condition') {
        edge.sourceHandle = "true";
      }
      
      edges.push(edge);
    }

    const payload = {
      id: id === "new" ? null : id,
      name,
      description,
      trigger_event: triggerEvent,
      status,
      brand_id: null, // Global by default for now
      definition: { nodes, edges }
    };

    try {
      await api.bawoe.saveWorkflow(payload);
      alert("Workflow saved successfully!");
      if (id === "new") navigate("/automation");
    } catch (err) {
      alert("Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: COLORS.textMuted }}>Loading builder...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg }}>
      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/automation")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, display: "flex", alignItems: "center" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, border: "none", outline: "none", background: "transparent", width: 300 }} 
            />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize: 12, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "2px 8px" }}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          <Save size={18} /> {saving ? "Saving..." : "Save Workflow"}
        </button>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, padding: 40, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {steps.map((step, index) => (
            <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Node Card */}
              <div style={{ width: "100%", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", position: "relative" }}>
                {index > 0 && (
                  <button onClick={() => handleRemoveStep(index)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, fontSize: 20 }}>&times;</button>
                )}
                
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: step.type === 'trigger' ? '#EFF6FF' : step.type === 'condition' ? '#FEF3C7' : '#ECFDF5', display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {step.type === 'trigger' && <Zap size={20} color="#3B82F6" />}
                    {step.type === 'condition' && <GitMerge size={20} color="#D97706" />}
                    {step.type === 'action' && <Play size={20} color={COLORS.success} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{step.type} Node</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
                      {step.type === 'trigger' && "Workflow Trigger"}
                      {step.type === 'condition' && "Check Condition"}
                      {step.type === 'action' && "Execute Action"}
                    </div>
                  </div>
                </div>

                {/* Node Config UI */}
                {step.type === 'trigger' && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Event to listen for:</label>
                    <select value={triggerEvent} onChange={e => { setTriggerEvent(e.target.value); updateStepConfig(index, { event: e.target.value }); }} style={{ padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}>
                      <option value="order_delivered">Shopify: Order Delivered</option>
                      <option value="order_created">Shopify: Order Created</option>
                      <option value="ticket_created">CRM: Ticket Created</option>
                    </select>
                  </div>
                )}

                {step.type === 'condition' && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={step.config.field || ''} onChange={e => updateStepConfig(index, { field: e.target.value })} placeholder="Field (e.g. brand_id)" style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                    <select value={step.config.operator || '=='} onChange={e => updateStepConfig(index, { operator: e.target.value })} style={{ padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                      <option value="==">Equals (==)</option>
                      <option value="!=">Not Equals (!=)</option>
                      <option value=">">Greater Than (>)</option>
                    </select>
                    <input value={step.config.value || ''} onChange={e => updateStepConfig(index, { value: e.target.value })} placeholder="Value" style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                  </div>
                )}

                {step.type === 'action' && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <select value={step.config.action || ''} onChange={e => updateStepConfig(index, { action: e.target.value })} style={{ padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}>
                      <option value="CREATE_FOLLOWUP">Create Follow-up</option>
                      <option value="CREATE_TICKET">Create Ticket</option>
                      <option value="REQUIRE_APPROVAL">Require Approval (Assign Task)</option>
                    </select>
                    
                    {step.config.action === 'CREATE_FOLLOWUP' && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input value={step.config.payload?.reason || ''} onChange={e => updateStepConfig(index, { payload: { ...step.config.payload, reason: e.target.value }})} placeholder="Reason" style={{ flex: 2, padding: 8, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                        <input type="number" value={step.config.payload?.days || ''} onChange={e => updateStepConfig(index, { payload: { ...step.config.payload, days: parseInt(e.target.value) }})} placeholder="Days" style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                      </div>
                    )}
                    {step.config.action === 'REQUIRE_APPROVAL' && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input value={step.config.payload?.approval_type || ''} onChange={e => updateStepConfig(index, { payload: { ...step.config.payload, approval_type: e.target.value }})} placeholder="Approval Type" style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                        <input value={step.config.payload?.manager_role || ''} onChange={e => updateStepConfig(index, { payload: { ...step.config.payload, manager_role: e.target.value }})} placeholder="Manager Role" style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Edge Connection Line */}
              {index < steps.length - 1 && (
                <div style={{ width: 2, height: 30, background: COLORS.border }}></div>
              )}
            </div>
          ))}

          {/* Add Step Button */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24, gap: 16 }}>
            <button onClick={() => handleAddStep('condition')} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <GitMerge size={16} color="#D97706" /> Add Condition
            </button>
            <button onClick={() => handleAddStep('action')} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Play size={16} color={COLORS.success} /> Add Action
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
