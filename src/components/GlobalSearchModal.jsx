import { useState, useEffect } from "react";
import { Search, User, Ticket, ShoppingBag, ArrowRight, Star, Shield, Phone, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery("");
          setResults([]);
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/customers/search?q=${encodeURIComponent(query)}`);
        setResults(res.results || []);
      } catch (err) {
        console.error("Global autocomplete search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "8vh",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid var(--card-border)",
            background: "var(--bg-surface)",
          }}
        >
          <Search size={20} style={{ color: "var(--teal)" }} />
          <input
            type="text"
            autoFocus
            placeholder="Search by Mobile #, Email, Name, Order ID, Shopify #, AWB, Tracking #, Invoice #, Ticket ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 15.5,
              color: "var(--ink)",
              outline: "none",
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-sm)",
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </div>

        {/* Search Input Filter Badges Subheader */}
        <div
          style={{
            padding: "8px 20px",
            background: "var(--bg)",
            borderBottom: "1px solid var(--card-border)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span>SEARCHABLE INPUTS:</span>
          <span className="badge badge-info" style={{ fontSize: 10 }}>Phone</span>
          <span className="badge badge-info" style={{ fontSize: 10 }}>Email</span>
          <span className="badge badge-info" style={{ fontSize: 10 }}>Order #</span>
          <span className="badge badge-info" style={{ fontSize: 10 }}>Shopify #</span>
          <span className="badge badge-info" style={{ fontSize: 10 }}>AWB / Tracking</span>
          <span className="badge badge-info" style={{ fontSize: 10 }}>Ticket ID</span>
        </div>

        {/* Autocomplete Results Stream */}
        <div style={{ maxHeight: 440, overflowY: "auto", padding: 12 }} className="scrollbar-thin">
          {loading && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>
              Searching CRM database & index...
            </div>
          )}

          {!loading && !query.trim() && (
            <div style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
              <Search size={34} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13.5, fontWeight: 500 }}>
                Type a mobile number, order ID, AWB, email, or customer name.
              </p>
              <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Real-time search takes &lt; 1 second and provides instant Customer 360° profile access.
              </p>
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div style={{ padding: 36, textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>
              No matching customers or orders found for "{query}".
            </div>
          )}

          {!loading && results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", paddingLeft: 6 }}>
                MATCHING CUSTOMER PROFILES ({results.length})
              </div>

              {results.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    navigate(`/customers/${c.id}`);
                    onClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: 14,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "var(--card-shadow)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg)";
                    e.currentTarget.style.borderColor = "var(--teal)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--card)";
                    e.currentTarget.style.borderColor = "var(--card-border)";
                  }}
                >
                  {/* Avatar Icon */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: c.is_vip ? "var(--amber-light)" : "var(--teal-light)",
                      color: c.is_vip ? "var(--amber)" : "var(--teal)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {c.name?.charAt(0) || "C"}
                  </div>

                  {/* Customer Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>{c.name}</span>
                      {c.is_vip ? (
                        <span className="badge badge-pending" style={{ fontSize: 11 }}>
                          <Star size={11} /> VIP Customer
                        </span>
                      ) : null}
                      <span className="badge badge-info" style={{ fontSize: 10.5 }}>
                        {c.brand_name || "Cureka"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={12} /> {c.phone || "No phone"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={12} /> {c.email || "No email"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11.5, fontWeight: 600 }}>
                      <span style={{ color: "var(--teal)" }}>
                        ₹{Number(c.total_spend || 0).toLocaleString("en-IN")} LTV
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {c.order_count || 0} Total Orders
                      </span>
                      {c.latest_order_status && (
                        <span style={{ color: "var(--status-success-text)" }}>
                          Latest Status: {c.latest_order_status}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight size={18} style={{ color: "var(--teal)", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
