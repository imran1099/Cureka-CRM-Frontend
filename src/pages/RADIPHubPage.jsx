import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart2, Plus, Search, FileText, ChevronRight, Lock } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6D28D9",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

export default function RADIPHubPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.radip.getReports()
      .then(res => {
        if (mounted) {
          setReports(res.reports || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filteredReports.map(r => r.category))];

  return (
    <div style={{ padding: "32px 40px", height: "100%", background: COLORS.bg, overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 12 }}>
            <BarChart2 size={28} color={COLORS.primary} /> Reports & Analytics
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: COLORS.textMuted }}>
            Enterprise Decision Intelligence Platform (RADIP)
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} color={COLORS.textMuted} style={{ position: "absolute", left: 12, top: 10 }} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 16px 8px 36px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, width: 250, outline: "none" }}
            />
          </div>
          <button 
            onClick={() => navigate("/radip/builder")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            <Plus size={16} /> Custom Report
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Loading reports...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {categories.map(category => (
            <div key={category}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: COLORS.text, borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 8 }}>
                {category}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {filteredReports.filter(r => r.category === category).map(report => (
                  <Link 
                    key={report.id}
                    to={`/radip/viewer/${report.id}`}
                    style={{
                      background: COLORS.card,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 12,
                      padding: 20,
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: COLORS.primary, transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(109,40,217,0.08)" })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: COLORS.border, transform: "none", boxShadow: "none" })}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.primary, fontWeight: 700, fontSize: 14 }}>
                        <FileText size={18} /> {report.name}
                      </div>
                      {report.type === 'custom' && <span style={{ fontSize: 10, background: "#FEFCE8", color: "#CA8A04", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>CUSTOM</span>}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, flex: 1 }}>
                      {report.description}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", color: COLORS.textMuted }}>
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {filteredReports.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: COLORS.textMuted }}>No reports found.</div>
          )}
        </div>
      )}
    </div>
  );
}
