import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Clock, Filter, FileText } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6D28D9",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

export default function RADIPViewerPage() {
  const { id } = useParams();
  const [reportMeta, setReportMeta] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date_range: "30d", brand_id: "" });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadReport = async () => {
      setLoading(true);
      try {
        const metaRes = await api.radip.getReports();
        const meta = (metaRes.reports || []).find(r => r.id === id);
        if (mounted && meta) setReportMeta(meta);

        const execRes = await api.radip.executeReport(id, { filters });
        if (mounted) setData(execRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadReport();
    return () => { mounted = false; };
  }, [id, filters]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.radip.exportReport(id, { filters, format: 'csv' });
      if (res.exportData) {
        const blob = new Blob([res.exportData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportMeta?.name.replace(/\\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const handleSchedule = async () => {
    const email = prompt("Enter email to receive this report daily:");
    if (!email) return;
    try {
      await api.radip.scheduleReport({ report_id: id, frequency: "daily", format: "csv", recipients: [email] });
      alert("Report scheduled successfully!");
    } catch (err) {
      alert("Failed to schedule report");
    }
  };

  if (loading && !reportMeta) return <div style={{ padding: 40, color: COLORS.textMuted }}>Loading report...</div>;
  if (!reportMeta) return <div style={{ padding: 40, color: "red" }}>Report not found.</div>;

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg }}>
      
      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link to="/radip" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: COLORS.textMuted, textDecoration: "none", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Hub
          </Link>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={20} color={COLORS.primary} /> {reportMeta.name}
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: COLORS.textMuted }}>{reportMeta.description}</p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSchedule} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Clock size={14} /> Schedule
          </button>
          <button onClick={handleExport} disabled={exporting || data.length === 0} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: (exporting || data.length===0) ? "not-allowed" : "pointer", opacity: (exporting || data.length===0) ? 0.7 : 1 }}>
            <Download size={14} /> {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 32px", display: "flex", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>
          <Filter size={14} /> Filters:
        </div>
        <select value={filters.date_range} onChange={e => setFilters({...filters, date_range: e.target.value})} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}>
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
        <select value={filters.brand_id} onChange={e => setFilters({...filters, brand_id: e.target.value})} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }}>
          <option value="">All Brands</option>
          <option value="brd_cureka">Cureka</option>
          <option value="brd_healthetc">Healthetc</option>
          <option value="brd_tghc">TGHC</option>
        </select>
      </div>

      {/* Data Table */}
      <div style={{ flex: 1, padding: 32, overflow: "hidden" }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {loading ? (
             <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Executing query...</div>
          ) : data.length === 0 ? (
             <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>No data found for the selected filters.</div>
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
                  {data.map((row, i) => (
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
