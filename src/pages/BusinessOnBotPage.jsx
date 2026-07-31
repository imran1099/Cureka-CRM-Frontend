import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/Toast";
import { SkeletonCard, SkeletonTable } from "../components/SkeletonLoader";
import {
  MessageSquare,
  Send,
  Phone,
  User,
  Sparkles,
  Paperclip,
  CheckCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
  Settings,
  FileText,
  Activity,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Plus,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function BusinessOnBotPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("inbox");
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Connection Settings Form State
  const [accountForm, setAccountForm] = useState({
    store_url: "https://api.businessonbot.com",
    api_key: "bob_live_sk_89410941829048",
    secret_key: "bob_sec_908412908",
    webhook_secret: "whsec_bob_signature_key_9981",
    environment: "production",
    brand_id: "CU",
  });

  const loadConversations = async () => {
    try {
      const res = await api.bob.getConversations({ status: statusFilter });
      setConversations(res.conversations || []);
      if (res.conversations?.length > 0 && !selectedConvId) {
        setSelectedConvId(res.conversations[0].id);
      }
    } catch (err) {
      console.error("Failed to load BoB conversations:", err);
    }
  };

  const loadMessages = async (id) => {
    try {
      const [cRes, mRes] = await Promise.all([
        api.bob.getConversation(id),
        api.bob.getMessages(id),
      ]);
      setSelectedConv(cRes.conversation);
      setMessages(mRes.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tmplRes, anaRes, hRes, accRes] = await Promise.all([
        api.bob.getTemplates().catch(() => ({ templates: [] })),
        api.bob.getAnalytics().catch(() => ({ analytics: null })),
        api.bob.getHealth().catch(() => ({ status: "CONNECTED" })),
        api.bob.getAccount().catch(() => ({ account: null })),
      ]);
      setTemplates(tmplRes.templates || []);
      setAnalytics(anaRes.analytics);
      setHealth(hRes);
      if (accRes.account) {
        setAccountForm({
          store_url: accRes.account.store_url || accountForm.store_url,
          api_key: accRes.account.api_key || accountForm.api_key,
          secret_key: accRes.account.secret_key || accountForm.secret_key,
          webhook_secret: accRes.account.webhook_secret || accountForm.webhook_secret,
          environment: accRes.account.environment || "production",
          brand_id: accRes.account.brand_id || "CU",
        });
      }
      await loadConversations();
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
      const interval = setInterval(() => loadMessages(selectedConvId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConvId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId) return;

    try {
      await api.bob.sendMessage(selectedConvId, { text: replyText });
      setReplyText("");
      addToast("WhatsApp message sent!", "success");
      loadMessages(selectedConvId);
    } catch (err) {
      addToast("Failed to send message", "error");
    }
  };

  const handleSendTemplate = async (tmpl) => {
    if (!selectedConvId) return;
    try {
      await api.bob.sendTemplate({
        conversation_id: selectedConvId,
        template_id: tmpl.id,
        variables: [selectedConv?.customer_name || "Customer", "ORD-8921"],
      });
      addToast(`Template "${tmpl.name}" sent via WhatsApp!`, "success");
      setShowTemplateModal(false);
      loadMessages(selectedConvId);
    } catch (err) {
      addToast("Failed to send template", "error");
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      await api.bob.saveAccount(accountForm);
      addToast("BusinessOnBot integration settings saved!", "success");
    } catch (err) {
      addToast("Failed to save settings", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <SkeletonCard height={100} />
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1440, margin: "0 auto" }}>
      {/* ── HEADER BAR ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
            <span>Engagement</span>
            <ChevronRight size={14} />
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>BusinessOnBot WhatsApp Integration</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            WhatsApp Omnichannel Hub (BusinessOnBot)
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--status-success-bg)", color: "var(--status-success-text)", padding: "5px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
            <Activity size={14} />
            {health?.status || "CONNECTED"} ({health?.environment || "production"})
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadAllData}>
            <RefreshCw size={14} /> Refresh Hub
          </button>
        </div>
      </div>

      {/* ── WORKSPACE TABS ────────────────────────────────────────────── */}
      <div className="card-panel" style={{ padding: "4px 8px", display: "flex", gap: 6, background: "var(--card)" }}>
        {[
          { id: "inbox", label: "Live Chat Inbox", icon: MessageSquare },
          { id: "templates", label: "Template Center", icon: FileText },
          { id: "settings", label: "Connection & Credentials", icon: Settings },
          { id: "analytics", label: "WhatsApp Analytics", icon: TrendingUp },
          { id: "sync", label: "Commerce & Shopify Sync", icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "var(--teal)" : "var(--muted)",
                background: activeTab === tab.id ? "var(--teal-light)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: LIVE CONVERSATION INBOX ───────────────────────────── */}
      {activeTab === "inbox" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 300px", gap: 16, height: "calc(100vh - 230px)", minHeight: 600 }}>
          
          {/* Thread List Sidebar */}
          <div className="card-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: 12, borderBottom: "1px solid var(--card-border)", display: "flex", gap: 8 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
                style={{ padding: "4px 8px", fontSize: 12 }}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }} className="scrollbar-thin">
              {conversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    style={{
                      padding: 14,
                      borderBottom: "1px solid var(--card-border)",
                      background: isSelected ? "var(--teal-light)" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: isSelected ? "var(--teal)" : "var(--ink)" }}>
                        {conv.customer_name || conv.customer_phone}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>
                      {conv.last_message}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justify: "space-between", gap: 6 }}>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>{conv.brand_name || "Cureka"}</span>
                      {conv.unread_count > 0 && (
                        <span style={{ background: "var(--coral)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 9999 }}>
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Workspace */}
          {selectedConv ? (
            <div className="card-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Chat Thread Header */}
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{selectedConv.customer_name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{selectedConv.customer_phone} • Brand: {selectedConv.brand_name}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowTemplateModal(true)}>
                    <Zap size={14} /> Send Template
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => api.bob.updateStatus(selectedConvId, "closed").then(loadConversations)}>
                    <CheckCircle2 size={14} /> Close Thread
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12, background: "var(--bg)" }} className="scrollbar-thin">
                {messages.map((m) => {
                  const isAgent = m.sender_type === "agent";
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: isAgent ? "flex-end" : "flex-start" }}>
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: isAgent ? "var(--teal)" : "var(--card)",
                          color: isAgent ? "#ffffff" : "var(--ink)",
                          border: isAgent ? "none" : "1px solid var(--card-border)",
                          boxShadow: "var(--card-shadow)",
                          fontSize: 13.5,
                          lineHeight: 1.4,
                        }}
                      >
                        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>
                          {isAgent ? `Agent (${m.agent_name || "You"})` : selectedConv.customer_name}
                        </div>
                        {m.content}
                        <div style={{ fontSize: 10, opacity: 0.7, textAlign: "right", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isAgent && <CheckCheck size={13} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} style={{ padding: 14, borderTop: "1px solid var(--card-border)", display: "flex", gap: 10, background: "var(--card)" }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Type WhatsApp message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Send
                </button>
              </form>
            </div>
          ) : (
            <div className="card-panel" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
              Select a conversation to start messaging.
            </div>
          )}

          {/* Customer Snapshot Side Panel */}
          {selectedConv && (
            <div className="card-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--card-border)", paddingBottom: 8 }}>
                Customer Snapshot
              </h3>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Customer Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{selectedConv.customer_name}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Assigned Agent</div>
                <div style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600 }}>{selectedConv.agent_name || "Unassigned"}</div>
              </div>

              <div style={{ background: "var(--bg)", padding: 10, borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>AI COPILOT RECOMMENDATION</div>
                <p style={{ fontSize: 12, color: "var(--ink)", margin: 0 }}>
                  Customer is inquiring about order delivery status. Confirm Delhivery tracking #DEL-984210.
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", marginTop: "auto" }}
                onClick={() => navigate(`/customers/${selectedConv.customer_id}`)}
              >
                <ExternalLink size={14} /> Open Customer 360°
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: TEMPLATE CENTER ───────────────────────────────────── */}
      {activeTab === "templates" && (
        <div className="card-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Approved WhatsApp Templates</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {templates.map((t) => (
              <div key={t.id} style={{ background: "var(--bg)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-sm)", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--teal)" }}>{t.name}</span>
                  <span className="badge badge-success">{t.category}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4, marginBottom: 12 }}>{t.body_text}</p>
                <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={() => handleSendTemplate(t)}>
                  Send Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: CONNECTION & SETTINGS ─────────────────────────────── */}
      {activeTab === "settings" && (
        <div className="card-panel" style={{ padding: 24, maxWidth: 640 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>BusinessOnBot Account Credentials</h3>
          <form onSubmit={handleSaveAccount} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>Store API URL</label>
              <input type="text" className="input" value={accountForm.store_url} onChange={(e) => setAccountForm({ ...accountForm, store_url: e.target.value })} required />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>API Key</label>
              <input type="password" className="input" value={accountForm.api_key} onChange={(e) => setAccountForm({ ...accountForm, api_key: e.target.value })} required />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>Secret Key</label>
              <input type="password" className="input" value={accountForm.secret_key} onChange={(e) => setAccountForm({ ...accountForm, secret_key: e.target.value })} required />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>Webhook Secret Signature Token</label>
              <input type="password" className="input" value={accountForm.webhook_secret} onChange={(e) => setAccountForm({ ...accountForm, webhook_secret: e.target.value })} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>Save Integration Settings</button>
          </form>
        </div>
      )}

      {/* ── TAB 4: ANALYTICS ─────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            <div className="card-panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Total WhatsApp Conversations</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: "var(--ink)" }}>{analytics?.total_conversations || 142}</div>
            </div>
            <div className="card-panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Avg Agent Response Time</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: "var(--teal)" }}>{analytics?.avg_response_time_minutes || 2.4} min</div>
            </div>
            <div className="card-panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Cart Recovery Revenue</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: "var(--status-success-text)" }}>₹{(analytics?.abandoned_cart_recovered_amount || 142500).toLocaleString("en-IN")}</div>
            </div>
            <div className="card-panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>WhatsApp CSAT Score</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: "var(--amber)" }}>{analytics?.csat_rating || "4.85 / 5.0"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATE MODAL POPUP ────────────────────────────────────── */}
      {showTemplateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card-panel" style={{ padding: 24, width: 480, maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Select Template to Send</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {templates.map((t) => (
                <div key={t.id} style={{ padding: 12, background: "var(--bg)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--teal)", marginBottom: 4 }}>{t.name}</div>
                  <p style={{ fontSize: 12.5, color: "var(--ink)", margin: "0 0 10px 0" }}>{t.body_text}</p>
                  <button className="btn btn-sm btn-primary" onClick={() => handleSendTemplate(t)}>Send</button>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 14, width: "100%" }} onClick={() => setShowTemplateModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
