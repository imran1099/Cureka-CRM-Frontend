import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { ShieldAlert, Fingerprint, Activity, Clock, ShieldCheck, Search, Users, Shield, Server, Filter } from "lucide-react";

export default function ESCAMSConsolePage() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("logs");
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Create a centralized fetch call for security logs
      const res = await fetch("http://localhost:3000/api/audit/security", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Access Denied");
      const data = await res.json();
      setLogs(data.logs || []);
      setAlerts(data.alerts || []);
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const terminateSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to terminate this active session? The user will be logged out immediately.")) return;
    try {
      await fetch(`http://localhost:3000/api/audit/sessions/${sessionId}/terminate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchSecurityData();
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityColor = (sev) => {
    if (sev === "CRITICAL") return "var(--coral)";
    if (sev === "HIGH") return "var(--amber)";
    if (sev === "MEDIUM") return "var(--yellow)";
    return "var(--teal)";
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-light)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px 0", color: "var(--ink)" }}>Security & Audit Console</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--slate)" }}>Monitor system access, review audit logs, and manage active sessions.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[{ id: "logs", label: "Audit Logs", icon: Fingerprint, count: logs.length },
          { id: "alerts", label: "Security Alerts", icon: ShieldAlert, count: alerts.length },
          { id: "sessions", label: "Active Sessions", icon: Users, count: sessions.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
              border: activeTab === t.id ? "1px solid var(--teal)" : "1px solid var(--card-border)",
              background: activeTab === t.id ? "var(--teal-light)" : "#fff",
              color: activeTab === t.id ? "var(--teal)" : "var(--slate)",
              cursor: "pointer"
            }}
          >
            <t.icon size={16} />
            {t.label}
            {t.count > 0 && <span style={{ background: activeTab === t.id ? "var(--teal)" : "var(--bg)", color: activeTab === t.id ? "#fff" : "var(--muted)", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* Header Bar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg-wash)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid var(--slate-border)", borderRadius: 8, padding: "8px 12px", width: 300 }}>
            <Search size={16} color="var(--muted)" />
            <input type="text" placeholder="Search logs..." style={{ border: "none", outline: "none", width: "100%", fontSize: 13 }} />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid var(--slate-border)", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--slate)" }}>
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading security data...</div>
          ) : activeTab === "logs" ? (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--bg)", fontSize: 11, color: "var(--slate)", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>Timestamp</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>User</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>Module</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>Action</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No audit logs found.</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--card-border)", fontSize: 13 }}>
                      <td style={{ padding: "12px 20px", color: "var(--muted)" }}>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", fontWeight: 600, color: "var(--ink)" }}>{log.user_name} <span style={{ fontSize: 11, color: "var(--slate)", marginLeft: 6 }}>({log.role})</span></td>
                      <td style={{ padding: "12px 20px", color: "var(--slate)" }}>{log.module}</td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{ background: "var(--bg)", padding: "4px 8px", borderRadius: 6, fontWeight: 600, fontSize: 11 }}>{log.action}</span>
                      </td>
                      <td style={{ padding: "12px 20px", color: "var(--slate)" }}>{log.ip_address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : activeTab === "alerts" ? (
             <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>No security alerts.</div>
                ) : (
                  alerts.map(alt => (
                    <div key={alt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "#fff", border: `1px solid ${getSeverityColor(alt.severity)}`, borderRadius: 10, borderLeft: `4px solid ${getSeverityColor(alt.severity)}` }}>
                       <div>
                         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                           <span style={{ fontSize: 11, fontWeight: 800, color: getSeverityColor(alt.severity) }}>{alt.severity}</span>
                           <span style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(alt.created_at).toLocaleString()}</span>
                         </div>
                         <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{alt.message}</div>
                       </div>
                       <button style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--card-border)", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Resolve</button>
                    </div>
                  ))
                )}
             </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--bg)", fontSize: 11, color: "var(--slate)", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>User ID</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>Login Time</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>Device / IP</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "12px 20px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No sessions found.</td></tr>
                ) : (
                  sessions.map(sess => (
                    <tr key={sess.id} style={{ borderBottom: "1px solid var(--card-border)", fontSize: 13 }}>
                      <td style={{ padding: "12px 20px", fontWeight: 600, color: "var(--ink)" }}>{sess.user_id}</td>
                      <td style={{ padding: "12px 20px", color: "var(--muted)" }}>{new Date(sess.login_time).toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", color: "var(--slate)" }}>
                        <div style={{ fontSize: 11 }}>{sess.ip_address}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={sess.device}>{sess.device}</div>
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: sess.status === 'ACTIVE' ? "var(--teal-light)" : "var(--bg)", color: sess.status === 'ACTIVE' ? "var(--teal)" : "var(--muted)" }}>
                          {sess.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right" }}>
                        {sess.status === 'ACTIVE' && (
                          <button onClick={() => terminateSession(sess.id)} style={{ padding: "6px 12px", borderRadius: 6, background: "var(--coral-light)", color: "var(--coral)", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Terminate</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
