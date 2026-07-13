import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Filter, Star } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6D28D9",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  gold: "#F59E0B",
  silver: "#94A3B8",
  bronze: "#B45309",
};

export default function PIKFLeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.pikf.getLeaderboards(brandFilter)
      .then(res => {
        if (mounted) {
          setLeaders(res.leaders || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [brandFilter]);

  return (
    <div style={{ padding: "32px 40px", height: "100%", background: COLORS.bg, overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 12 }}>
            <Trophy size={28} color={COLORS.gold} /> Global Leaderboard
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: COLORS.textMuted }}>
            Top performers based on aggregated Performance Score.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>
            <Filter size={14} /> Filter by Brand:
          </div>
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", background: COLORS.card }}>
            <option value="">All Brands</option>
            <option value="brd_cureka">Cureka</option>
            <option value="brd_healthetc">Healthetc</option>
            <option value="brd_tghc">TGHC</option>
          </select>
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Loading ranks...</div>
        ) : leaders.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>No data available.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
              <tr>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", width: 80 }}>Rank</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>Agent</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase" }}>Brand</th>
                <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", textAlign: "right" }}>Perf Score</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, i) => {
                const rank = i + 1;
                let rankVisual = <span style={{ fontWeight: 800, color: COLORS.textMuted }}>#{rank}</span>;
                if (rank === 1) rankVisual = <Star size={20} color={COLORS.gold} fill={COLORS.gold} />;
                else if (rank === 2) rankVisual = <Star size={18} color={COLORS.silver} fill={COLORS.silver} />;
                else if (rank === 3) rankVisual = <Star size={18} color={COLORS.bronze} fill={COLORS.bronze} />;

                return (
                  <tr key={leader.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = COLORS.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>{rankVisual}</td>
                    <td style={{ padding: "16px 24px", fontWeight: rank <= 3 ? 800 : 600, color: COLORS.text }}>
                      {leader.name}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 13, color: COLORS.textMuted }}>
                      {leader.brand_id === 'brd_cureka' ? 'Cureka' : leader.brand_id === 'brd_healthetc' ? 'Healthetc' : leader.brand_id === 'brd_tghc' ? 'TGHC' : leader.brand_id}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 800, color: COLORS.primary, fontSize: 16 }}>
                      {leader.score.toFixed(1)}
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
