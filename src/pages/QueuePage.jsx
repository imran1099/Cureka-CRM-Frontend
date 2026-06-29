import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { SEGMENTS, SOURCES, OUTCOMES, OBJECTION_TYPES, SENTIMENTS, DECISION_STYLES, PRICE_SENSITIVITY } from "../lib/constants";
import { Phone, AlertCircle, CheckCircle2, X, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export default function QueuePage() {
  const [queue, setQueue] = useState([]);
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeCallId, setActiveCallId] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const params = segmentFilter !== "all" ? { segment: segmentFilter } : {};
      const res = await api.getQueue(params);
      setQueue(res.queue);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [segmentFilter]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleLogged = async () => {
    setActiveCallId(null);
    showToast("Call logged");
    await loadQueue();
  };

  const todaysSold = queue.filter((c) => false).length; // placeholder, real stat comes from overview if needed

  return (
    <div style={{ padding: "24px 28px", maxWidth: 880 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>Today's call queue</h1>
        <button onClick={loadQueue} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--slate-border)", borderRadius: 8, padding: "6px 11px", fontSize: 12.5, color: "var(--slate)", fontWeight: 600 }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 18px" }}>
        Ranked automatically. Work top to bottom — the order already accounts for urgency and value.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <FilterChip active={segmentFilter === "all"} onClick={() => setSegmentFilter("all")} label="All" />
        {Object.entries(SEGMENTS).map(([key, seg]) => (
          <FilterChip key={key} active={segmentFilter === key} onClick={() => setSegmentFilter(key)} label={seg.label} color={seg.color} />
        ))}
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: 14, padding: "40px 0" }}>Loading queue…</div>
      ) : queue.length === 0 ? (
        <EmptyQueue />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {queue.map((c, idx) => (
            <CustomerCard
              key={c.id}
              customer={c}
              rank={idx + 1}
              isActive={activeCallId === c.id}
              onStartCall={() => setActiveCallId(c.id)}
              onCloseCall={() => setActiveCallId(null)}
              onLogged={handleLogged}
              onViewProfile={() => navigate(`/customers/${c.id}`)}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}

function EmptyQueue() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
      <CheckCircle2 size={32} style={{ marginBottom: 10, opacity: 0.5 }} />
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--slate)" }}>Queue clear</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>Nobody left to call in this view right now.</div>
    </div>
  );
}

