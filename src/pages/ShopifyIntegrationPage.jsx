import React, { useState, useEffect, useCallback } from "react";
import { 
  ShoppingBag, Server, Activity, Users, FileText, AlertTriangle, 
  CheckCircle, RefreshCw, Box, Plus, LogOut, ChevronRight, Zap, Target
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

// --- Design System Tokens & Components ---
const COLORS = {
  primary: "#6D28D9",
  primaryLight: "#F5F3FF",
  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#EA580C",
  warningLight: "#FFF7ED",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

const ghostBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  background: "#F1F5F9",
  color: "#374151",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  transition: "background 0.2s"
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 13,
  outline: "none",
  marginTop: 4,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: COLORS.textMuted,
  display: "block",
  marginTop: 12,
};

function KPICard({ label, count, icon: Icon, color, bg }) {
  return (
    <div style={{ flex: 1, minWidth: 160, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textMuted, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        <div style={{ padding: 6, background: bg, color: color, borderRadius: 8, display: "flex" }}>
          <Icon size={16} />
        </div>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text }}>{count}</div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    completed: { bg: COLORS.successLight, color: COLORS.success, label: "Completed" },
    active: { bg: COLORS.successLight, color: COLORS.success, label: "Connected" },
    running: { bg: COLORS.warningLight, color: COLORS.warning, label: "Syncing" },
    processing: { bg: COLORS.primaryLight, color: COLORS.primary, label: "Processing" },
    failed: { bg: COLORS.dangerLight, color: COLORS.danger, label: "Failed" },
    inactive: { bg: COLORS.dangerLight, color: COLORS.danger, label: "Disconnected" },
    error: { bg: COLORS.dangerLight, color: COLORS.danger, label: "Error" },
  };
  const config = map[status.toLowerCase()] || { bg: "#F1F5F9", color: "#64748B", label: status };

  return (
    <span style={{ background: config.bg, color: config.color, padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {config.label}
    </span>
  );
}

function SimpleModal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 450, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800, color: COLORS.text }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function ShopifyIntegrationPage() {
  const { hasPermission } = useAuth();
  
  const [stores, setStores] = useState([]);
  const [brands, setBrands] = useState([]);
  const [logs, setLogs] = useState([]);
  const [queueStats, setQueueStats] = useState({ pending: 0, processing: 0, completed: 0, failed: 0 });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ brand_id: "", store_url: "", clientId: "", clientSecret: "", webhook_secret: "" });
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [stRes, brRes] = await Promise.all([
        api.shopify.getStores(),
        api.listBrands()
      ]);
      setStores(stRes.stores || []);
      setBrands(brRes.brands || []);
      
      if (stRes.stores && stRes.stores.length > 0 && !selectedStoreId) {
        setSelectedStoreId(stRes.stores[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (selectedStoreId) {
      fetchLogs(selectedStoreId);
      const interval = setInterval(() => fetchLogs(selectedStoreId), 10000); // Polling logs & queue
      return () => clearInterval(interval);
    }
  }, [selectedStoreId]);

  const fetchLogs = async (storeId) => {
    try {
      const res = await api.shopify.getLogs(storeId);
      setLogs(res.logs || []);
      setQueueStats(res.queueStats || { pending: 0, processing: 0, completed: 0, failed: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.shopify.connectStore(formData);
      setShowAddModal(false);
      setFormData({ brand_id: "", store_url: "", clientId: "", clientSecret: "", webhook_secret: "" });
      await loadAll();
    } catch (err) {
      alert(err.message || "Failed to connect store");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSync = async (entityType) => {
    if (!selectedStoreId) return;
    try {
      await api.shopify.startBulkImport({ store_id: selectedStoreId, entity_type: entityType });
      fetchLogs(selectedStoreId);
      setActiveTab("logs");
    } catch (err) {
      alert("Failed to start sync: " + (err.message || "Unknown error"));
    }
  };

  // Aggregate Metrics
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.is_active).length;
  
  let customersSynced = 0, ordersSynced = 0, productsSynced = 0, failedEvents = queueStats.failed || 0;
  logs.forEach(log => {
    if (log.status === "completed") {
      if (log.sync_type === "customers") customersSynced += log.records_processed;
      if (log.sync_type === "orders") ordersSynced += log.records_processed;
      if (log.sync_type === "products") productsSynced += log.records_processed;
    }
    failedEvents += (log.records_failed || 0);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg, overflow: "hidden" }}>
      
      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingBag size={20} color={COLORS.primary} /> Shopify Integration Center
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, color: COLORS.textMuted, marginTop: 4 }}>
              Manage commerce data syncing and background webhook operations.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { loadAll(); if(selectedStoreId) fetchLogs(selectedStoreId); }} style={ghostBtn}>
              <RefreshCw size={14} /> Refresh
            </button>
            {hasPermission("settings", "modify") && (
              <button 
                onClick={() => setShowAddModal(true)} 
                style={{ ...ghostBtn, background: "linear-gradient(135deg, #6D28D9, #4F46E5)", color: "#fff" }}
              >
                <Plus size={14} /> Connect Store
              </button>
            )}
          </div>
        </div>

        {/* KPI Strip */}
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          <KPICard label="Connected Stores" count={`${activeStores} / ${totalStores}`} icon={Server} color={COLORS.primary} bg={COLORS.primaryLight} />
          <KPICard label="Customers Synced" count={customersSynced} icon={Users} color={COLORS.success} bg={COLORS.successLight} />
          <KPICard label="Orders Synced" count={ordersSynced} icon={ShoppingBag} color={COLORS.primary} bg={COLORS.primaryLight} />
          <KPICard label="Products Synced" count={productsSynced} icon={Box} color={COLORS.success} bg={COLORS.successLight} />
          <KPICard label="Failed Events" count={failedEvents} icon={AlertTriangle} color={COLORS.danger} bg={COLORS.dangerLight} />
          <KPICard label="Webhook Queue" count={queueStats.pending + queueStats.processing} icon={Activity} color={COLORS.warning} bg={COLORS.warningLight} />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left Sidebar - Stores List */}
        <div style={{ width: 280, background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.text }}>Your Stores</h3>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {stores.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.textMuted }}>
                <Server size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>No stores connected</div>
              </div>
            ) : (
              stores.map(store => {
                const isSel = selectedStoreId === store.id;
                return (
                  <div 
                    key={store.id} 
                    onClick={() => setSelectedStoreId(store.id)}
                    style={{
                      padding: 14, borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                      border: `1px solid ${isSel ? COLORS.primary : COLORS.border}`,
                      background: isSel ? COLORS.primaryLight : COLORS.card,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: isSel ? COLORS.primary : COLORS.text }}>{store.brand_name}</span>
                      <Badge status={store.is_active ? "active" : "inactive"} />
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, wordBreak: "break-all" }}>{store.store_url}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
          
          {selectedStoreId ? (
            <>
              {/* Tab Navigation */}
              <div style={{ display: "flex", gap: 24, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
                {[
                  { id: "overview", label: "Health & Overview" },
                  { id: "operations", label: "Sync Operations" },
                  { id: "logs", label: "Sync Logs" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: "none", border: "none", padding: "0 0 12px 0", cursor: "pointer",
                      fontSize: 14, fontWeight: 700,
                      color: activeTab === tab.id ? COLORS.primary : COLORS.textMuted,
                      borderBottom: activeTab === tab.id ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  
                  {/* Integration Health Card */}
                  <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
                      <Activity size={16} color={COLORS.primary}/> Integration Health
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: `1px dashed ${COLORS.border}` }}>
                        <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>API Status</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: COLORS.success }}><CheckCircle size={14} /> Operational</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: `1px dashed ${COLORS.border}` }}>
                        <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>Webhook Listener</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: COLORS.success }}><CheckCircle size={14} /> Active</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: `1px dashed ${COLORS.border}` }}>
                        <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>Rate Limit Status</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Healthy (GraphQL Bulk Allowed)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>Last Successful Sync</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{logs.length > 0 ? new Date(logs[0].completed_at || logs[0].started_at).toLocaleString() : "Never"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Queue Status Card */}
                  <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
                      <Zap size={16} color={COLORS.warning}/> Webhook Queue Status
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: COLORS.bg, padding: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>Pending</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginTop: 4 }}>{queueStats.pending}</div>
                      </div>
                      <div style={{ background: COLORS.primaryLight, padding: 12, borderRadius: 8, border: `1px solid ${COLORS.primary}44` }}>
                        <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>Processing</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.primary, marginTop: 4 }}>{queueStats.processing}</div>
                      </div>
                      <div style={{ background: COLORS.successLight, padding: 12, borderRadius: 8, border: `1px solid ${COLORS.success}44` }}>
                        <div style={{ fontSize: 12, color: COLORS.success, fontWeight: 600 }}>Completed</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.success, marginTop: 4 }}>{queueStats.completed}</div>
                      </div>
                      <div style={{ background: COLORS.dangerLight, padding: 12, borderRadius: 8, border: `1px solid ${COLORS.danger}44` }}>
                        <div style={{ fontSize: 12, color: COLORS.danger, fontWeight: 600 }}>Failed</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.danger, marginTop: 4 }}>{queueStats.failed}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "operations" && (
                <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0" }}>Historical Bulk Synchronization</h3>
                  <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 24px 0" }}>
                    Trigger large-scale historical imports. This uses Shopify's asynchronous GraphQL Bulk Operations API to bypass standard rate limits.
                  </p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                      <div style={{ background: COLORS.successLight, color: COLORS.success, padding: 12, borderRadius: "50%", marginBottom: 12 }}><Users size={24} /></div>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700 }}>Customers</h4>
                      <p style={{ margin: "0 0 16px 0", fontSize: 12, color: COLORS.textMuted }}>Sync all historical customers.</p>
                      <button onClick={() => handleBulkSync("customers")} style={{ ...ghostBtn, width: "100%", justifyContent: "center", background: COLORS.text, color: "#fff" }}>Start Sync</button>
                    </div>

                    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                      <div style={{ background: COLORS.primaryLight, color: COLORS.primary, padding: 12, borderRadius: "50%", marginBottom: 12 }}><ShoppingBag size={24} /></div>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700 }}>Orders</h4>
                      <p style={{ margin: "0 0 16px 0", fontSize: 12, color: COLORS.textMuted }}>Sync order history & timeline.</p>
                      <button onClick={() => handleBulkSync("orders")} style={{ ...ghostBtn, width: "100%", justifyContent: "center", background: COLORS.text, color: "#fff" }}>Start Sync</button>
                    </div>

                    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                      <div style={{ background: COLORS.warningLight, color: COLORS.warning, padding: 12, borderRadius: "50%", marginBottom: 12 }}><Box size={24} /></div>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700 }}>Products</h4>
                      <p style={{ margin: "0 0 16px 0", fontSize: 12, color: COLORS.textMuted }}>Sync catalog and variants.</p>
                      <button onClick={() => handleBulkSync("products")} style={{ ...ghostBtn, width: "100%", justifyContent: "center", background: COLORS.text, color: "#fff" }}>Start Sync</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "logs" && (
                <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, textAlign: "left" }}>
                        <th style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted }}>Date / Time</th>
                        <th style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted }}>Entity</th>
                        <th style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted }}>Status</th>
                        <th style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted }}>Metrics</th>
                        <th style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: COLORS.textMuted }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: 40, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No logs available for this store.</td></tr>
                      ) : (
                        logs.map(log => (
                          <tr key={log.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.text }}>{new Date(log.started_at).toLocaleString()}</td>
                            <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: COLORS.text, textTransform: "capitalize" }}>{log.sync_type}</td>
                            <td style={{ padding: "14px 20px" }}><Badge status={log.status} /></td>
                            <td style={{ padding: "14px 20px", fontSize: 12 }}>
                              <div style={{ color: COLORS.success, fontWeight: 600 }}>{log.records_processed || 0} Processed</div>
                              {log.records_failed > 0 && <div style={{ color: COLORS.danger, fontWeight: 600 }}>{log.records_failed} Failed</div>}
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: 12, color: COLORS.textMuted, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {log.error_message || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: COLORS.textMuted }}>
              <Server size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h2 style={{ margin: "0 0 8px 0", fontSize: 18, color: COLORS.text }}>No Store Selected</h2>
              <p style={{ margin: 0, fontSize: 14 }}>Select a store from the sidebar or connect a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Connect Store Modal */}
      {showAddModal && (
        <SimpleModal title="Connect Shopify Store" onClose={() => !loading && setShowAddModal(false)}>
          <form onSubmit={handleConnect}>
            <div>
              <label style={labelStyle}>Target Brand</label>
              <select 
                required
                value={formData.brand_id} 
                onChange={e => setFormData({...formData, brand_id: e.target.value})}
                style={inputStyle}
              >
                <option value="">Select a brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Store URL</label>
              <input 
                type="text" 
                required
                placeholder="mystore.myshopify.com"
                value={formData.store_url}
                onChange={e => setFormData({...formData, store_url: e.target.value})}
                style={inputStyle}
              />
            </div>
            
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Shopify Client ID</label>
              <input 
                type="text" 
                required
                placeholder="Client ID from Shopify App"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Shopify Client Secret</label>
              <input 
                type="password" 
                required
                placeholder="Client Secret from Shopify App"
                value={formData.clientSecret}
                onChange={e => setFormData({...formData, clientSecret: e.target.value})}
                style={inputStyle}
              />
              <p style={{ margin: "4px 0 0 0", fontSize: 11, color: COLORS.textMuted }}>Uses Shopify Client Credentials authentication. The Shopify app must be installed on the store and belong to the same Shopify organization.</p>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Store Webhook Secret (Optional)</label>
              <input 
                type="password" 
                placeholder="Only required if creating webhooks manually in Shopify Admin (starts with whsec_)"
                value={formData.webhook_secret}
                onChange={e => setFormData({...formData, webhook_secret: e.target.value})}
                style={inputStyle}
              />
              <p style={{ margin: "4px 0 0 0", fontSize: 11, color: COLORS.textMuted }}>If you create webhooks manually in Shopify Admin, paste the secret here. Webhooks created via API will automatically use your Client Secret.</p>
            </div>
            

            
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                style={{ flex: 1, padding: "10px", background: COLORS.bg, color: COLORS.text, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ flex: 1, padding: "10px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Connecting..." : "Connect Store"}
              </button>
            </div>
          </form>
        </SimpleModal>
      )}

    </div>
  );
}
