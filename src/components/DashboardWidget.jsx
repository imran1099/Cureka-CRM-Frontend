import { useState } from "react";
import { Pin, EyeOff, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function DashboardWidget({
  id,
  title,
  subtitle,
  icon: Icon,
  value,
  trend,
  trendLabel,
  statusColor = "teal",
  isPinned,
  onTogglePin,
  onHide,
  children,
}) {
  const [showOptions, setShowOptions] = useState(false);

  const statusMap = {
    teal: { bg: "var(--teal-light)", text: "var(--teal)", border: "var(--teal-border)" },
    amber: { bg: "var(--status-pending-bg)", text: "var(--status-pending-text)", border: "var(--status-pending-border)" },
    coral: { bg: "var(--status-critical-bg)", text: "var(--status-critical-text)", border: "var(--status-critical-border)" },
    success: { bg: "var(--status-success-bg)", text: "var(--status-success-text)", border: "var(--status-success-border)" },
    info: { bg: "var(--status-info-bg)", text: "var(--status-info-text)", border: "var(--status-info-border)" },
  };

  const styleTheme = statusMap[statusColor] || statusMap.teal;

  return (
    <div
      className="card-panel"
      style={{
        padding: 20,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderTop: isPinned ? `3px solid ${styleTheme.text}` : undefined,
      }}
    >
      {/* Widget Header Bar */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: styleTheme.bg,
                color: styleTheme.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </div>
          )}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{title}</h4>
            {subtitle && <div style={{ fontSize: 12, color: "var(--muted)" }}>{subtitle}</div>}
          </div>
        </div>

        {/* Action Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowOptions((prev) => !prev)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <MoreHorizontal size={16} />
          </button>

          {showOptions && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--card-shadow-hover)",
                padding: 4,
                zIndex: 40,
                width: 130,
              }}
            >
              <button
                onClick={() => {
                  onTogglePin && onTogglePin(id);
                  setShowOptions(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  padding: "6px 10px",
                  fontSize: 12,
                  color: "var(--ink)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Pin size={13} />
                {isPinned ? "Unpin" : "Pin Widget"}
              </button>
              <button
                onClick={() => {
                  onHide && onHide(id);
                  setShowOptions(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  padding: "6px 10px",
                  fontSize: 12,
                  color: "var(--status-critical-text)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <EyeOff size={13} />
                Hide Widget
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Value & Trend */}
      {value != null && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{value}</div>
          {trend != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, fontWeight: 600 }}>
              {trend >= 0 ? (
                <span style={{ color: "var(--status-success-text)", display: "flex", alignItems: "center" }}>
                  <ArrowUpRight size={14} />+{trend}%
                </span>
              ) : (
                <span style={{ color: "var(--status-critical-text)", display: "flex", alignItems: "center" }}>
                  <ArrowDownRight size={14} />{trend}%
                </span>
              )}
              {trendLabel && <span style={{ color: "var(--muted)", fontWeight: 400 }}>{trendLabel}</span>}
            </div>
          )}
        </div>
      )}

      {/* Children Custom Rendering */}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}
