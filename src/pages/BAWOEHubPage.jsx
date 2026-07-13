import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Workflow, Plus, Play, Activity, Settings, Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6366F1", // Indigo for automation
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B"
};

export default function BAWOEHubPage() {
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.bawoe.getWorkflows(),
      api.bawoe.getExecutions()
    ]).then(([wfRes, exRes]) => {
      if (mounted) {
        setWorkflows(wfRes.workflows || []);
        setExecutions(exRes.executions || []);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleTestTrigger = async (event) => {
    const payloadStr = prompt(`Enter JSON payload for trigger '${event}':`, `{"brand_id": "brd_cureka", "customer_id": "cust_demo"}`);
    if (!payloadStr) return;
    try {
      const payload = JSON.parse(payloadStr);
      await api.bawoe.testTrigger({ event, payload });
      alert("Test event dispatched! Refresh page to see execution logs.");
    } catch (err) {
      alert("Invalid JSON or execution failed.");
    }
  };

  return (
    <div style={{ padding: "32px 40px", height: "100%", background: COLORS.bg, overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 12 }}>
            <Workflow size={28} color={COLORS.primary} /> Automation Studio
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: COLORS.textMuted }}>
            Orchestrate business processes, customer journeys, and background jobs.
          </p>
        </div>
        
        <Link to="/automation/builder/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.primary, color: "#fff", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
          <Plus size={18} /> Create Workflow
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        
        {/* Left Col: Workflows */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Active Workflows</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {loading ? (
              <div style={{ padding: 20, color: COLORS.textMuted }}>Loading workflows...</div>
            ) : workflows.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}>
                No workflows found.
              </div>
            ) : (
              workflows.map(wf => (
                <div key={wf.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{wf.name}</span>
                      {wf.status === 'active' ? (
                        <span style={{ background: "#ECFDF5", color: COLORS.success, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>Active</span>
                      ) : (
                        <span style={{ background: "#F1F5F9", color: COLORS.textMuted, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>Draft</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>{wf.description}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, fontWeight: 600, color: COLORS.primary }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Activity size={14} /> Trigger: {wf.trigger_event}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.textMuted }}><Settings size={14} /> Version {wf.version}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleTestTrigger(wf.trigger_event)} style={{ padding: "8px", background: "#EFF6FF", color: COLORS.primary, border: "none", borderRadius: 8, cursor: "pointer" }} title="Test Trigger">
                      <Play size={18} />
                    </button>
                    <Link to={`/automation/builder/${wf.id}`} style={{ padding: "8px 16px", background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Recent Executions */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Recent Executions</h2>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "16px 0", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: 20, color: COLORS.textMuted }}>Loading logs...</div>
            ) : executions.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: COLORS.textMuted }}>No executions yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {executions.slice(0, 10).map((ex, i) => (
                  <Link key={ex.id} to={`/automation/logs/${ex.id}`} style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i === executions.length -1 ? "none" : `1px solid ${COLORS.border}`, textDecoration: "none", color: COLORS.text, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = COLORS.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {ex.status === 'completed' ? <CheckCircle size={18} color={COLORS.success} /> : 
                       ex.status === 'failed' ? <XCircle size={18} color={COLORS.danger} /> : 
                       <Clock size={18} color={COLORS.warning} />}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.workflow_name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{new Date(ex.started_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
