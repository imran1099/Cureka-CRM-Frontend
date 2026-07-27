import { useState } from "react";
import { Sparkles, X, MessageSquare, ShieldCheck, HeartPulse, Send, Copy, Check } from "lucide-react";
import { useToast } from "./Toast.jsx";

export function AIAssistantDrawer({ isOpen, onClose, contextData }) {
  const [activeTab, setActiveTab] = useState("smart-reply");
  const [replyPrompt, setReplyPrompt] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleGenerateReply = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedReply(
        `Hello ${contextData?.customerName || "Customer"},\n\nThank you for contacting CXP Support. I have reviewed your request regarding your recent order. Our logistics team has expedited the dispatch and your package is scheduled for delivery tomorrow.\n\nPlease let us know if you need any further assistance!\n\nBest regards,\nSupport Executive`
      );
      setIsGenerating(false);
      addToast("AI Smart Reply generated successfully!", "success");
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("Copied to clipboard!", "info");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.4)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--card)",
          height: "100vh",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "var(--teal)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={20} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>CXP AI Assistant</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sentiment & Summary Meter */}
        <div
          style={{
            padding: "16px 20px",
            background: "var(--bg)",
            borderBottom: "1px solid var(--card-border)",
            display: "flex",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, background: "var(--card)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>SENTIMENT</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--status-success-text)", fontWeight: 700, fontSize: 13 }}>
              <HeartPulse size={16} />
              Positive (84%)
            </div>
          </div>
          <div style={{ flex: 1, background: "var(--card)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>INTENT</div>
            <div style={{ color: "var(--teal)", fontWeight: 700, fontSize: 13 }}>Order Inquiry</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--card-border)", background: "var(--card)" }}>
          <button
            onClick={() => setActiveTab("smart-reply")}
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              borderBottom: activeTab === "smart-reply" ? "2px solid var(--teal)" : "2px solid transparent",
              color: activeTab === "smart-reply" ? "var(--teal)" : "var(--muted)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Smart Reply
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              borderBottom: activeTab === "summary" ? "2px solid var(--teal)" : "2px solid transparent",
              color: activeTab === "summary" ? "var(--teal)" : "var(--muted)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Ticket Summary
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }} className="scrollbar-thin">
          {activeTab === "smart-reply" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                  Tone & Specific Instructions:
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="e.g. Empathetic tone, confirm delivery date tomorrow..."
                  value={replyPrompt}
                  onChange={(e) => setReplyPrompt(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={handleGenerateReply} disabled={isGenerating}>
                <Sparkles size={16} />
                {isGenerating ? "Generating with AI..." : "Generate AI Reply"}
              </button>

              {generatedReply && (
                <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: 14, border: "1px solid var(--card-border)", position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", marginBottom: 8 }}>AI SUGGESTED RESPONSE</div>
                  <p style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{generatedReply}</p>
                  <button
                    onClick={handleCopy}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 12, width: "100%" }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy Suggested Reply"}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "summary" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--bg)", padding: 14, borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Key Customer Request</h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Customer called inquiring about delay in shipment for order #ORD-8921. Reassured them delivery is expected within 24 hours.
                </p>
              </div>

              <div style={{ background: "var(--bg)", padding: 14, borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Recommended Actions</h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-secondary)" }}>
                  <li>Flag order priority to High in Shopify sync.</li>
                  <li>Schedule SMS update upon dispatch.</li>
                  <li>Follow up in 24 hours if undelivered.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
