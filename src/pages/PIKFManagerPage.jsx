import React, { useState, useEffect } from "react";
import { Users, Target, Award, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6D28D9",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  success: "#10B981",
  danger: "#EF4444",
};

export default function PIKFManagerPage() {
  const [teamScores, setTeamScores] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Target Form State
  const [targetForm, setTargetForm] = useState({
    kpi_id: "",
    target_entity_id: "",
    target_value: ""
  });

  // Badge Form State
  const [badgeForm, setBadgeForm] = useState({
    agent_id: "",
    badge_name: "",
    reason: ""
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.pikf.getTeamPerformance(),
      api.pikf.getDefinitions()
    ]).then(([teamRes, defsRes]) => {
      if (mounted) {
        setTeamScores(teamRes.teamScores || []);
        setKpis(defsRes.kpis || []);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleSetTarget = async (e) => {
    e.preventDefault();
    if (!targetForm.kpi_id || !targetForm.target_entity_id || !targetForm.target_value) return alert("Fill all fields");
    try {
      await api.pikf.setTarget({ ...targetForm, target_type: 'individual', period: 'monthly' });
      alert("Target set successfully");
      setTargetForm({ kpi_id: "", target_entity_id: "", target_value: "" });
    } catch (err) {
      alert("Failed to set target");
    }
  };

  const handleAwardBadge = async (e) => {
    e.preventDefault();
    if (!badgeForm.agent_id || !badgeForm.badge_name || !badgeForm.reason) return alert("Fill all fields");
    try {
      await api.pikf.awardManualBadge(badgeForm);
      alert("Badge awarded!");
      setBadgeForm({ agent_id: "", badge_name: "", reason: "" });
    } catch (err) {
      alert("Failed to award badge");
    }
  };

  return (
    <div style={{ padding: "32px 40px", height: "100%", background: COLORS.bg, overflowY: "auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 12 }}>
          <Users size={28} color={COLORS.primary} /> Team Performance Center
        </h1>
        <p style={{ margin: "4px 0 0 0", fontSize: 14, color: COLORS.textMuted }}>
          Monitor team KPIs, set targets, and manage Gamification.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        
        {/* Set Target Form */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={18} color={COLORS.primary} /> Assign Monthly Target
          </h3>
          <form onSubmit={handleSetTarget} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <select value={targetForm.target_entity_id} onChange={e => setTargetForm({...targetForm, target_entity_id: e.target.value})} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}>
              <option value="">Select Agent</option>
              {teamScores.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={targetForm.kpi_id} onChange={e => setTargetForm({...targetForm, kpi_id: e.target.value})} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}>
              <option value="">Select KPI</option>
              {kpis.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            <input type="number" placeholder="Target Value (e.g. 15000)" value={targetForm.target_value} onChange={e => setTargetForm({...targetForm, target_value: e.target.value})} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }} />
            <button type="submit" style={{ padding: "10px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Set Target</button>
          </form>
        </div>

        {/* Award Manual Badge */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} color={COLORS.primary} /> Award Manual Badge
          </h3>
          <form onSubmit={handleAwardBadge} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <select value={badgeForm.agent_id} onChange={e => setBadgeForm({...badgeForm, agent_id: e.target.value})} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}>
              <option value="">Select Agent</option>
              {teamScores.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={badgeForm.badge_name} onChange={e => setBadgeForm({...badgeForm, badge_name: e.target.value})} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}>
              <option value="">Select Badge</option>
              <option value="Team Player">Team Player</option>
              <option value="Best Mentor">Best Mentor</option>
              <option value="Innovation Award">Innovation Award</option>
              <option value="Customer Appreciation">Customer Appreciation</option>
            </select>
            <input type="text" placeholder="Reason for award..." value={badgeForm.reason} onChange={e => setBadgeForm({...badgeForm, reason: e.target.value})} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }} />
            <button type="submit" style={{ padding: "10px", background: "#F59E0B", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Award Badge</button>
          </form>
        </div>

      </div>

      {/* Team Grid */}
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: COLORS.text }}>Team Analytics Grid</h3>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Loading team data...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
              <tr>
                <th style={{ padding: "16px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>Agent</th>
                <th style={{ padding: "16px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>Perf Score</th>
                <th style={{ padding: "16px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {teamScores.map(agent => {
                const score = agent.score || 0;
                return (
                  <tr key={agent.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "16px", fontWeight: 600, color: COLORS.text }}>{agent.name}</td>
                    <td style={{ padding: "16px", fontWeight: 800, color: COLORS.primary }}>{score.toFixed(1)}</td>
                    <td style={{ padding: "16px" }}>
                      {score < 60 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEF2F2", color: COLORS.danger, padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                          <AlertCircle size={14} /> Coaching Required
                        </span>
                      ) : score >= 90 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#ECFDF5", color: COLORS.success, padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                          Excellent
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F1F5F9", color: COLORS.textMuted, padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                          On Track
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
