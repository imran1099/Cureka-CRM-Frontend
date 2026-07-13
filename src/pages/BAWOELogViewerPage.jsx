import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Activity, ArrowLeft, CheckCircle, XCircle, Clock, Server } from "lucide-react";
import { api } from "../lib/api";

const COLORS = {
  primary: "#6366F1",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B"
};

export default function BAWOELogViewerPage() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bawoe.getLogs(id).then(res => {
      setLogs(res.logs || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: COLORS.textMuted }}>Loading execution trace...</div>;

  return (
    <div style={{ padding: "32px 40px", height: "100%", background: COLORS.bg, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link to="/automation" style={{ color: COLORS.textMuted, textDecoration: "none" }}>
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 12 }}>
            <Activity size={28} color={COLORS.primary} /> Execution Trace
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: COLORS.textMuted }}>
            Execution ID: {id}
          </p>
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
        {logs.length === 0 ? (
          <div style={{ color: COLORS.textMuted }}>No logs found for this execution.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {logs.map((log, index) => (
              <div key={log.id} style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24 }}>
                  {log.status === 'success' ? <CheckCircle size={24} color={COLORS.success} /> : 
                   log.status === 'error' ? <XCircle size={24} color={COLORS.danger} /> : 
                   <Clock size={24} color={COLORS.warning} />}
                  {index < logs.length - 1 && <div style={{ width: 2, height: "100%", background: COLORS.border, marginTop: 4 }}></div>}
                </div>
                
                <div style={{ flex: 1, paddingBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>Node ID: {log.node_id}</span>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  
                  {log.error_message ? (
                    <div style={{ background: "#FEF2F2", color: COLORS.danger, padding: 12, borderRadius: 8, fontSize: 13, border: `1px solid #FCA5A5` }}>
                      {log.error_message}
                    </div>
                  ) : (
                    <div style={{ background: COLORS.bg, padding: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                        <Server size={12} /> Output Payload
                      </div>
                      <pre style={{ margin: 0, fontSize: 12, color: COLORS.text, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                        {JSON.stringify(JSON.parse(log.output_data), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
