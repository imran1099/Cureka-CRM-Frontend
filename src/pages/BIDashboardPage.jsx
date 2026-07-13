import React, { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, RefreshCw, Calendar, Sparkles, Filter 
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import BIWidget from "../components/BIWidget.jsx";

const COLORS = {
  primary: "#6D28D9",
  primaryLight: "#F5F3FF",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

export default function BIDashboardPage() {
  const { user } = useAuth();
  
  const [dashboard, setDashboard] = useState(null);
  const [widgetData, setWidgetData] = useState({});
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Global Filters
  const [filters, setFilters] = useState({
    date_range: "today",
    brand_id: "",
  });

  const loadDashboard = useCallback(async () => {
    try {
      const res = await api.bi.getDashboard();
      if (res.dashboard) {
        setDashboard(res.dashboard);
        return res.dashboard;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  }, []);

  const loadData = useCallback(async (dash) => {
    if (!dash || !dash.widgets) return;
    setLoading(true);
    try {
      const widgetPayload = dash.widgets.map(w => ({ id: w.id, kpi_id: w.kpi_id }));
      const [dataRes, insightsRes] = await Promise.all([
        api.bi.getWidgetData({ widgets: widgetPayload, filters }),
        api.bi.getInsights({ filters })
      ]);
      setWidgetData(dataRes.data || {});
      setInsights(insightsRes.insights || []);
    } catch (err) {
      console.error("Failed to load widget data", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    loadDashboard().then(dash => {
      if (mounted) loadData(dash);
    });
    return () => { mounted = false; };
  }, []);

  // Filter change load
  useEffect(() => {
    if (dashboard) {
      loadData(dashboard);
    }
  }, [filters]);

  if (!dashboard) {
    return <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Loading BI Dashboard...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg, overflow: "hidden" }}>
      
      {/* Header & Filter Bar */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "20px 32px", flexShrink: 0 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 10 }}>
              <LayoutDashboard size={24} color={COLORS.primary} /> {dashboard.name}
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: COLORS.textMuted }}>
              Enterprise Intelligence & Operational Command
            </p>
          </div>
          
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => loadData(dashboard)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Global Filters */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "6px 12px", borderRadius: 8 }}>
            <Calendar size={14} color={COLORS.textMuted} />
            <select 
              value={filters.date_range} 
              onChange={e => setFilters({...filters, date_range: e.target.value})}
              style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: COLORS.text, cursor: "pointer" }}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "6px 12px", borderRadius: 8 }}>
            <Filter size={14} color={COLORS.textMuted} />
            <select 
              value={filters.brand_id} 
              onChange={e => setFilters({...filters, brand_id: e.target.value})}
              style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: COLORS.text, cursor: "pointer" }}
            >
              <option value="">All Brands</option>
              <option value="brd_cureka">Cureka</option>
              <option value="brd_healthetc">Healthetc</option>
              <option value="brd_tghc">TGHC</option>
            </select>
          </div>
        </div>
        
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        
        {/* AI Insights Bar */}
        {insights.length > 0 && (
          <div style={{ background: "linear-gradient(135deg, #F5F3FF, #fff)", border: "1px solid #DDD6FE", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ padding: 8, background: COLORS.primary, color: "#fff", borderRadius: 8 }}><Sparkles size={18} /></div>
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 800, color: COLORS.primary }}>Executive Insights</h4>
              <ul style={{ margin: 0, paddingLeft: 20, color: COLORS.text, fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                {insights.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Dynamic Grid Layout */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(4, 1fr)", 
          gridAutoRows: "minmax(140px, auto)", 
          gap: 20 
        }}>
          {dashboard.widgets.map(w => {
            const data = widgetData[w.id];
            return (
              <div 
                key={w.id} 
                style={{ 
                  gridColumn: `span ${w.grid_w}`, 
                  gridRow: `span ${w.grid_h}`,
                  opacity: loading && !data ? 0.5 : 1,
                  transition: "opacity 0.2s"
                }}
              >
                <BIWidget config={w} data={data} />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
