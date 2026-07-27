import { Inbox, Plus } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data available",
  description = "There are no records to display at this moment.",
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "var(--card)",
        borderRadius: "var(--radius)",
        border: "1px dashed var(--card-border)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          marginBottom: 16,
        }}
      >
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--ink)" }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 360, marginBottom: actionLabel ? 20 : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          <Plus size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
