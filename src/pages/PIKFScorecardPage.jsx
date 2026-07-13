import React, { useState, useEffect } from "react";
import { Award, Target, AlertCircle, TrendingUp } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6D28D9",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export default function PIKFScorecardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.pikf.getMyScore()
      .then(res => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 40, color: COLORS.textMuted }}>Loading Performance Scorecard...</div>;
  if (!data) return <div style={{ padding: 40, color: COLORS.danger }}>Failed to load scorecard.</div>;

  const score = data.score || 0;
  let scoreColor = COLORS.danger;
  let scoreLabel = "Critical";
  if (score >= 90) { scoreColor = COLORS.success; scoreLabel = "Excellent"; }
  else if (score >= 75) { scoreColor = COLORS.primary; scoreLabel = "Good"; }
  else if (score >= 60) { scoreColor = COLORS.warning; scoreLabel = "Needs Improvement"; }

  const breakdown = data.breakdown || {};
  const badges = data.badges || [];
  const coaching = data.coaching || [];

  return (
    <div style={{ padding: "32px 40px", height: "100%", background: COLORS.bg, overflowY: "auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 12 }}>
          <Target size={28} color={COLORS.primary} /> My Performance Scorecard
        </h1>
        <p style={{ margin: "4px 0 0 0", fontSize: 14, color: COLORS.textMuted }}>
          Your consolidated performance view for the current period.
        </p>
      </div>

      {coaching.length > 0 && (
        <div style={{ background: "#FEF2F2", border: `1px solid ${COLORS.danger}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.danger, fontWeight: 700, marginBottom: 8 }}>
            <AlertCircle size={18} /> Action Required: Coaching Alert
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#991B1B", fontSize: 13, lineHeight: 1.6 }}>
            {coaching.map((c, i) => (
              <li key={i}>{c.reason} (Assigned: {new Date(c.created_at).toLocaleDateString()})</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginBottom: 24 }}>
        
        {/* Score Gauge */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted, marginBottom: 16 }}>Overall Score</div>
          <div style={{ width: 160, height: 160, borderRadius: "50%", border: `8px solid ${scoreColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>{score.toFixed(0)}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted }}>/ 100</div>
          </div>
          <div style={{ marginTop: 24, padding: "6px 16px", borderRadius: 20, background: `${scoreColor}15`, color: scoreColor, fontWeight: 800, fontSize: 14 }}>
            {scoreLabel}
          </div>
        </div>

        {/* KPI Breakdown */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 800, color: COLORS.text }}>KPI Target Progress</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(breakdown).map(([kpiId, kpiData]) => {
              const achievement = kpiData.target ? Math.min(100, (kpiData.actual / kpiData.target) * 100) : 100;
              return (
                <div key={kpiId}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                      {kpiId.replace('kpi_', '').toUpperCase()} (Weight: {kpiData.weight}%)
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary }}>
                      {kpiData.actual} {kpiData.target && `/ ${kpiData.target}`}
                    </span>
                  </div>
                  <div style={{ width: "100%", background: COLORS.bg, borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${achievement}%`, height: "100%", background: achievement >= 100 ? COLORS.success : COLORS.primary, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gamification / Badges */}
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
          <Award size={18} color={COLORS.warning} /> My Trophy Case
        </h3>
        {badges.length === 0 ? (
          <div style={{ color: COLORS.textMuted, fontSize: 14, fontStyle: "italic" }}>No badges earned yet. Keep hitting those targets!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {badges.map((badge, i) => (
              <div key={i} style={{ padding: 16, border: `1px solid ${COLORS.border}`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Award size={20} color={COLORS.warning} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{badge.badge_name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4, lineHeight: 1.4 }}>{badge.reason}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8, opacity: 0.7 }}>Earned: {new Date(badge.awarded_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