function FilterChip({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        padding: "7px 13px",
        borderRadius: 20,
        border: active ? "1px solid transparent" : "1px solid var(--slate-border)",
        background: active ? color || "var(--teal)" : "#fff",
        color: active ? "#fff" : "var(--slate)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function CustomerCard({ customer, rank, isActive, onStartCall, onCloseCall, onLogged, onViewProfile }) {
  const seg = SEGMENTS[customer.segment] || SEGMENTS.new_lead;
  const Icon = seg.icon;
  const isUrgent = customer.score > 150;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1px solid ${isActive ? seg.color : "var(--card-border)"}`,
        boxShadow: isActive ? `0 0 0 3px ${seg.bg}` : "0 1px 2px rgba(0,0,0,0.03)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", width: 20, paddingTop: 2 }}>
          {rank}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button onClick={onViewProfile} style={{ background: "none", border: "none", padding: 0, fontWeight: 700, fontSize: 15.5, color: "var(--ink)", display: "flex", alignItems: "center", gap: 4 }}>
              {customer.name} <ExternalLink size={12} style={{ opacity: 0.4 }} />
            </button>
            {isUrgent && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--amber)", background: "var(--amber-light)", borderRadius: 6, padding: "1px 6px", display: "flex", alignItems: "center", gap: 3 }}>
                <AlertCircle size={10} /> PRIORITY
              </span>
            )}
          </div>

          <div className="tabular" style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>
            {customer.phone} · LTV ₹{Number(customer.ltv).toLocaleString("en-IN")} · {SOURCES[customer.source] || customer.source}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12.5, fontWeight: 600, color: seg.color, background: seg.bg, border: `1px solid ${seg.border}`, borderRadius: 8, padding: "5px 10px" }}>
            <Icon size={13} />
            {customer.reason}
          </div>
        </div>

        {!isActive && (
          <button onClick={onStartCall} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, background: "var(--teal)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 700 }}>
            <Phone size={14} /> Call
          </button>
        )}
      </div>

      {isActive && <CallPanel customer={customer} onClose={onCloseCall} onLogged={onLogged} />}
    </div>
  );
}

function CallPanel({ customer, onClose, onLogged }) {
  const [outcome, setOutcome] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [callbackDate, setCallbackDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    // Use local time for datetime-local (toISOString is UTC, so let's adjust or just use slice for simplicity if time zone doesn't matter, but it's better to format properly)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Structured signals — collapsed by default for fast outcomes, but encouraged for substantive calls
  const [showDetail, setShowDetail] = useState(false);
  const [objectionType, setObjectionType] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [decisionStyle, setDecisionStyle] = useState(null);
  const [interestLevel, setInterestLevel] = useState(null);
  const [priceSensitivity, setPriceSensitivity] = useState(null);

  const handleSubmit = async () => {
    if (!outcome) {
      setError("Select an outcome first");
      return;
    }
    if (outcome === "sold" && !saleAmount) {
      setError("Enter the sale amount");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.logCall(customer.id, {
        outcome,
        remarks: remarks.trim() || null,
        sale_amount: outcome === "sold" ? Number(saleAmount) : null,
        callback_date: outcome === "callback" ? callbackDate : null,
        objection_type: objectionType,
        sentiment,
        decision_style: decisionStyle,
        interest_level: interestLevel,
        price_sensitivity: priceSensitivity,
      });
      onLogged();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Outcomes where structured detail is most valuable — auto-expand for these
  const substantive = ["sold", "callback", "notinterested"].includes(outcome);

  return (
    <div style={{ borderTop: "1px solid #F1EFE9", padding: "14px 16px", background: "#FBFAF7" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)" }}>Log this call</span>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)" }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {OUTCOMES.map((o) => {
          const OIcon = o.icon;
          const selected = outcome === o.key;
          return (
            <button
              key={o.key}
              onClick={() => setOutcome(o.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: 9,
                border: `1px solid ${o.color}`,
                background: selected ? o.color : "#fff",
                color: selected ? "#fff" : o.color,
              }}
            >
              <OIcon size={13} /> {o.label}
            </button>
          );
        })}
      </div>

      {outcome === "sold" && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--slate)", display: "block", marginBottom: 4 }}>Sale amount (₹)</label>
          <input
            type="number"
            value={saleAmount}
            onChange={(e) => setSaleAmount(e.target.value)}
            placeholder="0"
            style={{ width: 160, fontSize: 13.5, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--slate-border)" }}
          />
        </div>
      )}

      {outcome === "callback" && (
        <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600 }}>Follow up on:</label>
          <input
            type="datetime-local"
            value={callbackDate}
            onChange={(e) => setCallbackDate(e.target.value)}
            style={{ fontSize: 12.5, border: "1px solid var(--slate-border)", borderRadius: 6, padding: "5px 9px" }}
          />
        </div>
      )}

      {outcome && (
        <button
          onClick={() => setShowDetail((s) => !s)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--teal)",
            background: "none",
            border: "none",
            padding: "4px 0",
            marginBottom: 8,
          }}
        >
          {showDetail ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showDetail ? "Hide details" : "Add more detail"}
          {substantive && !showDetail && (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--amber)", background: "var(--amber-light)", borderRadius: 5, padding: "1px 5px", marginLeft: 2 }}>
              RECOMMENDED
            </span>
          )}
        </button>
      )}

      {showDetail && (
        <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 10, padding: 12, marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <DetailRow label="Objection (if any)">
            <ChipSelect options={OBJECTION_TYPES} value={objectionType} onChange={setObjectionType} />
          </DetailRow>
          <DetailRow label="Customer sentiment">
            <ChipSelect
              options={SENTIMENTS.map((s) => ({ key: s.key, label: s.label, color: s.color }))}
              value={sentiment}
              onChange={setSentiment}
              colored
            />
          </DetailRow>
          <DetailRow label="Decision style">
            <ChipSelect options={DECISION_STYLES} value={decisionStyle} onChange={setDecisionStyle} />
          </DetailRow>
          <DetailRow label="Price sensitivity (updates customer profile)">
            <ChipSelect options={PRICE_SENSITIVITY} value={priceSensitivity} onChange={setPriceSensitivity} />
          </DetailRow>
          <DetailRow label="Interest level (1 = none, 5 = ready to buy)">
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setInterestLevel(interestLevel === n ? null : n)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: `1px solid ${interestLevel === n ? "var(--teal)" : "var(--slate-border)"}`,
                    background: interestLevel === n ? "var(--teal)" : "#fff",
                    color: interestLevel === n ? "#fff" : "var(--slate)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </DetailRow>
        </div>
      )}

      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--slate)", display: "block", marginBottom: 4 }}>Remarks</label>
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="What did the customer say? Any objections, preferences, or context for the next call…"
        rows={3}
        style={{ width: "100%", fontSize: 13.5, padding: "9px 11px", borderRadius: 9, border: "1px solid var(--slate-border)", resize: "vertical", fontFamily: "inherit" }}
      />

      {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginTop: 8 }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{ marginTop: 12, background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1 }}
      >
        {saving ? "Saving…" : "Save & continue"}
      </button>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 100 }}>
      {message}
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function ChipSelect({ options, value, onChange, colored }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const selected = value === o.key;
        const color = colored && o.color ? o.color : "var(--teal)";
        return (
          <button
            key={o.key}
            onClick={() => onChange(selected ? null : o.key)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 11px",
              borderRadius: 8,
              border: `1px solid ${selected ? color : "var(--slate-border)"}`,
              background: selected ? color : "#fff",
              color: selected ? "#fff" : "var(--slate)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
